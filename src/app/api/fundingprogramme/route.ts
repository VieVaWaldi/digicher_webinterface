import { createApiHandler } from "core/api/response";
import { getFungingProgrammes } from "datamodel/fundingprogrammes/queries";

export const GET = createApiHandler({
  handler: async () => {
    return await getFungingProgrammes();
  },
});
