import { createApiHandler } from "core/api/response";
import { getInstitutionCollaborationWeightPoints } from "datamodel/scenario_points/queries";

export const GET = createApiHandler({
  handler: async () => {
    return await getInstitutionCollaborationWeightPoints();
  },
});
