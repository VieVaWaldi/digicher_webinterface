import { withApiWrapper } from "app/api/apiClient";
import { apiError, apiSuccess } from "app/api/response";
import { feedbackDb } from "db/feedbackClient";
import { feedback_v1 } from "db/schemas/feedback";
import { NextRequest } from "next/server";

interface FeedbackRequestBody {
  scenarioName: string;
  isUseful: boolean;
  usefulnessReason?: string;
  feedbackImprovementSuggestion?: string;

  userAgent?: string;
  screenResolution?: string;
  viewportSize?: string;
  timezone?: string;
  language?: string;
  sessionDurationMs?: number;
  referrer?: string;
  pageLoadTimeMs?: number;
}

async function feedbackHandler(request: NextRequest) {
  try {
    const body: FeedbackRequestBody = await request.json();

    console.log("a");

    if (!body.scenarioName || typeof body.isUseful !== "boolean") {
      return apiError(
        "Missing required fields: scenarioName and isUseful",
        400,
      );
    }

    console.log("b");

    const feedbackData = {
      scenario_name: body.scenarioName,
      is_useful: body.isUseful,
      usefulness_reason: body.usefulnessReason || null,
      feedback_improvement_suggestion:
        body.feedbackImprovementSuggestion || null,

      ip_address: getClientIP(request),
      user_agent: body.userAgent || request.headers.get("user-agent") || null,
      screen_resolution: body.screenResolution || null,
      viewport_size: body.viewportSize || null,
      timezone: body.timezone || null,
      language:
        body.language ||
        request.headers.get("accept-language")?.split(",")[0] ||
        null,
      session_duration_ms: body.sessionDurationMs || null,
      referrer: body.referrer || request.headers.get("referer") || null,
      page_load_time_ms: body.pageLoadTimeMs || null,
    };

    console.log("c");

    const result = await feedbackDb
      .insert(feedback_v1)
      .values(feedbackData)
      .returning({ id: feedback_v1.id });

    console.log("d");

    return apiSuccess({
      id: result[0].id,
      message: "Feedback submitted successfully",
      scenario: body.scenarioName,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return apiError("Failed to submit feedback", 500);
  }
}

export const POST = withApiWrapper(feedbackHandler);

const getClientIP = (request: NextRequest): string => {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0] || realIP || "unknown";

  // Anonymize IP
  //   if (ip !== "unknown" && ip.includes(".")) {
  //     const parts = ip.split(".");
  //     if (parts.length === 4) {
  //       parts[3] = "xxx"; // 192.168.1.xxx
  //       ip = parts.join(".");
  //     }
  //   }
};

// Optional: GET endpoint for feedback analytics (admin only)
// async function getFeedbackHandler(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const scenario = searchParams.get("scenario");

//     let query = feedbackDb.select().from(feedback_v1);

//     if (scenario) {
//       query = query.where(eq(feedback_v1.scenario_name, scenario));
//     }

//     const data = await query.orderBy(desc(feedback_v1.submitted_at)).limit(100);

//     return apiSuccess(data);
//   } catch (error) {
//     console.error("Error fetching feedback:", error);
//     return apiError("Failed to fetch feedback", 500);
//   }
// }

// export const GET = withApiWrapper(getFeedbackHandler);
