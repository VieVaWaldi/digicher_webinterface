import { getProjectById } from "lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const project_id = searchParams.get("project_id");

    if (!project_id || isNaN(Number(project_id))) {
      return NextResponse.json(
        { error: "Invalid or missing id parameter" },
        { status: 400 }
      );
    }

    const projects = await getProjectById(parseInt(project_id));
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
