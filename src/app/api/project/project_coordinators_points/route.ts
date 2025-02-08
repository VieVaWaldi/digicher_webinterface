import { getProjectsCoordinatorPoints } from "datamodel/project/queries";
import { createApiHandler } from "core/api/response";

export const GET = createApiHandler({
  handler: async () => {
    return await getProjectsCoordinatorPoints();
  },
});
