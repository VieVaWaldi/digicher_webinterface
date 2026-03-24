import { withApiWrapper } from "app/api/apiClient";
import { apiSuccess } from "app/api/response";
import { dbV3 } from "db/client_v3";
import { workV3 } from "db/schemas/core_v3";
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
    minYear: searchParams.get("minYear")
      ? parseInt(searchParams.get("minYear")!)
      : undefined,
    maxYear: searchParams.get("maxYear")
      ? parseInt(searchParams.get("maxYear")!)
      : undefined,
    page: parseInt(searchParams.get("page") || "0"),
    limit: Math.min(parseInt(searchParams.get("limit") || "50"), 100),
    sortBy: (searchParams.get("sortBy") as any) || "title",
    sortOrder: (searchParams.get("sortOrder") as any) || "asc",
  };

  const whereConditions = [];

  if (params.search) {
    const searchQuery = params.search.replace(/\s+/g, " | ");
    whereConditions.push(
      sql`(
        setweight(to_tsvector('english', COALESCE(${workV3.title}, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(${workV3.descriptions}, ' '), '')), 'B')
      ) @@ to_tsquery('english', ${searchQuery})`,
    );
  }

  if (params.minYear || params.maxYear) {
    const yearConditions = [];

    if (params.minYear && params.maxYear) {
      yearConditions.push(
        and(
          gte(
            sql`EXTRACT(YEAR FROM ${workV3.publicationDate})`,
            params.minYear,
          ),
          lte(
            sql`EXTRACT(YEAR FROM ${workV3.publicationDate})`,
            params.maxYear,
          ),
        ),
      );
    } else if (params.minYear) {
      yearConditions.push(
        gte(
          sql`EXTRACT(YEAR FROM ${workV3.publicationDate})`,
          params.minYear,
        ),
      );
    } else if (params.maxYear) {
      yearConditions.push(
        lte(
          sql`EXTRACT(YEAR FROM ${workV3.publicationDate})`,
          params.maxYear,
        ),
      );
    }

    if (yearConditions.length > 0) {
      whereConditions.push(...yearConditions);
    }
  }

  // doi extracted from pids JSON array (scheme = 'doi')
  const doiExpr = sql<string | null>`(
    SELECT p->>'value'
    FROM jsonb_array_elements(${workV3.pids}::jsonb) AS p
    WHERE p->>'scheme' = 'doi'
    LIMIT 1
  )`;

  let querySelect = dbV3.select({
    id: workV3.id,
    title: workV3.title,
    publication_date: workV3.publicationDate,
    doi: doiExpr.as("doi"),
  });

  if (params.search) {
    const searchQuery = params.search.replace(/\s+/g, " | ");
    querySelect = dbV3.select({
      id: workV3.id,
      title: workV3.title,
      publication_date: workV3.publicationDate,
      doi: doiExpr.as("doi"),
      rank: sql<number>`ts_rank(
        setweight(to_tsvector('english', COALESCE(${workV3.title}, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(${workV3.descriptions}, ' '), '')), 'B'),
        to_tsquery('english', ${searchQuery})
      )`.as("rank"),
    });
  }

  const baseQuery = querySelect.from(workV3);

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
              ? workV3.title
              : workV3.publicationDate;
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
          .from(workV3)
          .where(and(...whereConditions))
      : dbV3.select({ count: sql<number>`count(*)` }).from(workV3);

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

export const GET = withApiWrapper(tableViewResearchOutputHandler);
