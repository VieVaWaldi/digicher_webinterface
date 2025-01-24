import { getProjectById } from "datamodel/project/queries";
import { createApiHandler } from "core/api/response";

export const GET = createApiHandler({
  requireParams: ["project_id"],
  handler: async (params) => {
    return await getProjectById(parseInt(params.project_id));
  },
});
