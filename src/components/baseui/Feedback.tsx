"use client";

import {
  Backdrop,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { keyframes } from "@mui/system";
import { MessageCircle, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { submitFeedback } from "utils/feedbackUtils";

const pulseScale = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
`;

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
    }, 0); // initial 5 seconds 5000

    const recurringTimer = setInterval(() => {
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 5000);
    }, 60000); // every 1 minute

    return () => {
      clearTimeout(initialTimer);
      clearInterval(recurringTimer);
    };
  }, [setShowBanner]);

  return (
    <Box sx={{ display: "flex", alignItems: "center", position: "relative", overflow: "visible" }}>
      {/* Banner - positioned to the left */}
      {showBanner && (
        <Chip
          label="Help us improve (:"
          onClick={() => setShowFeedback(true)}
          sx={{
            position: "absolute",
            right: "100%",
            mr: 1.5,
            fontWeight: 600,
            fontSize: "0.8rem",
            backgroundColor: "background.paper",
            color: "secondary.main",
            border: 2,
            borderColor: "secondary.main",
            cursor: "pointer",
            whiteSpace: "nowrap",
            maxWidth: "none",
            animation: "fadeIn 0.3s ease-in-out",
            "@keyframes fadeIn": {
              from: { opacity: 0, transform: "translateX(10px)" },
              to: { opacity: 1, transform: "translateX(0)" },
            },
            "&:hover": {
              backgroundColor: "secondary.main",
              color: "secondary.contrastText",
            },
          }}
        />
      )}

      {/* Feedback Button */}
      <Tooltip title="Give Feedback" arrow>
        <IconButton
          onClick={() => setShowFeedback(true)}
          sx={{
            width: { xs: 40, md: 48, lg: 64 },
            height: { xs: 40, md: 48, lg: 64 },
            backgroundColor: "background.paper",
            color: "secondary.main",
            animation: `${pulseScale} 3s ease-in-out infinite`,
            "&:hover": {
              backgroundColor: "secondary.main",
              color: "secondary.contrastText",
            },
          }}
        >
          <MessageCircle
            size={24}
            strokeWidth={2.2}
            style={{ transform: "scale(1.2)" }}
          />
        </IconButton>
      </Tooltip>
    </Box>
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
    <Backdrop
      open={showFeedback}
      onClick={() => setShowFeedback(false)}
      sx={{ zIndex: 20 }}
    >
      <Paper
        onClick={(e) => e.stopPropagation()}
        sx={{
          maxHeight: "80vh",
          width: "91.666%",
          maxWidth: "672px",
          overflow: "hidden",
          borderRadius: 3,
          backdropFilter: "blur(12px)",
          backgroundColor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(30, 30, 30, 0.95)"
              : "rgba(255, 255, 255, 0.95)",
        }}
      >
        <Box sx={{ overflow: "auto", maxHeight: "80vh", p: 3 }}>
          {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, fontFamily: "Inter, sans-serif" }}
              color="text.primary"
            >
              Feedback for{" "}
              <Box component="span" sx={{ color: "secondary.main" }}>
                {displayTitle}
              </Box>{" "}
              scenario
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Thanks for helping us improve!
            </Typography>
          </Box>
          <IconButton
            onClick={() => setShowFeedback(false)}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            <X size={20} />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {submitted ? (
          // Success state
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography
              variant="h6"
              color="success.main"
              sx={{ mb: 1, fontFamily: "Inter, sans-serif" }}
            >
              Thank you!
            </Typography>
            <Typography color="text.secondary">
              Your feedback has been submitted successfully.
            </Typography>
          </Box>
        ) : (
          // Feedback form
          <Stack spacing={3}>
            {/* Usefulness Question */}
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={500}
                color="text.primary"
                sx={{ mb: 1.5 }}
              >
                Do you find this scenario useful?
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant={isUseful === true ? "contained" : "outlined"}
                  onClick={() => setIsUseful(true)}
                  fullWidth
                  sx={{
                    ...(isUseful === true && {
                      backgroundColor: "primary.main",
                      "&:hover": { backgroundColor: "primary.dark" },
                    }),
                  }}
                >
                  Yes, it's useful
                </Button>
                <Button
                  variant={isUseful === false ? "contained" : "outlined"}
                  onClick={() => setIsUseful(false)}
                  fullWidth
                  sx={{
                    ...(isUseful === false && {
                      backgroundColor: "primary.main",
                      "&:hover": { backgroundColor: "primary.dark" },
                    }),
                  }}
                >
                  No, not useful
                </Button>
              </Stack>
            </Box>

            {/* Reason for usefulness */}
            {isUseful !== null && (
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight={500}
                  color="text.primary"
                  sx={{ mb: 1.5 }}
                >
                  {isUseful
                    ? "Why do you find it useful?"
                    : "Why is it not useful?"}
                </Typography>
                <TextField
                  value={usefulnessReason}
                  onChange={(e) => setUsefulnessReason(e.target.value)}
                  placeholder="Tell us more about your experience..."
                  multiline
                  rows={3}
                  fullWidth
                />
              </Box>
            )}

            {/* Improvement suggestions */}
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={500}
                color="text.primary"
                sx={{ mb: 1.5 }}
              >
                How would you improve this scenario?
              </Typography>
              <TextField
                value={improvementSuggestion}
                onChange={(e) => setImprovementSuggestion(e.target.value)}
                placeholder="Share your ideas for improvement..."
                multiline
                rows={3}
                fullWidth
              />
            </Box>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={isUseful === null || isSubmitting}
              variant="contained"
              size="large"
              fullWidth
              sx={{
                mt: 2,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 500,
                backgroundColor: "secondary.main",
                "&:hover": { backgroundColor: "secondary.dark" },
                "&:disabled": { backgroundColor: "action.disabledBackground" },
              }}
            >
              {isSubmitting ? "Sending..." : "Send Feedback"}
            </Button>
          </Stack>
        )}
        </Box>
      </Paper>
    </Backdrop>
  );
}
