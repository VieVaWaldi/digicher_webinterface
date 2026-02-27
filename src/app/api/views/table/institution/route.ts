import { withApiWrapper } from "app/api/apiClient";
import { apiSuccess } from "app/api/response";
import { db } from "db/client";
import { institution } from "db/schemas/core";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

export interface InstitutionSearchParams {
  search?: string;
  countries?: string[];
  types?: string[];
  sme?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "name" | "country";
  sortOrder?: "asc" | "desc";
}

async function tableViewInstitutionHandler(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const params: InstitutionSearchParams = {
    search: searchParams.get("search") || undefined,
    countries: searchParams.get("countries")?.split(",").filter(Boolean) ?? [],
    types: searchParams.get("types")?.split(",").filter(Boolean) ?? [],
    sme: searchParams.get("sme") === "true" ? true : undefined,
    page: parseInt(searchParams.get("page") || "0"),
    limit: Math.min(parseInt(searchParams.get("limit") || "20"), 100),
    sortBy: (searchParams.get("sortBy") as any) || "name",
    sortOrder: (searchParams.get("sortOrder") as any) || "asc",
  };

  const whereConditions = [];

  if (params.search) {
    const searchQuery = params.search.replace(/\s+/g, " | ");
    whereConditions.push(
      sql`to_tsvector('simple', COALESCE(${institution.legal_name}, '')) @@ to_tsquery('simple', ${searchQuery})`,
    );
  }

  if (params.countries && params.countries.length > 0) {
    whereConditions.push(inArray(institution.country_code, params.countries));
  }

  if (params.types && params.types.length > 0) {
    whereConditions.push(inArray(institution.type_title, params.types));
  }

  if (params.sme) {
    whereConditions.push(eq(institution.sme, true));
  }

  const sortColumn =
    params.sortBy === "country" ? institution.country_code : institution.legal_name;

  const baseQuery = db
    .select({
      id: institution.id,
      legal_name: institution.legal_name,
      short_name: institution.short_name,
      country_code: institution.country_code,
      country_label: institution.country_label,
      city: institution.city,
      type_title: institution.type_title,
      sme: institution.sme,
    })
    .from(institution);

  const queryWhere =
    whereConditions.length > 0
      ? baseQuery.where(and(...whereConditions))
      : baseQuery;

  const query = queryWhere.orderBy(
    params.sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn),
  );

  if (!params.limit) params.limit = 20;
  if (!params.page) params.page = 0;

  const offset = params.page * params.limit;
  const data = await query.limit(params.limit).offset(offset);

  const countBase = db
    .select({ count: sql<number>`count(*)` })
    .from(institution);

  const countQuery =
    whereConditions.length > 0
      ? countBase.where(and(...whereConditions))
      : countBase;

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

export const GET = withApiWrapper(tableViewInstitutionHandler);
