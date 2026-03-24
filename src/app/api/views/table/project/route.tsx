import { withApiWrapper } from "app/api/apiClient";
import { apiSuccess } from "app/api/response";
import { db } from "db/client";
import { dbV3 } from "db/client_v3";
import { tableViewProject } from "db/schemas/core-table-view";
import { j_project_institution } from "db/schemas/core-junctions";
import { tableViewProjectV3, relationV3 } from "db/schemas/core_v3";
import {
  and,
  arrayOverlaps,
  asc,
  desc,
  gt,
  gte,
  inArray,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { NextRequest } from "next/server";

export interface ProjectSearchParams {
  search?: string;

  minYear?: number;
  maxYear?: number;

  topicIds?: string[];
  subfieldIds?: string[];
  fieldIds?: string[];
  domainIds?: string[];

  frameworkProgrammes?: string[];

  institutionId?: string;
  collaboratorId?: string;
  projectIds?: string[];

  isCh?: boolean;

  page?: number;
  limit?: number;

  sortBy?: "title" | "start_date" | "relevance";
  sortOrder?: "asc" | "desc";

  download?: boolean;
}

// v2 institution IDs are text strings (e.g. "cordis_999...").
// v3 organization IDs are pure numeric strings.
function isLegacyId(id: string): boolean {
  return !/^\d+$/.test(id);
}

// ─── V2 legacy path (used when arriving from the map-view infopanel) ──────────

async function runV2Query(params: ProjectSearchParams) {
  const whereConditions = [];

  if (params.search) {
    const searchQuery = params.search.replace(/\s+/g, " | ");
    whereConditions.push(
      sql`(
        setweight(to_tsvector('english', COALESCE(${tableViewProject.title}, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(${tableViewProject.objective}, '')), 'B')
      ) @@ to_tsquery('english', ${searchQuery})`,
    );
  }

  if (params.minYear || params.maxYear) {
    const yearConditions = [];
    if (params.minYear && params.maxYear) {
      yearConditions.push(
        or(
          and(
            gte(sql`EXTRACT(YEAR FROM ${tableViewProject.start_date})`, params.minYear),
            lte(sql`EXTRACT(YEAR FROM ${tableViewProject.start_date})`, params.maxYear),
          ),
          and(
            gte(sql`EXTRACT(YEAR FROM ${tableViewProject.end_date})`, params.minYear),
            lte(sql`EXTRACT(YEAR FROM ${tableViewProject.end_date})`, params.maxYear),
          ),
        ),
      );
    } else if (params.minYear) {
      yearConditions.push(
        or(
          gte(sql`EXTRACT(YEAR FROM ${tableViewProject.start_date})`, params.minYear),
          gte(sql`EXTRACT(YEAR FROM ${tableViewProject.end_date})`, params.minYear),
        ),
      );
    } else if (params.maxYear) {
      yearConditions.push(
        or(
          lte(sql`EXTRACT(YEAR FROM ${tableViewProject.start_date})`, params.maxYear),
          lte(sql`EXTRACT(YEAR FROM ${tableViewProject.end_date})`, params.maxYear),
        ),
      );
    }
    if (yearConditions.length > 0) whereConditions.push(...yearConditions);
  }

  if (params.topicIds?.length)
    whereConditions.push(inArray(tableViewProject.topic_id, params.topicIds));
  if (params.subfieldIds?.length)
    whereConditions.push(inArray(tableViewProject.subfield_id, params.subfieldIds));
  if (params.fieldIds?.length)
    whereConditions.push(inArray(tableViewProject.field_id, params.fieldIds));
  if (params.domainIds?.length)
    whereConditions.push(inArray(tableViewProject.domain_id, params.domainIds));

  if (params.frameworkProgrammes?.length) {
    whereConditions.push(
      arrayOverlaps(tableViewProject.framework_programmes, params.frameworkProgrammes),
    );
  }

  if (params.institutionId) {
    whereConditions.push(
      inArray(
        tableViewProject.id,
        db
          .select({ project_id: j_project_institution.project_id })
          .from(j_project_institution)
          .where(sql`${j_project_institution.institution_id} = ${params.institutionId}`),
      ),
    );
  }

  if (params.collaboratorId) {
    whereConditions.push(
      inArray(
        tableViewProject.id,
        db
          .select({ project_id: j_project_institution.project_id })
          .from(j_project_institution)
          .where(sql`${j_project_institution.institution_id} = ${params.collaboratorId}`),
      ),
    );
  }

  if (params.projectIds?.length)
    whereConditions.push(inArray(tableViewProject.id, params.projectIds));

  let querySelect = db.select({
    id: tableViewProject.id,
    title: tableViewProject.title,
    start_date: tableViewProject.start_date,
    end_date: tableViewProject.end_date,
    acronym: tableViewProject.acronym,
  });

  if (params.search) {
    const searchQuery = params.search.replace(/\s+/g, " | ");
    querySelect = db.select({
      id: tableViewProject.id,
      title: tableViewProject.title,
      start_date: tableViewProject.start_date,
      end_date: tableViewProject.end_date,
      acronym: tableViewProject.acronym,
      rank: sql<number>`ts_rank(
        setweight(to_tsvector('english', COALESCE(${tableViewProject.title}, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(${tableViewProject.objective}, '')), 'B'),
        to_tsquery('english', ${searchQuery})
      )`.as("rank"),
    });
  }

  const baseQuery = querySelect.from(tableViewProject);
  const queryWhere =
    whereConditions.length > 0 ? baseQuery.where(and(...whereConditions)) : baseQuery;

  const query =
    params.sortBy === "relevance"
      ? params.search
        ? queryWhere.orderBy(desc(sql`rank`), sql`${tableViewProject.total_cost} DESC NULLS LAST`)
        : queryWhere.orderBy(sql`${tableViewProject.total_cost} DESC NULLS LAST`)
      : (() => {
          const sortColumn =
            params.sortBy === "title" ? tableViewProject.title : tableViewProject.start_date;
          return queryWhere.orderBy(
            params.sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn),
          );
        })();

  const offset = (params.page ?? 0) * (params.limit ?? 50);
  const data = await query.limit(params.limit ?? 50).offset(offset);

  const countBase = db.select({ count: sql<number>`count(*)` }).from(tableViewProject);
  const [{ count: totalCount }] = await (
    whereConditions.length > 0 ? countBase.where(and(...whereConditions)) : countBase
  );

  return { data, totalCount };
}

