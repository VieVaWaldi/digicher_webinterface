"use client";

import { AppBar, Box, Chip, IconButton, Toolbar, Typography } from "@mui/material";
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
}

export const Navbar = ({
  title = "Heritage Monitor",
  logoIcon,
  onUserClick,
  showUserIcon = true,
  children,
}: NavbarProps) => {
  const { resolvedMode, setMode } = useThemeMode();

  const toggleTheme = () => {
    setMode(resolvedMode === "dark" ? "light" : "dark");
  };

  return (
    <AppBar
      position="static"
      elevation={0}
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
  );
};

export default Navbar;
