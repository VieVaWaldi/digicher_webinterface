import { withApiWrapper } from "app/api/apiClient";
import { apiSuccess } from "app/api/response";
import { db } from "db/client";
import { projectView } from "db/schemas/core-mats";
import { max, min, sql } from "drizzle-orm";

async function projectYearRangeHandler() {
  const data = await db
    .select({
      minStartDate: min(sql`EXTRACT(YEAR FROM ${projectView.start_date})::int`),
      maxEndDate: max(sql`EXTRACT(YEAR FROM ${projectView.end_date})::int`),
    })
    .from(projectView);

  const result = data[0];
  return apiSuccess({
    minStartDate: parseInt(result.minStartDate as string),
    maxEndDate: parseInt(result.maxEndDate as string),
  });
}

export const GET = withApiWrapper(projectYearRangeHandler);
