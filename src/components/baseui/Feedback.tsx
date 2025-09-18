"use client";

import { MessageCircle, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "shadcn/button";
import { H2, H5, H6, P, Small } from "shadcn/typography";
import { cn } from "shadcn/utils/shadcn-utils";
import { submitFeedback } from "utils/feedbackUtils";
import { BTN_SCALE, CSS_BUTTON, STRK_WDTH } from "./BaseUIComponents";

interface FeedbackButtonProps {
  showBanner: boolean;
  setShowBanner: (showBanner: boolean) => void;
  setShowFeedback: (showFeedback: boolean) => void;
}

export function FeedbackButton({
  showBanner,
  setShowBanner,
  setShowFeedback,
}: FeedbackButtonProps) {
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
  }, [setShowBanner]);
  return (
    <div className="relative">
      {showBanner && (
        <div
          onClick={() => setShowFeedback(true)}
          className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-lg border-2 border-orange-500 bg-white px-3 py-2 shadow-md duration-300 animate-in"
        >
          <H6 className="whitespace-nowrap font-bold text-orange-500">
            Help us improve c:
          </H6>
        </div>
      )}

      {/* Feedback Button */}
      <div className="z-10 flex items-center">
        <Button
          variant="secondary"
          className={cn(
            CSS_BUTTON,
            "animate-[pulse-scale_3s_ease-in-out_infinite]",
          )}
          onClick={() => setShowFeedback(true)}
        >
          <MessageCircle strokeWidth={STRK_WDTH} className={BTN_SCALE} />
        </Button>
      </div>
    </div>
  );
}

interface FeedbackProps {
  scenarioName: string;
  scenarioTitle?: string;
  showFeedback: boolean;
  setShowFeedback: (showFeedback: boolean) => void;
  showBanner: boolean;
}

export default function Feedback({
  scenarioName,
  scenarioTitle,
  showFeedback,
  setShowFeedback,
}: FeedbackProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [isUseful, setIsUseful] = useState<boolean | null>(null);
  const [usefulnessReason, setUsefulnessReason] = useState("");
  const [improvementSuggestion, setImprovementSuggestion] = useState("");
  const [sessionStartTime] = useState(Date.now());

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
    setShowFeedback,
    scenarioName,
    isUseful,
    usefulnessReason,
    improvementSuggestion,
    sessionStartTime,
  ]);

  const displayTitle = scenarioTitle || scenarioName;

  return (
    <>
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
