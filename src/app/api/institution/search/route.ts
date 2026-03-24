import { withApiWrapper } from "app/api/apiClient";
import { apiError, apiSuccess } from "app/api/response";
import { db } from "db/client";
import { institution } from "db/schemas/core";
import { or, ilike, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

export interface InstitutionSearchResult {
  id: string;
  name: string | null;
  short_name: string | null;
  city: string | null;
  country_code: string | null;
  geolocation: string[] | null;
}

async function institutionSearchHandler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return apiError("Search query is required", 400);
  }

  const limit = Math.min(parseInt(searchParams.get("limit") || "8"), 50);
  const search = `%${query.toLowerCase()}%`;

  const data = await db
    .select({
      id: institution.id,
      name: institution.legal_name,
      short_name: institution.short_name,
      city: sql<string | null>`NULL`,
      country_code: institution.country_code,
      geolocation: institution.geolocation,
    })
    .from(institution)
    .where(
      or(
        ilike(institution.legal_name, search),
        ilike(institution.short_name, search),
        sql`EXISTS (SELECT 1 FROM UNNEST(${institution.alternative_names}) AS an WHERE lower(an) LIKE ${search})`,
      ),
    )
    .limit(limit);

  return apiSuccess(data);
}

export const GET = withApiWrapper(institutionSearchHandler);
