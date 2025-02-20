import { createApiHandler } from "core/api/response";
import { getInstitutionById } from "datamodel/institution/queries";

export const GET = createApiHandler({
  requireParams: ["institution_id"],
  handler: async (params) => {
    return await getInstitutionById(parseInt(params.institution_id));
  },
});
