import { withApiWrapper } from "app/api/apiClient";
import { apiError, apiSuccess } from "app/api/response";
import { db } from "db/client";
import { researchoutput } from "db/schemas/core";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

async function researchoutputByIdHandler(request: NextRequest) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split("/");
  const id = pathSegments[pathSegments.length - 1];

  if (!id) {
    return apiError("Researchoutput ID is required", 400);
  }

  const data = await db
    .select()
    .from(researchoutput)
    .where(eq(researchoutput.id, id))
    .limit(1);

  if (data.length === 0) {
    return apiError("Researchoutput not found", 404);
  }

  return apiSuccess(data[0]);
}
export const GET = withApiWrapper(researchoutputByIdHandler);
