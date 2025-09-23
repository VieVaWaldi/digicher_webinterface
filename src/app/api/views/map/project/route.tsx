import { withApiWrapper } from "app/api/apiClient";
import { apiSuccess } from "app/api/response";
import { db } from "db/client";
import { mapViewProject } from "db/schemas/core-map-view";

async function projectViewHandler() {
  const data = await db.select().from(mapViewProject);
  return apiSuccess(data);
}

export const GET = withApiWrapper(projectViewHandler);
