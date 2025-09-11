import { withApiWrapper } from "app/api/apiClient";
import { apiSuccess } from "app/api/response";
import { db } from "db/client";
import { projectView } from "db/schemas/core-mats";

async function projectViewHandler() {
  const data = await db.select().from(projectView);
  return apiSuccess(data);
}

export const GET = withApiWrapper(projectViewHandler);
