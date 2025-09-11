import { withApiWrapper } from "app/api/apiClient";
import { apiSuccess } from "app/api/response";
import { db } from "db/client";
import { j_project_topicoa } from "db/schemas/core-junctions";

async function j_project_topicoaHandler() {
  const data = await db.select().from(j_project_topicoa);
  return apiSuccess(data);
}

export const GET = withApiWrapper(j_project_topicoaHandler);
