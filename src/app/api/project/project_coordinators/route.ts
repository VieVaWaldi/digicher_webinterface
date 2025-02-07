import { getProjectCoordinatorsByYear } from "datamodel/project/queries";
import { createApiHandler } from "core/api/response";

export const GET = createApiHandler({
  requireParams: ["year"],
  handler: async (params) => {
    return await getProjectCoordinatorsByYear(parseInt(params.year));
  },
});
