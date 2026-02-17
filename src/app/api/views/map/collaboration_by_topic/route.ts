import { withApiWrapper } from "app/api/apiClient";
import { apiSuccess } from "app/api/response";
import { db } from "db/client";
import { mapViewCollaborationByTopic } from "db/schemas/core-map-view";
import { or, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

async function collaborationByTopicHandler(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const all = searchParams.get("all") === "true";

  if (all) {
    const data = await db.select().from(mapViewCollaborationByTopic);
    return apiSuccess(data);
  }

  const topicIds = searchParams.get("topic_id")?.split(",").filter(Boolean) ?? [];
  const subfieldIds = searchParams.get("subfield_id")?.split(",").filter(Boolean) ?? [];
  const fieldIds = searchParams.get("field_id")?.split(",").filter(Boolean) ?? [];

  if (!topicIds.length && !subfieldIds.length && !fieldIds.length) {
    return NextResponse.json(
      { error: "Provide topic_id, subfield_id, field_id, or all=true" },
      { status: 400 },
    );
  }

  const conditions = [];
  if (topicIds.length)
    conditions.push(inArray(mapViewCollaborationByTopic.topic_id, topicIds));
  if (subfieldIds.length)
    conditions.push(inArray(mapViewCollaborationByTopic.subfield_id, subfieldIds));
  if (fieldIds.length)
    conditions.push(inArray(mapViewCollaborationByTopic.field_id, fieldIds));

  const data = await db
    .select()
    .from(mapViewCollaborationByTopic)
    .where(or(...conditions));

  return apiSuccess(data);
}

export const GET = withApiWrapper(collaborationByTopicHandler, {
  enabled: false,
});