"use client";

import { Box, Chip, Typography } from "@mui/material";

interface WorkRowProps {
  id: string;
  title: string | null;
  publication_date: string | null;
  doi?: string | null;
  journal_name?: string | null;
  open_access_color?: string | null;
  citation_count?: number | null;
  type?: string | null;
  onSelect: (id: string) => void;
  selected?: boolean;
}

function formatYear(date: string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.getFullYear().toString();
}

export function WorkRow({
  id,
  title,
  publication_date,
  doi,
  journal_name,
  open_access_color,
  citation_count,
  type,
  onSelect,
  selected,
}: WorkRowProps) {
  const year = formatYear(publication_date);
  const isOA = !!open_access_color;

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
      <Typography variant="body2" fontWeight={600} sx={{ wordBreak: "break-word" }}>
        {title ?? id}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
        {year && (
          <Typography variant="caption" color="text.secondary">
            {year}
          </Typography>
        )}
        {journal_name && (
          <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
            {journal_name}
          </Typography>
        )}
        {doi && (
          <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 180 }}>
            doi:{doi}
          </Typography>
        )}
        {isOA && (
          <Chip label="OA" size="small" color="success" variant="outlined" sx={{ height: 18, fontSize: "0.65rem" }} />
        )}
        {type && (
          <Chip label={type} size="small" variant="outlined" sx={{ height: 18, fontSize: "0.65rem" }} />
        )}
        {citation_count != null && citation_count > 0 && (
          <Typography variant="caption" color="text.secondary">
            Cited by {citation_count}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
