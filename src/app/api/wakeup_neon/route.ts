import { pingNeon } from "core/database/connection";
import { createApiHandler } from "core/api/response";

export const GET = createApiHandler({
  handler: async () => {
    return await pingNeon();
  },
});
