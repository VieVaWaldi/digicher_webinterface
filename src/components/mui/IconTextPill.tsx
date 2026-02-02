"use client";

import { Chip, ChipProps } from "@mui/material";
import { ReactNode } from "react";

export interface IconTextPillProps extends Omit<ChipProps, "icon" | "label"> {
  icon: ReactNode;
  label: string;
  selected?: boolean;
}

export const IconTextPill = ({
  icon,
  label,
  selected = false,
  sx,
  ...props
}: IconTextPillProps) => {
  return (
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
};

export default IconTextPill;
