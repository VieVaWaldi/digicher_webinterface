import { withApiWrapper } from "app/api/apiClient";
import { apiSuccess } from "app/api/response";
// import { db } from "db/client";

async function institutionCollaboratorsHandler() {
  // const data = await db.select().from(matInstitutionsCollaborationWeights);
  return apiSuccess(null);
}

export const GET = withApiWrapper(institutionCollaboratorsHandler);
