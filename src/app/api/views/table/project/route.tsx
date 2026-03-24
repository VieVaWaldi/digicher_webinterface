import { withApiWrapper } from "app/api/apiClient";
import { apiSuccess } from "app/api/response";
import { dbV3 } from "db/client_v3";
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

async function tableViewProjectHandler(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const params: ProjectSearchParams = {
    search: searchParams.get("search") || undefined,
    minYear: searchParams.get("minYear")
      ? parseInt(searchParams.get("minYear")!)
      : undefined,
    maxYear: searchParams.get("maxYear")
      ? parseInt(searchParams.get("maxYear")!)
      : undefined,
    topicIds: searchParams.get("topicIds")?.split(",").filter(Boolean) || [],
    subfieldIds:
      searchParams.get("subfieldIds")?.split(",").filter(Boolean) || [],
    fieldIds: searchParams.get("fieldIds")?.split(",").filter(Boolean) || [],
    domainIds: searchParams.get("domainIds")?.split(",").filter(Boolean) || [],
    frameworkProgrammes:
      searchParams.get("frameworkProgrammes")?.split(",").filter(Boolean) || [],
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
            gte(
              sql`EXTRACT(YEAR FROM ${tableViewProjectV3.start_date})`,
              params.minYear,
            ),
            lte(
              sql`EXTRACT(YEAR FROM ${tableViewProjectV3.start_date})`,
              params.maxYear,
            ),
          ),
          and(
            gte(
              sql`EXTRACT(YEAR FROM ${tableViewProjectV3.end_date})`,
              params.minYear,
            ),
            lte(
              sql`EXTRACT(YEAR FROM ${tableViewProjectV3.end_date})`,
              params.maxYear,
            ),
          ),
        ),
      );
    } else if (params.minYear) {
      yearConditions.push(
        or(
          gte(
            sql`EXTRACT(YEAR FROM ${tableViewProjectV3.start_date})`,
            params.minYear,
          ),
          gte(
            sql`EXTRACT(YEAR FROM ${tableViewProjectV3.end_date})`,
            params.minYear,
          ),
        ),
      );
    } else if (params.maxYear) {
      yearConditions.push(
        or(
          lte(
            sql`EXTRACT(YEAR FROM ${tableViewProjectV3.start_date})`,
            params.maxYear,
          ),
          lte(
            sql`EXTRACT(YEAR FROM ${tableViewProjectV3.end_date})`,
            params.maxYear,
          ),
        ),
      );
    }

    if (yearConditions.length > 0) {
      whereConditions.push(...yearConditions);
    }
  }

  if (params.topicIds && params.topicIds.length > 0) {
    whereConditions.push(inArray(tableViewProjectV3.topic_id, params.topicIds.map(Number)));
  }
  if (params.subfieldIds && params.subfieldIds.length > 0) {
    whereConditions.push(
      inArray(tableViewProjectV3.subfield_id, params.subfieldIds),
    );
  }
  if (params.fieldIds && params.fieldIds.length > 0) {
    whereConditions.push(inArray(tableViewProjectV3.field_id, params.fieldIds));
  }
  if (params.domainIds && params.domainIds.length > 0) {
    whereConditions.push(inArray(tableViewProjectV3.domain_id, params.domainIds));
  }

  if (params.frameworkProgrammes && params.frameworkProgrammes.length > 0) {
    whereConditions.push(
      arrayOverlaps(
        tableViewProjectV3.framework_programmes,
        params.frameworkProgrammes,
      ),
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

  if (params.projectIds && params.projectIds.length > 0) {
    whereConditions.push(inArray(tableViewProjectV3.id, params.projectIds));
  }

  if (params.isCh) {
    whereConditions.push(gt(tableViewProjectV3.pred, 0.2));
  }

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
    whereConditions.length > 0
      ? baseQuery.where(and(...whereConditions))
      : baseQuery;

  const query =
    params.sortBy === "relevance"
      ? params.search
        ? queryWhere.orderBy(desc(sql`rank`), sql`${tableViewProjectV3.total_cost} DESC NULLS LAST`)
        : queryWhere.orderBy(sql`${tableViewProjectV3.total_cost} DESC NULLS LAST`)
      : (() => {
          const sortColumn =
            params.sortBy === "title"
              ? tableViewProjectV3.title
              : tableViewProjectV3.start_date;
          return queryWhere.orderBy(
            params.sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn),
          );
        })();

  if (!params.limit) {
    params.limit = 50;
  }
  if (!params.page) {
    params.page = 0;
  }

  const offset = params.page * params.limit;
  const finalQuery = query.limit(params.limit).offset(offset);
  const data = await finalQuery;

  const countQuery =
    whereConditions.length > 0
      ? dbV3
          .select({ count: sql<number>`count(*)` })
          .from(tableViewProjectV3)
          .where(and(...whereConditions))
      : dbV3.select({ count: sql<number>`count(*)` }).from(tableViewProjectV3);

  const [{ count: totalCount }] = await countQuery;

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
