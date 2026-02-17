"use client";

import { Box, IconButton, Paper, Typography, Slide } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ReactNode } from "react";

export const SIDE_MENU_WIDTH = 400;

export interface SideMenuProps {
  /** Which side the menu appears on */
  side: "left" | "right";
  /** Title displayed in the header */
  title: string;
  /** Optional action buttons (e.g., "Reset All") placed between title and close */
  headerActions?: ReactNode;
  /** Menu content */
  children: ReactNode;
  /** Whether the menu is open */
  open: boolean;
  /** Callback when close button is clicked */
  onClose: () => void;
  /** Width of the menu (default: 400) */
  width?: number | string;
}

export const SideMenu = ({
  side,
  title,
  headerActions,
  children,
  open,
  onClose,
  width = SIDE_MENU_WIDTH,
}: SideMenuProps) => {
  const isLeft = side === "left";
  const slideDirection = isLeft ? "right" : "left";

  return (
    <Slide direction={slideDirection} in={open} mountOnEnter unmountOnExit>
      <Paper
        // elevation={4}
        sx={{
          position: "absolute",
          top: 0,
          bottom: 0,
          [side]: 0,
          width,
          borderRadius: 0,
          borderRight: 1,
          borderLeft: 1,
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          zIndex: 1000,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            borderBottom: 1,
            borderColor: "divider",
            flexDirection: !isLeft ? "row-reverse" : "row",
          }}
        >
          {/* Title */}
          <Typography
            variant="h5"
            fontWeight={500}
            // sx={{ fontFamily: "var(--font-inter)" }}
          >
            {title}
          </Typography>

          {/* Actions + Close grouped together */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexDirection: !isLeft ? "row-reverse" : "row",
            }}
          >
            {headerActions}
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                color: "text.secondary",
                "&:hover": {
                  color: "text.primary",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(0,0,0,0.2) transparent",
            "&::-webkit-scrollbar": { width: 6 },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0,0,0,0.2)",
              borderRadius: 3,
            },
            py: 2,
            px: 2.5,
          }}
        >
          {children}
        </Box>
      </Paper>
    </Slide>
  );
};

export default SideMenu;