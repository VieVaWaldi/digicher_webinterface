import { createApiHandler } from "core/api/response";
import { getProjectsCoordinatorPoints } from "datamodel/scenario_points/queries";

export const GET = createApiHandler({
  handler: async () => {
    console.log("jo");
    return await getProjectsCoordinatorPoints();
  },
});
