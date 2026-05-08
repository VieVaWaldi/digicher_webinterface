import { withApiWrapper } from "app/api/apiClient";
import { apiSuccess } from "app/api/response";
import { dbV3 } from "db/client_v3";
import { tableViewWorkV3 } from "db/schemas/core_v3";
import { and, asc, desc, gte, lte, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

export interface ResearchOutputSearchParams {
  search?: string;
  minYear?: number;
  maxYear?: number;
  page?: number;
  limit?: number;
  sortBy?: "title" | "publication_date" | "relevance";
  sortOrder?: "asc" | "desc";
}

async function tableViewResearchOutputHandler(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const params: ResearchOutputSearchParams = {
    search: searchParams.get("search") || undefined,
    minYear: searchParams.get("minYear") ? parseInt(searchParams.get("minYear")!) : undefined,
    maxYear: searchParams.get("maxYear") ? parseInt(searchParams.get("maxYear")!) : undefined,
    page: parseInt(searchParams.get("page") || "0"),
    limit: Math.min(parseInt(searchParams.get("limit") || "50"), 100),
    sortBy: (searchParams.get("sortBy") as any) || "title",
    sortOrder: (searchParams.get("sortOrder") as any) || "asc",
  };

  const whereConditions = [];

  if (params.search) {
    const searchQuery = params.search.replace(/\s+/g, " | ");
    whereConditions.push(
      sql`"table_view_work".search_vector @@ to_tsquery('english', ${searchQuery})`,
    );
  }

  if (params.minYear) {
    whereConditions.push(
      gte(sql`EXTRACT(YEAR FROM ${tableViewWorkV3.publication_date})`, params.minYear),
    );
  }
  if (params.maxYear) {
    whereConditions.push(
      lte(sql`EXTRACT(YEAR FROM ${tableViewWorkV3.publication_date})`, params.maxYear),
    );
  }

  let querySelect = dbV3.select({
    id: tableViewWorkV3.id,
    title: tableViewWorkV3.title,
    publication_date: tableViewWorkV3.publication_date,
    doi: tableViewWorkV3.doi,
  });

  if (params.search) {
    const searchQuery = params.search.replace(/\s+/g, " | ");
    querySelect = dbV3.select({
      id: tableViewWorkV3.id,
      title: tableViewWorkV3.title,
      publication_date: tableViewWorkV3.publication_date,
      doi: tableViewWorkV3.doi,
      rank: sql<number>`ts_rank("table_view_work".search_vector, to_tsquery('english', ${searchQuery}))`.as("rank"),
    });
  }

  const baseQuery = querySelect.from(tableViewWorkV3);
  const queryWhere =
    whereConditions.length > 0 ? baseQuery.where(and(...whereConditions)) : baseQuery;

  const query =
    params.search && params.sortBy === "relevance"
      ? queryWhere.orderBy(desc(sql`rank`))
      : (() => {
          const sortColumn =
            params.sortBy === "title"
              ? tableViewWorkV3.title
              : tableViewWorkV3.publication_date;
          return queryWhere.orderBy(
            params.sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn),
          );
        })();

  if (!params.limit) params.limit = 50;
  if (!params.page) params.page = 0;

  const offset = params.page * params.limit;
  const data = await query.limit(params.limit).offset(offset);

  const countBase = dbV3.select({ count: sql<number>`count(*)` }).from(tableViewWorkV3);
  const [{ count: totalCount }] = await (
    whereConditions.length > 0 ? countBase.where(and(...whereConditions)) : countBase
  );

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

export const GET = withApiWrapper(tableViewResearchOutputHandler);