import { withApiWrapper } from "app/api/apiClient";
import { apiError, apiSuccess } from "app/api/response";
import { db } from "db/client";
import { topicoa } from "db/schemas/core";
import { j_project_topicoa } from "db/schemas/core-junctions";
import { eq } from "drizzle-orm";
import { getTableColumns } from "drizzle-orm";
import { NextRequest } from "next/server";

async function projectTopicHandler(request: NextRequest) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split("/");
  const id = pathSegments[pathSegments.indexOf("project") + 1];

  if (!id) {
    return apiError("Project ID is required", 400);
  }

  const data = await db
    .select({ ...getTableColumns(topicoa) })
    .from(j_project_topicoa)
    .innerJoin(topicoa, eq(topicoa.id, j_project_topicoa.topic_id))
    .where(eq(j_project_topicoa.project_id, id))
    .limit(1);

  if (data.length === 0) {
    return apiError("Topic not found", 404);
  }

  return apiSuccess(data[0]);
}

export const GET = withApiWrapper(projectTopicHandler);
