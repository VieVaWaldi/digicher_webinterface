"use client";

import { Box, Chip, Typography } from "@mui/material";

interface ProjectRowProps {
  id: string;
  title: string | null;
  acronym: string | null;
  start_date: string | null;
  end_date?: string | null;
  total_cost?: string | null;
  status?: string | null;
  framework_programmes?: string[] | null;
  onSelect: (id: string) => void;
  selected?: boolean;
}

function formatDate(date: string | null | undefined): string {
  if (!date) return "?";
  return new Date(date).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
  });
}

function formatCost(cost: string | number | null | undefined): string {
  if (cost == null) return "";
  const n = typeof cost === "string" ? parseFloat(cost) : cost;
  if (isNaN(n)) return "";
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `€${(n / 1_000).toFixed(0)}K`;
  return `€${n.toFixed(0)}`;
}

export function ProjectRow({
  id,
  title,
  acronym,
  start_date,
  end_date,
  total_cost,
  status,
  framework_programmes,
  onSelect,
  selected,
}: ProjectRowProps) {
  const costStr = formatCost(total_cost);
  const fps = framework_programmes ?? [];

  return (
    <Box
      onClick={() => onSelect(id)}
      sx={{
        px: 2,
        py: 1.5,
        cursor: "pointer",
        borderBottom: "1px solid",
        borderColor: "divider",
        backgroundColor: selected ? "action.selected" : "transparent",
        "&:hover": { backgroundColor: selected ? "action.selected" : "action.hover" },
        "&:last-child": { borderBottom: "none" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}>
        {acronym && (
          <Typography variant="body2" fontWeight={700} component="span">
            {acronym}
          </Typography>
        )}
        {acronym && title && (
          <Typography variant="body2" color="text.secondary" component="span">
            -
          </Typography>
        )}
        <Typography variant="body2" component="span" sx={{ flex: 1 }}>
          {title ?? id}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
        {status && (
          <Chip label={status} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.7rem" }} />
        )}
        {fps.map((fp) => (
          <Chip key={fp} label={fp} size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: "0.7rem" }} />
        ))}
        <Typography variant="caption" color="text.secondary">
          {formatDate(start_date)} – {formatDate(end_date)}
        </Typography>
        {costStr && (
          <Typography variant="caption" color="text.secondary">
            {costStr}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
