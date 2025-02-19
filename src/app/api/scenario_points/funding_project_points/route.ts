import { createApiHandler } from "core/api/response";
import { getFundingProjectPoints } from "datamodel/scenario_points/queries";

/** WIP */

export const GET = createApiHandler({
  handler: async () => {
    return getFundingProjectPoints();
  },
});