// ─── V3 path (default) ────────────────────────────────────────────────────────

async function runV3Query(params: ProjectSearchParams) {
  const whereConditions = [];

  if (params.search) {
    const searchQuery = params.search.replace(/\s+/g, " | ");
    whereConditions.push(
      sql`(
        setweight(to_tsvector('english', COALESCE(${tableViewProjectV3.title}, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(${tableViewProjectV3.summary}, '')), 'B')
      ) @@ to_tsquery('english', ${searchQuery})`,
    );
  }

  if (params.minYear || params.maxYear) {
    const yearConditions = [];
    if (params.minYear && params.maxYear) {
      yearConditions.push(
        or(
          and(
            gte(sql`EXTRACT(YEAR FROM ${tableViewProjectV3.start_date})`, params.minYear),
            lte(sql`EXTRACT(YEAR FROM ${tableViewProjectV3.start_date})`, params.maxYear),
          ),
          and(
            gte(sql`EXTRACT(YEAR FROM ${tableViewProjectV3.end_date})`, params.minYear),
            lte(sql`EXTRACT(YEAR FROM ${tableViewProjectV3.end_date})`, params.maxYear),
          ),
        ),
      );
    } else if (params.minYear) {
      yearConditions.push(
        or(
          gte(sql`EXTRACT(YEAR FROM ${tableViewProjectV3.start_date})`, params.minYear),
          gte(sql`EXTRACT(YEAR FROM ${tableViewProjectV3.end_date})`, params.minYear),
        ),
      );
    } else if (params.maxYear) {
      yearConditions.push(
        or(
          lte(sql`EXTRACT(YEAR FROM ${tableViewProjectV3.start_date})`, params.maxYear),
          lte(sql`EXTRACT(YEAR FROM ${tableViewProjectV3.end_date})`, params.maxYear),
        ),
      );
    }
    if (yearConditions.length > 0) whereConditions.push(...yearConditions);
  }

  if (params.topicIds?.length)
    whereConditions.push(inArray(tableViewProjectV3.topic_id, params.topicIds.map(Number)));
  if (params.subfieldIds?.length)
    whereConditions.push(inArray(tableViewProjectV3.subfield_id, params.subfieldIds));
  if (params.fieldIds?.length)
    whereConditions.push(inArray(tableViewProjectV3.field_id, params.fieldIds));
  if (params.domainIds?.length)
    whereConditions.push(inArray(tableViewProjectV3.domain_id, params.domainIds));

  if (params.frameworkProgrammes?.length) {
    whereConditions.push(
      arrayOverlaps(tableViewProjectV3.framework_programmes, params.frameworkProgrammes),
    );
  }

  if (params.institutionId) {
    whereConditions.push(
      inArray(
        tableViewProjectV3.id,
        dbV3
          .select({ id: relationV3.target })
          .from(relationV3)
          .where(
            and(
              sql`${relationV3.source} = ${params.institutionId}`,
              sql`${relationV3.sourceType} = 'organization'`,
              sql`${relationV3.targetType} = 'project'`,
            ),
          ),
      ),
    );
  }

  if (params.collaboratorId) {
    whereConditions.push(
      inArray(
        tableViewProjectV3.id,
        dbV3
          .select({ id: relationV3.target })
          .from(relationV3)
          .where(
            and(
              sql`${relationV3.source} = ${params.collaboratorId}`,
              sql`${relationV3.sourceType} = 'organization'`,
              sql`${relationV3.targetType} = 'project'`,
            ),
          ),
      ),
    );
  }

  if (params.projectIds?.length)
    whereConditions.push(inArray(tableViewProjectV3.id, params.projectIds));

  if (params.isCh)
    whereConditions.push(gt(tableViewProjectV3.pred, 0.2));

  let querySelect = dbV3.select({
    id: tableViewProjectV3.id,
    title: tableViewProjectV3.title,
    start_date: tableViewProjectV3.start_date,
    end_date: tableViewProjectV3.end_date,
    acronym: tableViewProjectV3.acronym,
  });

  if (params.search) {
    const searchQuery = params.search.replace(/\s+/g, " | ");
    querySelect = dbV3.select({
      id: tableViewProjectV3.id,
      title: tableViewProjectV3.title,
      start_date: tableViewProjectV3.start_date,
      end_date: tableViewProjectV3.end_date,
      acronym: tableViewProjectV3.acronym,
      rank: sql<number>`ts_rank(
        setweight(to_tsvector('english', COALESCE(${tableViewProjectV3.title}, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(${tableViewProjectV3.summary}, '')), 'B'),
        to_tsquery('english', ${searchQuery})
      )`.as("rank"),
    });
  }

  if (params.download) {
    querySelect = dbV3.select({
      id: tableViewProjectV3.id,
      title: tableViewProjectV3.title,
      acronym: tableViewProjectV3.acronym,
      start_date: tableViewProjectV3.start_date,
      end_date: tableViewProjectV3.end_date,
      summary: tableViewProjectV3.summary,
      total_cost: tableViewProjectV3.total_cost,
      funded_amount: tableViewProjectV3.funded_amount,
      currency: tableViewProjectV3.currency,
      keywords: tableViewProjectV3.keywords,
      framework_programmes: tableViewProjectV3.framework_programmes,
    });
  }

  const baseQuery = querySelect.from(tableViewProjectV3);
  const queryWhere =
    whereConditions.length > 0 ? baseQuery.where(and(...whereConditions)) : baseQuery;

  const query =
    params.sortBy === "relevance"
      ? params.search
        ? queryWhere.orderBy(desc(sql`rank`), sql`${tableViewProjectV3.total_cost} DESC NULLS LAST`)
        : queryWhere.orderBy(sql`${tableViewProjectV3.total_cost} DESC NULLS LAST`)
      : (() => {
          const sortColumn =
            params.sortBy === "title" ? tableViewProjectV3.title : tableViewProjectV3.start_date;
          return queryWhere.orderBy(
            params.sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn),
          );
        })();

  const offset = (params.page ?? 0) * (params.limit ?? 50);
  const data = await query.limit(params.limit ?? 50).offset(offset);

  const countBase = dbV3.select({ count: sql<number>`count(*)` }).from(tableViewProjectV3);
  const [{ count: totalCount }] = await (
    whereConditions.length > 0
      ? countBase.where(and(...whereConditions))
      : countBase
  );

  return { data, totalCount };
}

