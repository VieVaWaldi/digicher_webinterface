"use client";

import { Chip, ChipProps, Tooltip } from "@mui/material";
import { ReactNode } from "react";

export interface IconTextPillProps extends Omit<ChipProps, "icon" | "label"> {
  icon: ReactNode;
  label: string;
  selected?: boolean;
  tooltip?: string;
}

export const IconTextPill = ({
  icon,
  label,
  selected = false,
  tooltip,
  sx,
  ...props
}: IconTextPillProps) => {
  const chip = (
    <Chip
      icon={<span style={{ display: "flex", alignItems: "center" }}>{icon}</span>}
      label={label}
      variant={selected ? "filled" : "outlined"}
      clickable
      sx={{
        borderRadius: "50px",
        px: 1,
        py: 2.5,
        fontWeight: 500,
        fontSize: "0.875rem",
        ...(selected
          ? {
              backgroundColor: "primary.main",
              color: "primary.contrastText",
              borderColor: "primary.main",
              "& .MuiChip-icon": {
                color: "primary.contrastText",
              },
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }
          : {
              backgroundColor: "transparent",
              color: "text.primary",
              borderColor: "divider",
              "& .MuiChip-icon": {
                color: "text.primary",
              },
              "&:hover": {
                backgroundColor: "action.hover",
                borderColor: "text.secondary",
              },
            }),
        ...sx,
      }}
      {...props}
    />
  );
  return tooltip ? <Tooltip title={tooltip} arrow>{chip}</Tooltip> : chip;
};

export default IconTextPill;
