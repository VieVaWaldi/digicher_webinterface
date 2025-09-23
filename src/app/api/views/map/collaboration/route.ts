import { withApiWrapper } from "app/api/apiClient";
import { apiSuccess } from "app/api/response";
import { db } from "db/client";
import { mapViewCollaborations } from "db/schemas/core-map-view";

async function mapViewCollaborationsHandler() {
  const data = await db.select().from(mapViewCollaborations);
  return apiSuccess(data);
}

export const GET = withApiWrapper(mapViewCollaborationsHandler);
