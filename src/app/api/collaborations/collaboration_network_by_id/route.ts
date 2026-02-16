import { withApiWrapper } from "@/app/api/apiClient";
import { apiSuccess } from "@/app/api/response";
import { db } from "db/client";
import { mapViewcollaborationNetwork } from "db/schemas/core-map-view";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

async function collaborationNetworkByIdHandler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Missing required query parameter: id" },
      { status: 400 },
    );
  }

  const data = await db
    .select()
    .from(mapViewcollaborationNetwork)
    .where(eq(mapViewcollaborationNetwork.institution_id, id));

  return apiSuccess(data);
}

export const GET = withApiWrapper(collaborationNetworkByIdHandler, {
  enabled: false,
});