// ─── Handler ──────────────────────────────────────────────────────────────────

async function tableViewProjectHandler(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const params: ProjectSearchParams = {
    search: searchParams.get("search") || undefined,
    minYear: searchParams.get("minYear") ? parseInt(searchParams.get("minYear")!) : undefined,
    maxYear: searchParams.get("maxYear") ? parseInt(searchParams.get("maxYear")!) : undefined,
    topicIds: searchParams.get("topicIds")?.split(",").filter(Boolean) || [],
    subfieldIds: searchParams.get("subfieldIds")?.split(",").filter(Boolean) || [],
    fieldIds: searchParams.get("fieldIds")?.split(",").filter(Boolean) || [],
    domainIds: searchParams.get("domainIds")?.split(",").filter(Boolean) || [],
    frameworkProgrammes: searchParams.get("frameworkProgrammes")?.split(",").filter(Boolean) || [],
    institutionId: searchParams.get("institutionId") || undefined,
    collaboratorId: searchParams.get("collaboratorId") || undefined,
    projectIds: searchParams.get("projectIds")?.split(",").filter(Boolean) || [],
    isCh: searchParams.get("isCh") === "true" ? true : undefined,
    page: parseInt(searchParams.get("page") || "0"),
    limit: Math.min(
      parseInt(searchParams.get("limit") || "50"),
      searchParams.get("download") === "true" ? 10000 : 100,
    ),
    sortBy: (searchParams.get("sortBy") as any) || "title",
    sortOrder: (searchParams.get("sortOrder") as any) || "asc",
    download: searchParams.get("download") === "true" || false,
  };

  if (!params.limit) params.limit = 50;
  if (!params.page) params.page = 0;

  // If the institution/collaborator ID is a v2 text ID, fall back to v2 data.
  const useV2 =
    (params.institutionId && isLegacyId(params.institutionId)) ||
    (params.collaboratorId && isLegacyId(params.collaboratorId));

  const { data, totalCount } = useV2
    ? await runV2Query(params)
    : await runV3Query(params);

  return apiSuccess({
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / params.limit),
    },
    filters: params,
  });
}

export const GET = withApiWrapper(tableViewProjectHandler);
