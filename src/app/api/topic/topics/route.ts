import { withApiWrapper } from "app/api/apiClient";
import { apiSuccess } from "app/api/response";
import { db } from "db/client";
import { topicoa } from "db/schemas/core";

async function topicoaHandler() {
  const data = await db.select().from(topicoa);
  return apiSuccess(data);
}

export const GET = withApiWrapper(topicoaHandler);
