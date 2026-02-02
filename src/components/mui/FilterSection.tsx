"use client";

import { Box, Typography, Divider } from "@mui/material";
import { ReactNode } from "react";

export interface FilterSectionProps {
  title?: string;
  children: ReactNode;
  showDivider?: boolean;
}

export const FilterSection = ({
  title,
  children,
  showDivider = true,
}: FilterSectionProps) => {
  return (
    <Box>
      {showDivider && <Divider sx={{ mb: 2 }} />}
      {title && <Typography
        variant="subtitle1"
        fontWeight={600}
        sx={{ mb: 2 }}
      >
        {title}
      </Typography>}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {children}
      </Box>
    </Box>
  );
};

export default FilterSection;