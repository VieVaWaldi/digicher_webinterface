import { createApiHandler } from "core/api/response";
import { searchInstitutions } from "datamodel/institution/queries";

export const GET = createApiHandler({
  requireParams: ["name"],
  handler: async (params) => {
    return await searchInstitutions(params.name);
  },
});
