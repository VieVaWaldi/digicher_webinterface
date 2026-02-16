import { withApiWrapper } from "app/api/apiClient";
import { apiSuccess } from "app/api/response";
import { db } from "db/client";
import { mapViewInstitution } from "db/schemas/core-map-view";

async function institutionViewHandler() {
  const data = await db.select().from(mapViewInstitution);
  return apiSuccess(data);
}

export const GET = withApiWrapper(institutionViewHandler);
