import { withApiWrapper } from "app/api/apiClient";
import { apiSuccess } from "app/api/response";
import { db } from "db/client";
import { fundingprogramme } from "db/schema";

async function projectSearchHandler() {
  const data = await db.select().from(fundingprogramme);
  return apiSuccess(data);
}

export const GET = withApiWrapper(projectSearchHandler);
