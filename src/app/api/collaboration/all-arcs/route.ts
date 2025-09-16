import { withApiWrapper } from "app/api/apiClient";
import { apiSuccess } from "app/api/response";
import { db } from "db/client";
import { matInstitutionCollaborations } from "db/schemas/core-mats";

async function allCollaborationArcsHandler() {
  const data = await db
    .select()
    .from(matInstitutionCollaborations)
    .limit(1000000);
  return apiSuccess(data);
}

export const GET = withApiWrapper(allCollaborationArcsHandler);
