import { createApiHandler } from "core/api/response";
import { getProjectsTopics } from "datamodel/project/queries";

export const GET = createApiHandler({
  handler: async () => {
    return await getProjectsTopics();
  },
});
