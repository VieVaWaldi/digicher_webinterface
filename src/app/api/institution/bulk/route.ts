import { withApiWrapper } from "app/api/apiClient";
import { apiError, apiSuccess } from "app/api/response";
import { db } from "db/client";
import { institution } from "db/schemas/core";
import { inArray } from "drizzle-orm";
import { NextRequest } from "next/server";

async function bulkInstitutionNamesHandler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.getAll("ids");

  if (!ids.length) {
    return apiError("At least one ID is required", 400);
  }

  const data = await db
    .select({
      id: institution.id,
      legal_name: institution.legal_name,
      short_name: institution.short_name,
    })
    .from(institution)
    .where(inArray(institution.id, ids));

  const result: Record<string, { legal_name: string | null; short_name: string | null }> = {};
  for (const row of data) {
    result[row.id] = { legal_name: row.legal_name, short_name: row.short_name };
  }

  return apiSuccess(result);
}

export const GET = withApiWrapper(bulkInstitutionNamesHandler, { enabled: false });
