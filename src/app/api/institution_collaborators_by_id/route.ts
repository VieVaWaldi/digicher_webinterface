import { getInstititutionCollaborators } from "lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const institution_id = searchParams.get("institution_id");

    if (!institution_id || isNaN(Number(institution_id))) {
      return NextResponse.json(
        { error: "Invalid or missing id parameter" },
        { status: 400 }
      );
    }

    const institutions = await getInstititutionCollaborators(
      parseInt(institution_id)
    );
    return NextResponse.json(institutions);
  } catch (error) {
    console.error("Error fetching institutions:", error);
    return NextResponse.json(
      { error: "Failed to fetch institutions" },
      { status: 500 }
    );
  }
}
