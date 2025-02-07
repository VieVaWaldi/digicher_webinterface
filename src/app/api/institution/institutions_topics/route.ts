import { getInstitutionsTopics } from "datamodel/institution/queries";
import { createApiHandler } from "core/api/response";

export const GET = createApiHandler({
  handler: async () => {
    return await getInstitutionsTopics();
  },
});
