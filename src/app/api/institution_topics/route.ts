import { getInstitutionTopics } from "lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const institutions = await getInstitutionTopics();
    return NextResponse.json(institutions);
  } catch (error) {
    console.error("Error fetching institutions:", error);
    return NextResponse.json(
      { error: "Failed to fetch institutions" },
      { status: 500 }
    );
  }
}
