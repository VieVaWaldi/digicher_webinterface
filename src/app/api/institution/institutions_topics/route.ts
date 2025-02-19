import { createApiHandler } from "core/api/response";
import { getInstitutionsTopics } from "datamodel/institution/queries";

export const GET = createApiHandler({
  handler: async () => {
    return await getInstitutionsTopics();
  },
});
