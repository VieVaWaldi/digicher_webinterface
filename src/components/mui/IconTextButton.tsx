"use client";

import { Button, ButtonProps, Tooltip, TooltipProps } from "@mui/material";
import { ReactNode } from "react";
import { Placement } from "@floating-ui/utils";

export interface IconTextButtonProps extends Omit<ButtonProps, "startIcon"> {
  icon: ReactNode;
  label?: string;
  tooltip?: string;
  selected?: boolean;
  placement?: Placement;
}

export const IconTextButton = ({
  icon,
  label,
  tooltip,
  selected = false,
  sx,
  placement = "bottom",
  ...props
}: IconTextButtonProps) => {
  const isIconOnly = !label;
  const tooltipText = tooltip ?? label;

  const button = (
    <Button
      variant={selected ? "outlined" : "text"}
      startIcon={isIconOnly ? undefined : icon}
      sx={{
        borderRadius: isIconOnly ? "50%" : "8px",
        px: isIconOnly ? 0 : 2,
        py: isIconOnly ? 0 : 1,
        minWidth: isIconOnly ? 40 : undefined,
        width: isIconOnly ? 40 : undefined,
        height: isIconOnly ? 40 : undefined,
        textTransform: "none",
        fontWeight: 500,
        color: selected ? "primary.main" : "text.secondary",
        borderColor: selected ? "primary.main" : "transparent",
        backgroundColor: selected ? "transparent" : "transparent",
        "&:hover": {
          backgroundColor: selected ? "primary.main" : "action.hover",
          borderColor: selected ? "primary.main" : "transparent",
          color: selected ? "primary.contrastText" : "text.primary",
        },
        ...sx,
      }}
      {...props}
    >
      {isIconOnly ? icon : label}
    </Button>
  );

  if (tooltipText) {
    return (
      <Tooltip title={tooltipText} arrow placement={placement}>
        {button}
      </Tooltip>
    );
  }

  return button;
};

export default IconTextButton;
