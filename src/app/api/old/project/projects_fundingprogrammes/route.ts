import { createApiHandler } from "core/api/response";
import { getProjectsFundingProgrammes } from "datamodel/project/queries";

export const GET = createApiHandler({
  handler: async () => {
    return await getProjectsFundingProgrammes();
  },
});
