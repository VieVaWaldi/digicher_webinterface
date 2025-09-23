import { withApiWrapper } from "app/api/apiClient";
import { apiError, apiSuccess } from "app/api/response";
import { db } from "db/client";
import { institution, project } from "db/schemas/core";
import { j_project_institution } from "db/schemas/core-junctions";
import { eq, count } from "drizzle-orm";
import { NextRequest } from "next/server";

export type ProjectItem = {
  doi: string | null;
  date: string | null;
  title: string | null;
};

export type ProjectsByInstitutionResponse = {
  data: ProjectItem[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
};

async function projectsByInstitutionHandler(request: NextRequest) {
  const url = new URL(request.url);
  const institutionId = url.searchParams.get("institution_id");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  if (!institutionId) {
    return apiError("Institution ID is required", 400);
  }

  // Get total count
  const totalCountResult = await db
    .select({ count: count() })
    .from(institution)
    .leftJoin(
      j_project_institution,
      eq(j_project_institution.institution_id, institution.id),
    )
    .leftJoin(project, eq(j_project_institution.project_id, project.id))
    .where(eq(institution.id, institutionId));

  const totalCount = totalCountResult[0]?.count || 0;

  // Get paginated data
  const data = await db
    .select({
      doi: project.doi,
      date: project.start_date,
      title: project.title,
    })
    .from(institution)
    .leftJoin(
      j_project_institution,
      eq(j_project_institution.institution_id, institution.id),
    )
    .leftJoin(project, eq(j_project_institution.project_id, project.id))
    .where(eq(institution.id, institutionId))
    .limit(limit)
    .offset(offset);

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(totalCount / limit);
  const hasMore = offset + limit < totalCount;

  const response: ProjectsByInstitutionResponse = {
    data,
    totalCount,
    hasMore,
    currentPage,
    totalPages,
  };

  return apiSuccess(response);
}

export const GET = withApiWrapper(projectsByInstitutionHandler);
