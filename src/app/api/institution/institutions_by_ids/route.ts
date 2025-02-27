import { createApiHandler } from "core/api/response";
import { getInstitutionsByIds } from "datamodel/institution/queries";

export const GET = createApiHandler({
  requireParams: ["institution_ids"],
  handler: async (params) => {
    return await getInstitutionsByIds(params.institution_ids);
  },
});
