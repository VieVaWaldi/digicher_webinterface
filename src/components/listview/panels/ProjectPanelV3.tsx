"use client";

import { Box, Chip, Divider, Link, Skeleton, Typography } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { useState } from "react";
import { useProjectV3ById } from "@/hooks/queries/v3/useProjectV3ById";

function formatDate(date: string | null | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-GB", { year: "numeric", month: "short" });
}

function formatCost(cost: number | null | undefined): string {
  if (cost == null) return "N/A";
  if (cost >= 1_000_000) return `€${(cost / 1_000_000).toFixed(1)}M`;
  if (cost >= 1_000) return `€${(cost / 1_000).toFixed(0)}K`;
  return `€${cost.toFixed(0)}`;
}

function calcDuration(start: string | null, end: string | null): string | null {
  if (!start || !end) return null;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const months = Math.round(ms / (1000 * 60 * 60 * 24 * 30.44));
  if (months < 12) return `${months}mo`;
  const years = (months / 12).toFixed(1).replace(/\.0$/, "");
  return `${years}yr`;
}

interface ProjectPanelV3Props {
  projectId: string;
}

export function ProjectPanelV3({ projectId }: ProjectPanelV3Props) {
  const { data, isLoading } = useProjectV3ById(projectId);
  const [expanded, setExpanded] = useState(false);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Skeleton variant="text" width="60%" height={28} />
        <Skeleton variant="text" width="90%" height={20} />
        <Box sx={{ display: "flex", gap: 1 }}>
          <Skeleton variant="rounded" width={70} height={24} />
          <Skeleton variant="rounded" width={90} height={24} />
        </Box>
        <Skeleton variant="text" width="70%" height={18} />
        <Skeleton variant="rounded" width="100%" height={72} />
      </Box>
    );
  }

  if (!data) {
    return <Typography variant="body2" color="text.secondary">Project not found.</Typography>;
  }

  const duration = calcDuration(data.startDate, data.endDate);
  const totalCost = data.granted?.totalCost ?? null;
  const fundedAmount = data.granted?.fundedAmount ?? null;
  const currency = data.granted?.currency ?? null;

  const summaryText =
    data.summary && !expanded && data.summary.length > 400
      ? data.summary.slice(0, 400) + "…"
      : data.summary;

  const keywords = data.keywords
    ? data.keywords.split(/[,;]/).map((k) => k.trim()).filter(Boolean)
    : [];

  const fps = data.frameworkProgrammes ?? [];

  const primaryFunding = data.fundings?.[0] ?? null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* Title / Acronym */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}>
          {data.acronym && (
            <Typography variant="h6" fontWeight={600} component="span">
              {data.acronym}
            </Typography>
          )}
          {data.title && (
            <Typography
              variant="body1"
              component="span"
              sx={{ color: data.acronym ? "text.secondary" : "text.primary" }}
            >
              {data.title}
            </Typography>
          )}
        </Box>
        {/* CH badge */}
        {data.is_ch && data.pred != null && (
          <Box sx={{ mt: 0.5 }}>
            <Chip
              label={`Cultural Heritage · ${(data.pred * 100).toFixed(0)}%`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        )}
      </Box>

      <Divider />

      {/* Dates and cost */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
        {(data.startDate || data.endDate) && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <CalendarTodayIcon sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography variant="body2">
              {data.startDate ? formatDate(data.startDate) : "?"} – {data.endDate ? formatDate(data.endDate) : "?"}
              {duration && (
                <Typography component="span" variant="caption" color="text.secondary">
                  {" "}({duration})
                </Typography>
              )}
            </Typography>
          </Box>
        )}
        {totalCost != null && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <AttachMoneyIcon sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography variant="body2">
              {formatCost(totalCost)}
              {fundedAmount != null && fundedAmount !== totalCost && (
                <Typography component="span" variant="caption" color="text.secondary">
                  {" "}({formatCost(fundedAmount)} funded)
                </Typography>
              )}
              {currency && currency !== "EUR" && (
                <Typography component="span" variant="caption" color="text.secondary">
                  {" "}{currency}
                </Typography>
              )}
            </Typography>
          </Box>
        )}
        {primaryFunding && (
          <Typography variant="body2" color="text.secondary">
            {[
              primaryFunding.name,
              primaryFunding.shortName && `(${primaryFunding.shortName})`,
              primaryFunding.jurisdiction && `[${primaryFunding.jurisdiction}]`,
            ]
              .filter(Boolean)
              .join(" ")}
            {primaryFunding.fundingStream && ` · ${primaryFunding.fundingStream}`}
          </Typography>
        )}
      </Box>

      {/* Framework Programmes */}
      {fps.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {fps.map((fp) => (
            <Chip key={fp} label={fp} size="small" variant="outlined" />
          ))}
        </Box>
      )}

      <Divider />

      {/* Summary */}
      {data.summary && (
        <Box>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            Summary
          </Typography>
          <Typography variant="body2">{summaryText}</Typography>
          {data.summary.length > 400 && (
            <Typography
              variant="caption"
              color="primary"
              sx={{ cursor: "pointer", mt: 0.5, display: "block" }}
              onClick={() => setExpanded((e) => !e)}
            >
              {expanded ? "Show less" : "Show more"}
            </Typography>
          )}
        </Box>
      )}

      {/* Keywords */}
      {keywords.length > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            Keywords
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {keywords.slice(0, 10).map((kw) => (
              <Chip key={kw} label={kw} size="small" variant="outlined" />
            ))}
            {keywords.length > 10 && (
              <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center" }}>
                +{keywords.length - 10} more
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
