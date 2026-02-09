"use client";

import { Box, Chip, IconButton, Stack, Typography } from "@mui/material";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import Link from "next/link";
import { ReactNode } from "react";
import { useThemeMode } from "@/app/providers";

export interface MobileNavbarProps {
  title?: string;
  logoIcon?: ReactNode;
  onUserClick?: () => void;
  showUserIcon?: boolean;
  children?: ReactNode;
}

export const MobileNavbar = ({
  title = "Heritage Monitor",
  logoIcon,
  onUserClick,
  showUserIcon = true,
  children,
}: MobileNavbarProps) => {
  const { resolvedMode, setMode } = useThemeMode();

  const toggleTheme = () => {
    setMode(resolvedMode === "dark" ? "light" : "dark");
  };

  return (
    <Stack direction="row" alignItems="center" spacing={1.5} gap={6} flexWrap="wrap">
      {/* Logo + Title */}
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
              fontSize: "1.1rem",
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

      {/* Theme toggle + Account */}
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
    </Stack>
  );
};

export default MobileNavbar;