import { withApiWrapper } from "app/api/apiClient";
import { apiSuccess } from "app/api/response";
import { dbV3 } from "db/client_v3";
import { organizationV3 } from "db/schemas/core_v3";
import { and, asc, arrayOverlaps, desc, inArray, sql } from "drizzle-orm";
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
      sql`to_tsvector('simple', COALESCE(${organizationV3.legalName}, '') || ' ' || COALESCE(${organizationV3.legalShortName}, '')) @@ to_tsquery('simple', ${searchQuery})`,
    );
  }

  if (params.countries && params.countries.length > 0) {
    whereConditions.push(inArray(organizationV3.countryCode, params.countries));
  }

  if (params.types && params.types.length > 0) {
    whereConditions.push(arrayOverlaps(organizationV3.rorTypes, params.types));
  }

  // sme not available in core_v3 organization — filter ignored

  const sortColumn =
    params.sortBy === "country"
      ? organizationV3.countryCode
      : organizationV3.legalName;

  // Extract city and country_label from first rorLocation entry
  const cityExpr = sql<string | null>`(${organizationV3.rorLocations}::jsonb->0->'geonames_details'->>'name')`;
  const countryLabelExpr = sql<string | null>`(${organizationV3.rorLocations}::jsonb->0->'geonames_details'->>'country_name')`;
  const typeTitleExpr = sql<string | null>`(${organizationV3.rorTypes}[1])`;

  const baseQuery = dbV3
    .select({
      id: organizationV3.id,
      legal_name: organizationV3.legalName,
      short_name: organizationV3.legalShortName,
      country_code: organizationV3.countryCode,
      country_label: countryLabelExpr.as("country_label"),
      city: cityExpr.as("city"),
      type_title: typeTitleExpr.as("type_title"),
      sme: sql<boolean | null>`NULL::boolean`.as("sme"),
    })
    .from(organizationV3);

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

  const countBase = dbV3
    .select({ count: sql<number>`count(*)` })
    .from(organizationV3);

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
