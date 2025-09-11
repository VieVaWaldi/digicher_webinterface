import { createApiHandler } from "core/api/response";
import { getProjectsByIds } from "datamodel/project/queries";

export const GET = createApiHandler({
  requireParams: ["project_ids"],
  handler: async (params) => {
    return await getProjectsByIds(params.project_ids);
  },
});
