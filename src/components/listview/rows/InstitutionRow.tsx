"use client";

import { Box, Typography } from "@mui/material";

interface InstitutionRowProps {
  id: string;
  legal_name: string | null;
  short_name?: string | null;
  country_code: string | null;
  country_label?: string | null;
  city?: string | null;
  type_title?: string | null;
  sme?: boolean | null;
  onSelect: (id: string) => void;
  selected?: boolean;
}

export function InstitutionRow({
  id,
  legal_name,
  country_code,
  country_label,
  city,
  type_title,
  sme,
  onSelect,
  selected,
}: InstitutionRowProps) {
  const locationParts = [city, country_label ?? country_code].filter(Boolean);

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
      <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1 }}>
        <Typography variant="body2" fontWeight={600} sx={{ flex: 1, minWidth: 0 }} noWrap>
          {legal_name ?? id}
        </Typography>
        {country_code && (
          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
            {country_code}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.25, flexWrap: "wrap" }}>
        {type_title && (
          <Typography variant="caption" color="text.secondary">
            {type_title}
          </Typography>
        )}
        {sme && (
          <Typography variant="caption" color="primary.main" fontWeight={600}>
            SME
          </Typography>
        )}
        {locationParts.length > 0 && (
          <Typography variant="caption" color="text.secondary">
            {locationParts.join(", ")}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
