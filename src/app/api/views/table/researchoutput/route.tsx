import { withApiWrapper } from "app/api/apiClient";
import { apiSuccess } from "app/api/response";
import { db } from "db/client";
import { researchoutput } from "db/schemas/core";
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
        setweight(to_tsvector('english', COALESCE(${researchoutput.title}, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(${researchoutput.abstract}, '')), 'B')
      ) @@ to_tsquery('english', ${searchQuery})`,
    );
  }

  if (params.minYear || params.maxYear) {
    const yearConditions = [];

    if (params.minYear && params.maxYear) {
      yearConditions.push(
        and(
          gte(
            sql`EXTRACT(YEAR FROM ${researchoutput.publication_date})`,
            params.minYear,
          ),
          lte(
            sql`EXTRACT(YEAR FROM ${researchoutput.publication_date})`,
            params.maxYear,
          ),
        ),
      );
    } else if (params.minYear) {
      yearConditions.push(
        gte(
          sql`EXTRACT(YEAR FROM ${researchoutput.publication_date})`,
          params.minYear,
        ),
      );
    } else if (params.maxYear) {
      yearConditions.push(
        lte(
          sql`EXTRACT(YEAR FROM ${researchoutput.publication_date})`,
          params.maxYear,
        ),
      );
    }

    if (yearConditions.length > 0) {
      whereConditions.push(...yearConditions);
    }
  }

  let querySelect = db.select({
    id: researchoutput.id,
    title: researchoutput.title,
    publication_date: researchoutput.publication_date,
    doi: researchoutput.doi,
  });

  if (params.search) {
    const searchQuery = params.search.replace(/\s+/g, " | ");
    querySelect = db.select({
      id: researchoutput.id,
      title: researchoutput.title,
      publication_date: researchoutput.publication_date,
      doi: researchoutput.doi,
      rank: sql<number>`ts_rank(
        setweight(to_tsvector('english', COALESCE(${researchoutput.title}, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(${researchoutput.abstract}, '')), 'B'),
        to_tsquery('english', ${searchQuery})
      )`.as("rank"),
    });
  }

  const baseQuery = querySelect.from(researchoutput);

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
              ? researchoutput.title
              : researchoutput.publication_date;
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
          .from(researchoutput)
          .where(and(...whereConditions))
      : db.select({ count: sql<number>`count(*)` }).from(researchoutput);

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
