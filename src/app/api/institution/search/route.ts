import { withApiWrapper } from "app/api/apiClient";
import { apiError, apiSuccess } from "app/api/response";
import { db } from "db/client";
import { institution } from "db/schemas/core";
import { ilike, SQL, sql } from "drizzle-orm";
import { AnyPgColumn } from "drizzle-orm/pg-core";
import { NextRequest } from "next/server";

export interface InstitutionSearchResult {
  id: string;
  name: string | null;
}

function lower(text: AnyPgColumn): SQL {
  return sql`lower(${text})`;
}

async function institutionSearchHandler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return apiError("Search query is required", 400);
  }

  const search = `%${query.toLowerCase()}%`;

  const data = await db
    .select({
      id: institution.id,
      name: institution.legal_name,
    })
    .from(institution)
    .where(ilike(lower(institution.legal_name), search));

  if (data.length === 0) {
    return apiError("Institution not found", 404);
  }

  return apiSuccess(data);
}

export const GET = withApiWrapper(institutionSearchHandler);
