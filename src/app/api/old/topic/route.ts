import { createApiHandler } from "core/api/response";
import { getTopics } from "datamodel/topic/queries";

export const GET = createApiHandler({
  handler: async () => {
    return await getTopics();
  },
});
