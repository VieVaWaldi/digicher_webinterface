import { withApiWrapper } from "app/api/apiClient";
import { apiSuccess } from "app/api/response";
import { db } from "db/client";
import { tableViewProject } from "db/schemas/core";
import {
  and,
  arrayOverlaps,
  asc,
  desc,
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
            gte(
              sql`EXTRACT(YEAR FROM ${tableViewProject.start_date})`,
              params.minYear,
            ),
            lte(
              sql`EXTRACT(YEAR FROM ${tableViewProject.start_date})`,
              params.maxYear,
            ),
          ),
          and(
            gte(
              sql`EXTRACT(YEAR FROM ${tableViewProject.end_date})`,
              params.minYear,
            ),
            lte(
              sql`EXTRACT(YEAR FROM ${tableViewProject.end_date})`,
              params.maxYear,
            ),
          ),
        ),
      );
    } else if (params.minYear) {
      yearConditions.push(
        or(
          gte(
            sql`EXTRACT(YEAR FROM ${tableViewProject.start_date})`,
            params.minYear,
          ),
          gte(
            sql`EXTRACT(YEAR FROM ${tableViewProject.end_date})`,
            params.minYear,
          ),
        ),
      );
    } else if (params.maxYear) {
      yearConditions.push(
        or(
          lte(
            sql`EXTRACT(YEAR FROM ${tableViewProject.start_date})`,
            params.maxYear,
          ),
          lte(
            sql`EXTRACT(YEAR FROM ${tableViewProject.end_date})`,
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
    whereConditions.push(inArray(tableViewProject.topic_id, params.topicIds));
  }
  if (params.subfieldIds && params.subfieldIds.length > 0) {
    whereConditions.push(
      inArray(tableViewProject.subfield_id, params.subfieldIds),
    );
  }
  if (params.fieldIds && params.fieldIds.length > 0) {
    whereConditions.push(inArray(tableViewProject.field_id, params.fieldIds));
  }
  if (params.domainIds && params.domainIds.length > 0) {
    whereConditions.push(inArray(tableViewProject.domain_id, params.domainIds));
  }

  if (params.frameworkProgrammes && params.frameworkProgrammes.length > 0) {
    whereConditions.push(
      arrayOverlaps(
        tableViewProject.framework_programmes,
        params.frameworkProgrammes,
      ),
    );
  }

  let querySelect = db.select({
    id: tableViewProject.id,
    title: tableViewProject.title,
    start_date: tableViewProject.start_date,
    acronym: tableViewProject.acronym,
  });

  if (params.search) {
    const searchQuery = params.search.replace(/\s+/g, " | ");
    querySelect = db.select({
      id: tableViewProject.id,
      title: tableViewProject.title,
      start_date: tableViewProject.start_date,
      acronym: tableViewProject.acronym,
      rank: sql<number>`ts_rank(
        setweight(to_tsvector('english', COALESCE(${tableViewProject.title}, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(${tableViewProject.objective}, '')), 'B'),
        to_tsquery('english', ${searchQuery})
      )`.as("rank"),
    });
  }

  if (params.download) {
    querySelect = db.select({
      id: tableViewProject.id,
      title: tableViewProject.title,
      acronym: tableViewProject.acronym,
      source: tableViewProject.source,
      doi: tableViewProject.doi,
      start_date: tableViewProject.start_date,
      end_date: tableViewProject.end_date,
      objective: tableViewProject.objective,
      total_cost: tableViewProject.total_cost,
      funded_amount: tableViewProject.funded_amount,
      currency: tableViewProject.currency,
      keywords: tableViewProject.keywords,
      framework_programmes: tableViewProject.framework_programmes,
    });
  }

  const baseQuery = querySelect.from(tableViewProject);

  const queryWhere =
    whereConditions.length > 0
      ? baseQuery.where(and(...whereConditions))
      : baseQuery;

  const query =
    params.search && params.sortBy === "relevance"
      ? queryWhere.orderBy(desc(sql`rank`))
      : (() => {
          const sortColumn =
            params.sortBy === "title"
              ? tableViewProject.title
              : tableViewProject.start_date;
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
      ? db
          .select({ count: sql<number>`count(*)` })
          .from(tableViewProject)
          .where(and(...whereConditions))
      : db.select({ count: sql<number>`count(*)` }).from(tableViewProject);

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
