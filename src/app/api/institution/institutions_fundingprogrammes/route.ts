import { createApiHandler } from "core/api/response";
import { getInstitutionsFundingProgrammes } from "datamodel/institution/queries";

export const GET = createApiHandler({
  handler: async () => {
    return await getInstitutionsFundingProgrammes();
  },
});
