import { getProjectCoordinatorsByYear } from "datamodel/project/queries";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get("year");

    if (!year || isNaN(Number(year))) {
      return NextResponse.json(
        { error: "Invalid or missing year parameter" },
        { status: 400 }
      );
    }

    const projects = await getProjectCoordinatorsByYear(parseInt(year));
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
