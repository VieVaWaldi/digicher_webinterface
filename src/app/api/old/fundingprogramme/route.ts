import { createApiHandler } from "core/api/response";
import { getFundingProgrammes } from "datamodel/fundingprogramme/queries";

export const GET = createApiHandler({
  handler: async () => {
    return await getFundingProgrammes();
  },
});
