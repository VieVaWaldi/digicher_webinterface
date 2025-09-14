import { withApiWrapper } from "app/api/apiClient";
import { apiError, apiSuccess } from "app/api/response";
import { db } from "db/client";
import { institution } from "db/schemas/core";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

async function institutionByIdHandler(request: NextRequest) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split("/");
  const id = pathSegments[pathSegments.length - 1];

  if (!id) {
    return apiError("Institution ID is required", 400);
  }

  const data = await db
    .select()
    .from(institution)
    .where(eq(institution.id, id))
    .limit(1);

  if (data.length === 0) {
    return apiError("Institution not found", 404);
  }

  return apiSuccess(data[0]);
}
export const GET = withApiWrapper(institutionByIdHandler);
