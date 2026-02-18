import { Box, Paper } from "@mui/material";
import React, { ReactNode } from "react";

interface MapTooltipProps {
  position: { x: number; y: number };
  children: ReactNode;
}

export function MapTooltip({ position, children }: MapTooltipProps) {
  return (
    <Box
      sx={{
        position: "absolute",
        pointerEvents: "none",
        left: position.x,
        top: position.y,
        transform: "translate(-50%, calc(-100% - 15px))",
        zIndex: 1000,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          // bgcolor: "background.paper",
          borderRadius: 1,
          border: 1,
          borderColor: "divider",
          minWidth: 140,
          px: 1.5,
          py: 1,
        }}
      >
        {children}
      </Paper>
    </Box>
  );
}