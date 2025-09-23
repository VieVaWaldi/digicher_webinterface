import { withApiWrapper } from "app/api/apiClient";
import { apiError, apiSuccess } from "app/api/response";
import { db } from "db/client";
import { project, researchoutput } from "db/schemas/core";
import { j_project_researchoutput } from "db/schemas/core-junctions";
import { eq, count } from "drizzle-orm";
import { NextRequest } from "next/server";

export type ResearchOutputItem = {
  doi: string | null;
  date: string | null;
  title: string | null;
};

export type ResearchOutputByProjectResponse = {
  data: ResearchOutputItem[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
};

async function researchoutputByProjectHandler(request: NextRequest) {
  const url = new URL(request.url);
  const projectId = url.searchParams.get("project_id");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  if (!projectId) {
    return apiError("Project ID is required", 400);
  }

  const totalCountResult = await db
    .select({ count: count() })
    .from(project)
    .leftJoin(
      j_project_researchoutput,
      eq(j_project_researchoutput.project_id, project.id),
    )
    .leftJoin(
      researchoutput,
      eq(j_project_researchoutput.researchoutput_id, researchoutput.id),
    )
    .where(eq(project.id, projectId));

  const totalCount = totalCountResult[0]?.count || 0;

  const rawData = await db
    .select({
      doi: researchoutput.doi,
      date: researchoutput.publication_date,
      title: researchoutput.title,
    })
    .from(project)
    .leftJoin(
      j_project_researchoutput,
      eq(j_project_researchoutput.project_id, project.id),
    )
    .leftJoin(
      researchoutput,
      eq(j_project_researchoutput.researchoutput_id, researchoutput.id),
    )
    .where(eq(project.id, projectId))
    .limit(limit)
    .offset(offset);

  const data: ResearchOutputItem[] = rawData.map((item) => ({
    doi: item.doi,
    date: item.date ? item.date.toISOString() : null,
    title: item.title,
  }));

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(totalCount / limit);
  const hasMore = offset + limit < totalCount;

  const response: ResearchOutputByProjectResponse = {
    data,
    totalCount,
    hasMore,
    currentPage,
    totalPages,
  };

  return apiSuccess(response);
}

export const GET = withApiWrapper(researchoutputByProjectHandler);
