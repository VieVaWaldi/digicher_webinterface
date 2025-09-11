import { withApiWrapper } from "app/api/apiClient";
import { apiSuccess } from "app/api/response";
import { db } from "db/client";
import { matInstitutionsCollaborationWeights } from "db/schemas/core-mats";

async function institutionCollaboratorsHandler() {
  const data = await db.select().from(matInstitutionsCollaborationWeights);
  return apiSuccess(data);
}

export const GET = withApiWrapper(institutionCollaboratorsHandler);
