import { getInstititutionCollaborators } from "datamodel/institution/queries";
import { createApiHandler } from "core/api/response";

export const GET = createApiHandler({
  requireParams: ["institution_id"],
  handler: async (params) => {
    return await getInstititutionCollaborators(parseInt(params.institution_id));
  },
});
