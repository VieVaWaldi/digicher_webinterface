import { withApiWrapper } from "app/api/apiClient";
import { apiSuccess } from "app/api/response";
import { db } from "db/client";
import { mapViewProject } from "db/schema";
import { max, min, sql } from "drizzle-orm";

async function projectYearRangeHandler() {
  const data = await db
    .select({
      minStartDate: min(
        sql`EXTRACT(YEAR FROM ${mapViewProject.start_date})::int`,
      ),
      maxEndDate: max(sql`EXTRACT(YEAR FROM ${mapViewProject.end_date})::int`),
    })
    .from(mapViewProject);

  const result = data[0];
  return apiSuccess({
    minStartDate: parseInt(result.minStartDate as string),
    maxEndDate: parseInt(result.maxEndDate as string),
  });
}

export const GET = withApiWrapper(projectYearRangeHandler);
