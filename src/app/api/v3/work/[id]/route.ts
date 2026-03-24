import { withApiWrapper } from "app/api/apiClient";
import { apiError, apiSuccess } from "app/api/response";
import { dbV3 } from "db/client_v3";
import { workV3 } from "db/schemas/core_v3";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

async function workV3ByIdHandler(request: NextRequest) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split("/");
  const id = pathSegments[pathSegments.length - 1];

  if (!id) return apiError("Work ID is required", 400);

  const data = await dbV3
    .select()
    .from(workV3)
    .where(eq(workV3.id, id))
    .limit(1);

  if (data.length === 0) return apiError("Work not found", 404);

  return apiSuccess(data[0]);
}

export const GET = withApiWrapper(workV3ByIdHandler);
