import { createApiHandler } from "core/api/response";
import { getInstititutionCollaborators } from "datamodel/scenario_points/queries";

export const GET = createApiHandler({
  requireParams: ["institution_id"],
  handler: async (params) => {
    return await getInstititutionCollaborators(parseInt(params.institution_id));
  },
});
