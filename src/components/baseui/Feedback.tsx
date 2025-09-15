"use client";

import { MessageCircle, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "shadcn/button";
import { H2, H5, P, Small, H6 } from "shadcn/typography";
import { submitFeedback } from "utils/feedbackUtils";

interface FeedbackProps {
  scenarioName: string;
  scenarioTitle?: string;
  scenarioDescription?: string;
}

export default function Feedback({
  scenarioName,
  scenarioTitle,
}: FeedbackProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [isUseful, setIsUseful] = useState<boolean | null>(null);
  const [usefulnessReason, setUsefulnessReason] = useState("");
  const [improvementSuggestion, setImprovementSuggestion] = useState("");
  const [sessionStartTime] = useState(Date.now());

  /** Timer - Help us Banner */
  useEffect(() => {
    const initialTimer = setTimeout(() => {
      setShowBanner(true);

      setTimeout(() => setShowBanner(false), 5000);
    }, 5000); // initial 5 seconds

    const recurringTimer = setInterval(() => {
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 5000);
    }, 120000); // every 2 minutes

    return () => {
      clearTimeout(initialTimer);
      clearInterval(recurringTimer);
    };
  }, []);

  const handleSubmit = useCallback(async () => {
    if (isUseful === null) return;

    setIsSubmitting(true);

    try {
      const result = await submitFeedback(
        scenarioName,
        isUseful,
        usefulnessReason || undefined,
        improvementSuggestion || undefined,
        sessionStartTime,
      );

      if (result.success) {
        setSubmitted(true);

        setTimeout(() => {
          setShowFeedback(false);
          setSubmitted(false);

          setIsUseful(null);
          setUsefulnessReason("");
          setImprovementSuggestion("");
        }, 2000);
      } else {
        console.error("Feedback submission failed:", result.error);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    scenarioName,
    isUseful,
    usefulnessReason,
    improvementSuggestion,
    sessionStartTime,
  ]);

  const displayTitle = scenarioTitle || scenarioName;

  return (
    <>
      {/* Feedback Button */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center space-x-3">
        <Button
          variant="secondary"
          className="h-12 w-12 animate-[pulse-scale_3s_ease-in-out_infinite] rounded-xl bg-white text-orange-500 shadow-lg hover:bg-orange-50 md:h-20 md:w-20"
          onClick={() => setShowFeedback(true)}
        >
          <MessageCircle
            strokeWidth={1.7}
            className="scale-[1.8] md:scale-[2.8]"
          />
        </Button>

        {/* Help Banner */}
        {showBanner && (
          <div
            onClick={() => setShowFeedback(true)}
            className="rounded-lg border-2 border-orange-500 bg-white px-3 py-2 shadow-md backdrop-blur-sm duration-300 animate-in slide-in-from-right"
          >
            <H6 className="font-bold text-orange-500">Help us improve c:</H6>
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center"
          onClick={() => setShowFeedback(false)}
        >
          <div
            className="relative max-h-[80vh] w-11/12 max-w-2xl overflow-y-auto rounded-xl bg-white/90 p-6 shadow-xl backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-4 flex flex-row items-start justify-between">
              <div>
                <H2 className="text-xl font-semibold text-gray-800">
                  Feedback for{" "}
                  <span className="mb-2 text-orange-500">{displayTitle}</span>{" "}
                  scenario
                </H2>
                <Small className="text-gray-600">
                  Thanks for helping us improve!
                </Small>
              </div>
              <button
                className="p-1 text-gray-500 hover:text-gray-700"
                onClick={() => setShowFeedback(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 h-px w-full bg-gray-300" />

            {submitted ? (
              // Success state
              <div className="py-8 text-center">
                <H5 className="mb-2 text-green-600">Thank you!</H5>
                <P className="px-0 text-gray-600">
                  Your feedback has been submitted successfully.
                </P>
              </div>
            ) : (
              // Feedback form
              <div className="space-y-6">
                {/* Usefulness Question */}
                <div>
                  <H5 className="mb-3 text-gray-800">
                    Do you find this scenario useful?
                  </H5>
                  <div className="flex space-x-4">
                    <Button
                      variant={isUseful === true ? "default" : "outline"}
                      onClick={() => setIsUseful(true)}
                      className="flex-1"
                    >
                      Yes, its useful
                    </Button>
                    <Button
                      variant={isUseful === false ? "default" : "outline"}
                      onClick={() => setIsUseful(false)}
                      className="flex-1"
                    >
                      No, not useful
                    </Button>
                  </div>
                </div>

                {/* Reason for usefulness */}
                {isUseful !== null && (
                  <div>
                    <H5 className="mb-3 text-gray-800">
                      {isUseful
                        ? "Why do you find it useful?"
                        : "Why is it not useful?"}
                    </H5>
                    <textarea
                      value={usefulnessReason}
                      onChange={(e) => setUsefulnessReason(e.target.value)}
                      placeholder="Tell us more about your experience..."
                      className="h-24 w-full resize-none rounded-lg border border-gray-300 p-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                )}

                {/* Improvement suggestions */}
                <div>
                  <H5 className="mb-3 text-gray-800">
                    How would you improve this scenario?
                  </H5>
                  <textarea
                    value={improvementSuggestion}
                    onChange={(e) => setImprovementSuggestion(e.target.value)}
                    placeholder="Share your ideas for improvement..."
                    className="h-24 w-full resize-none rounded-lg border border-gray-300 p-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={isUseful === null || isSubmitting}
                    className="h-12 w-full bg-orange-500 text-lg font-medium hover:bg-orange-600 disabled:bg-gray-300"
                  >
                    {isSubmitting ? "Sending..." : "Send Feedback"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
