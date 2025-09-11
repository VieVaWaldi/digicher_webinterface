import { apiError, apiSuccess } from "app/api/response";
import { db } from "db/client";
import { sql } from "drizzle-orm";
import { withApiWrapper } from "app/api/apiClient";
import { NextRequest } from "next/server";
import { GetInstitutionCollaboratorsType } from "db/schema";

async function institutionCollaboratorsHandler(request: NextRequest) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split("/");
  const id = pathSegments[pathSegments.length - 1];

  if (!id) {
    return apiError("Institution ID is required", 400);
  }

  try {
    const result = await db.execute(
      sql`SELECT * FROM core_mats.get_institution_collaborators(${id})`,
    );

    const data = result.rows as unknown as GetInstitutionCollaboratorsType[];

    if (data.length === 0) {
      return apiError("No collaborators found for this institution", 404);
    }

    return apiSuccess(data);
  } catch (error) {
    console.error("Error fetching institution collaborators:", error);
    return apiError("Failed to fetch institution collaborators", 500);
  }
}

export const GET = withApiWrapper(institutionCollaboratorsHandler);
