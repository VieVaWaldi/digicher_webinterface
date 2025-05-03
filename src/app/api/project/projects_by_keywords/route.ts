import { createApiHandler } from "core/api/response";
import { searchProjects } from "datamodel/project/queries";

export const GET = createApiHandler({
  requireParams: ["keywords"],
  handler: async (params) => {
    return await searchProjects(params.keywords);
  },
});
