import { createApiHandler } from "core/api/response";
import { pingNeon } from "core/database/connection";

export const GET = createApiHandler({
  handler: async () => {
    return await pingNeon();
  },
});
