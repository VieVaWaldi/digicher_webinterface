import { withApiWrapper } from "app/api/apiClient";
import { apiError, apiSuccess } from "app/api/response";
import { db } from "db/client";
import { project, researchoutput } from "db/schemas/core";
import { j_project_researchoutput } from "db/schemas/core-junctions";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export type ResearchOutputItem = {
  doi: string | null;
  date: string | null;
  title: string | null;
};

async function researchoutputByProjectHandler(request: NextRequest) {
  const url = new URL(request.url);
  const projectId = url.searchParams.get("project_id");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  if (!projectId) {
    return apiError("Project ID is required", 400);
  }

  const data = await db
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

  if (data.length === 0) {
    return apiError("RO not found", 404);
  }

  //   type ResearchOutputWithProject = (typeof data)[0];

  return apiSuccess(data);
}
export const GET = withApiWrapper(researchoutputByProjectHandler);
