export interface FeedbackMetadata {
  userAgent?: string;
  screenResolution?: string;
  viewportSize?: string;
  timezone?: string;
  language?: string;
  sessionDurationMs?: number;
  referrer?: string;
  pageLoadTimeMs?: number;
}

export function collectFeedbackMetadata(
  sessionStartTime?: number,
): FeedbackMetadata {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const metadata: FeedbackMetadata = {
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      referrer: document.referrer || undefined,
    };

    if (sessionStartTime) {
      metadata.sessionDurationMs = Date.now() - sessionStartTime;
    }

    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      if (loadTime > 0) {
        metadata.pageLoadTimeMs = loadTime;
      }
    }

    return metadata;
  } catch (error) {
    console.warn("Error collecting feedback metadata:", error);
    return {};
  }
}

export async function submitFeedback(
  scenarioName: string,
  isUseful: boolean,
  usefulnessReason?: string,
  improvementSuggestion?: string,
  sessionStartTime?: number,
): Promise<{ success: boolean; error?: string; id?: number }> {
  try {
    const metadata = collectFeedbackMetadata(sessionStartTime);

    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scenarioName,
        isUseful,
        usefulnessReason,
        feedbackImprovementSuggestion: improvementSuggestion,
        ...metadata,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || "Failed to submit feedback",
      };
    }

    const result = await response.json();
    return { success: true, id: result.id };
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return { success: false, error: "Network error occurred" };
  }
}
