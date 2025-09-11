import { withApiWrapper } from "app/api/apiClient";
import { apiSuccess } from "app/api/response";
import { db } from "db/client";
import { institutionView } from "db/schemas/core-mats";

async function institutionViewHandler() {
  const data = await db.select().from(institutionView);
  return apiSuccess(data);
}

export const GET = withApiWrapper(institutionViewHandler);
