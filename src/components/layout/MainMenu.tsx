"use client";

import { Box, Chip, IconButton, Paper, Slide, Typography } from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import GroupsIcon from "@mui/icons-material/Groups";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import PaidIcon from "@mui/icons-material/Paid";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useThemeMode } from "@/app/providers";
import MapIcon from "@mui/icons-material/Map";
import React from "react";

interface MainMenuProps {
  open: boolean;
  onClose: () => void;
  toQueryString?: () => string;
  toListQueryString?: () => string;
}

const NAV_LINKS = [
  { href: "/list", icon: <FormatListBulletedIcon />, label: "List Search" },
  {
    href: "/scenarios/explore",
    icon: <MapIcon />,
    label: "Overview",
  },
  {
    href: "/scenarios/collaboration",
    icon: <GroupsIcon />,
    label: "Collaboration",
  },
  { href: "/scenarios/funding", icon: <PaidIcon />, label: "Funding" },
];

export const MainMenu = ({
  open,
  onClose,
  toQueryString,
  toListQueryString,
}: MainMenuProps) => {
  const pathname = usePathname();
  const { resolvedMode, setMode } = useThemeMode();

  const toggleTheme = () => {
    setMode(resolvedMode === "dark" ? "light" : "dark");
  };

  const titleContent = (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Typography
        variant="h6"
        sx={{ color: "text.primary", fontWeight: 600, fontSize: "1.3rem" }}
      >
        Heritage Monitor
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
  );

  return (
    <>
      {/* Backdrop */}
      {open && (
        <Box
          onClick={onClose}
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 1299,
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        />
      )}

      {/* Panel */}
      <Slide direction="right" in={open} mountOnEnter unmountOnExit>
        <Paper
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            width: 280,
            zIndex: 1300,
            borderRadius: 0,
            borderRight: 1,
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header: Title + Close */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
              py: 1.5,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            {pathname === "/" ? (
              titleContent
            ) : (
              <Link
                href="/"
                style={{ textDecoration: "none" }}
                onClick={onClose}
              >
                {titleContent}
              </Link>
            )}
            <IconButton
              onClick={onClose}
              size="small"
              sx={{ color: "text.secondary" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Body: DarkMode section + Links */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* DarkMode + Account — between header and links */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderBottom: 1,
                borderColor: "divider",
              }}
            >
              <IconButton onClick={toggleTheme} sx={{ color: "text.primary" }}>
                {resolvedMode === "dark" ? (
                  <LightModeOutlinedIcon />
                ) : (
                  <DarkModeOutlinedIcon />
                )}
              </IconButton>
              <IconButton disabled sx={{ color: "text.disabled" }}>
                <AccountCircleOutlinedIcon />
              </IconButton>
            </Box>

            {/* Nav Links */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <Box sx={{ py: 1 }}>
                {NAV_LINKS.map(({ href, icon, label }) => {
                  const isScenario = href.startsWith("/scenarios/");
                  const resolvedHref =
                    isScenario && toQueryString
                      ? (() => {
                          const qs = toQueryString();
                          return qs ? `${href}?${qs}` : href;
                        })()
                      : href === "/list" && toListQueryString
                        ? (() => {
                            const qs = toListQueryString();
                            return qs ? `${href}?${qs}` : href;
                          })()
                        : href;
                  return (
                    <Link
                      key={href}
                      href={resolvedHref}
                      onClick={onClose}
                      style={{ textDecoration: "none" }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          px: 2,
                          py: 1.5,
                          color:
                            pathname === href ? "primary.main" : "text.primary",
                          backgroundColor:
                            pathname === href
                              ? "action.selected"
                              : "transparent",
                          "&:hover": { backgroundColor: "action.hover" },
                          cursor: "pointer",
                          borderRadius: 1,
                          mx: 1,
                        }}
                      >
                        <Box sx={{ display: "flex", color: "inherit" }}>
                          {icon}
                        </Box>
                        <Typography
                          variant="body1"
                          sx={{
                            color: "inherit",
                            fontWeight: pathname === href ? 600 : 400,
                          }}
                        >
                          {label}
                        </Typography>
                      </Box>
                    </Link>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Paper>
      </Slide>
    </>
  );
};

export default MainMenu;
