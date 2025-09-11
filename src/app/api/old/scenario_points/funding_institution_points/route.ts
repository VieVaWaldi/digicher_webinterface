import { createApiHandler } from "core/api/response";
import { getFundingInstitutionPoints } from "datamodel/scenario_points/queries";

export const GET = createApiHandler({
  handler: async () => {
    return await getFundingInstitutionPoints();
  },
});
