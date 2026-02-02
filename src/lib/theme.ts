"use client";
import { createTheme } from "@mui/material/styles";

// Color palette - Modern Heritage
const palette = {
  light: {
    background: "#fafafa",
    paper: "#ffffff",
    text: "#1a1a1a",
    textSecondary: "#4a4a4a",
    primary: "#2C5F66", // teal accent
    primaryLight: "#3d7a82",
    primaryDark: "#1e4249",
    secondary: "#8B6914", // warm gold/amber for heritage feel
    secondaryLight: "#a8822a",
    secondaryDark: "#6b500f",
    border: "#e0e0e0",
    divider: "#e8e8e8",
  },
  dark: {
    background: "#121212",
    paper: "#1e1e1e",
    text: "#f5f5f5",
    textSecondary: "#b0b0b0",
    primary: "#4a9ba5", // lighter teal for dark mode
    primaryLight: "#6bb5be",
    primaryDark: "#2C5F66",
    secondary: "#d4a84b", // brighter gold for dark mode
    secondaryLight: "#e0bc6e",
    secondaryDark: "#8B6914",
    border: "#333333",
    divider: "#2a2a2a",
  },
};

// Shared typography settings
// Uses CSS variables from next/font/google for optimized loading
const baseTypography = {
  fontFamily: 'var(--font-inter), "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  letterSpacing: "0.3px",
  h1: {
    fontFamily: 'var(--font-eb-garamond), "EB Garamond", "Georgia", "Times New Roman", serif',
    fontWeight: 500,
    letterSpacing: "0.5px",
    lineHeight: 1.3,
  },
  h2: {
    fontFamily: 'var(--font-eb-garamond), "EB Garamond", "Georgia", "Times New Roman", serif',
    fontWeight: 500,
    letterSpacing: "0.4px",
    lineHeight: 1.3,
  },
  h3: {
    fontFamily: 'var(--font-eb-garamond), "EB Garamond", "Georgia", "Times New Roman", serif',
    fontWeight: 500,
    letterSpacing: "0.3px",
    lineHeight: 1.35,
  },
  h4: {
    fontFamily: 'var(--font-eb-garamond), "EB Garamond", "Georgia", "Times New Roman", serif',
    fontWeight: 500,
    letterSpacing: "0.3px",
    lineHeight: 1.4,
  },
  h5: {
    fontFamily: 'var(--font-eb-garamond), "EB Garamond", "Georgia", "Times New Roman", serif',
    fontWeight: 500,
    letterSpacing: "0.2px",
    lineHeight: 1.4,
  },
  h6: {
    fontFamily: 'var(--font-eb-garamond), "EB Garamond", "Georgia", "Times New Roman", serif',
    fontWeight: 500,
    letterSpacing: "0.2px",
    lineHeight: 1.4,
  },
  body1: {
    lineHeight: 1.4,
    letterSpacing: "0.3px",
  },
  body2: {
    lineHeight: 1.4,
    letterSpacing: "0.3px",
  },
  button: {
    letterSpacing: "0.5px",
    textTransform: "none" as const,
  },
};

// Shared component overrides
const getComponents = (mode: "light" | "dark") => ({
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        lineHeight: 1.4,
        letterSpacing: "0.3px",
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: "none" as const,
        fontWeight: 500,
      },
    },
    defaultProps: {
      disableElevation: true,
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        border: `1px solid ${mode === "light" ? palette.light.border : palette.dark.border}`,
      },
    },
    defaultProps: {
      elevation: 0,
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
      },
    },
    defaultProps: {
      elevation: 0,
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        "& .MuiOutlinedInput-root": {
          borderRadius: 8,
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 16,
      },
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: 8,
        border: `1px solid ${mode === "light" ? palette.light.border : palette.dark.border}`,
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: 6,
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },
});

// Light theme
export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: palette.light.primary,
      light: palette.light.primaryLight,
      dark: palette.light.primaryDark,
      contrastText: "#ffffff",
    },
    secondary: {
      main: palette.light.secondary,
      light: palette.light.secondaryLight,
      dark: palette.light.secondaryDark,
      contrastText: "#ffffff",
    },
    background: {
      default: palette.light.background,
      paper: palette.light.paper,
    },
    text: {
      primary: palette.light.text,
      secondary: palette.light.textSecondary,
    },
    divider: palette.light.divider,
  },
  typography: baseTypography,
  shape: {
    borderRadius: 8,
  },
  components: getComponents("light"),
});

// Dark theme
export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: palette.dark.primary,
      light: palette.dark.primaryLight,
      dark: palette.dark.primaryDark,
      contrastText: "#ffffff",
    },
    secondary: {
      main: palette.dark.secondary,
      light: palette.dark.secondaryLight,
      dark: palette.dark.secondaryDark,
      contrastText: "#1a1a1a",
    },
    background: {
      default: palette.dark.background,
      paper: palette.dark.paper,
    },
    text: {
      primary: palette.dark.text,
      secondary: palette.dark.textSecondary,
    },
    divider: palette.dark.divider,
  },
  typography: baseTypography,
  shape: {
    borderRadius: 8,
  },
  components: getComponents("dark"),
});

// Default export for convenience
export const theme = darkTheme;//lightTheme;
