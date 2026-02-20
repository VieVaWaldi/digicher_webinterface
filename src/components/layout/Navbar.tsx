"use client";

import { AppBar, Box, Chip, IconButton, Paper, Toolbar, Typography } from "@mui/material";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import Link from "next/link";
import { ReactNode } from "react";
import { useThemeMode } from "@/app/providers";

export interface NavbarProps {
  title?: string;
  logoIcon?: ReactNode;
  onUserClick?: () => void;
  showUserIcon?: boolean;
  children?: ReactNode;
  /** Optional pill hanging from the center of the navbar's bottom border */
  centerTitle?: ReactNode;
}

export const Navbar = ({
  title = "Heritage Monitor",
  logoIcon,
  onUserClick,
  showUserIcon = true,
  children,
  centerTitle,
}: NavbarProps) => {
  const { resolvedMode, setMode } = useThemeMode();

  const toggleTheme = () => {
    setMode(resolvedMode === "dark" ? "light" : "dark");
  };

  return (
    <Box
      sx={{
        position: "relative",
      }}
    >
      <AppBar
        position="static"
        sx={{
          backgroundColor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          borderRadius: 0,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 36,
                  borderRadius: "8px",
                  border: 1,
                  borderColor: "divider",
                }}
              >
                {logoIcon || (
                  <AccountBalanceIcon
                    sx={{ color: "primary.main", fontSize: 20 }}
                  />
                )}
              </Box>
              <Typography
                variant="h6"
                sx={{
                  color: "text.primary",
                  fontWeight: 600,
                  fontSize: "1.3rem",
                }}
              >
                {title}
              </Typography>
              <Chip
                label="BETA"
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  backgroundColor: "primary.main",
                  color: "primary.contrastText",
                }}
              />
            </Box>
          </Link>

          {children}

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton
              onClick={toggleTheme}
              sx={{
                color: "text.primary",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
              aria-label="Toggle theme"
            >
              {resolvedMode === "dark" ? (
                <LightModeOutlinedIcon />
              ) : (
                <DarkModeOutlinedIcon />
              )}
            </IconButton>
            {showUserIcon && (
              <IconButton
                onClick={onUserClick}
                sx={{
                  color: "text.primary",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <AccountCircleOutlinedIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {centerTitle && (
        <Box
          sx={{
            position: "absolute",
            top: "calc(100% - 1px)",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: (theme) => theme.zIndex.appBar,
            pointerEvents: "none",
            border: 1,
            borderTop: 0,
            borderRadius: "0 0 12px 12px",
            borderColor: "divider",
          }}
        >
          <Paper
            elevation={3}
            sx={{
              borderRadius: "0 0 12px 12px",
              px: 3,
              py: 1,
              minWidth: 200,
              minHeight: 40,
              pointerEvents: "auto",
              clipPath: "inset(0 -20px -20px -20px)",
            }}
          >
            {centerTitle}
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default Navbar;
