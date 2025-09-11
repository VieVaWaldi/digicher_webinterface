import { withApiWrapper } from "app/api/apiClient";
import { apiError, apiSuccess } from "app/api/response";
import { db } from "db/client";
import { sql } from "drizzle-orm";
import { NextRequest } from "next/server";

export interface ProjectSearchResult {
  id: string;
  //   title: string;
  //   rank: number;
}

async function projectSearchHandler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return apiError("Search query is required", 400);
  }

  const tsQuery = query.trim().split(/\s+/).join(" | ");

  const result = await db.execute(sql`
    SELECT id
    FROM core.project
    WHERE (
        setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(objective, '')), 'B')
    ) @@ to_tsquery('english', ${tsQuery});
  `);

  const data = result.rows as unknown as ProjectSearchResult[];

  if (data.length === 0) {
    return apiError("No projects found", 404);
  }

  return apiSuccess(data);
}

export const GET = withApiWrapper(projectSearchHandler);
