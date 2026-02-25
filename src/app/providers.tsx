"use client";
import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SettingsProvider } from "context/SettingsContext";
import { ThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import CssBaseline from "@mui/material/CssBaseline";
import { lightTheme, darkTheme } from "lib/theme";

type ThemeMode = "light" | "dark" | "system";

interface ThemeModeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  resolvedMode: "light" | "dark";
}

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within Providers");
  }
  return context;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24,
      gcTime: 1000 * 60 * 60 * 24,
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resolvedMode = mode === "system" ? (prefersDarkMode ? "dark" : "light") : mode;
  const theme = useMemo(
    () => (resolvedMode === "dark" ? darkTheme : lightTheme),
    [resolvedMode]
  );

  const contextValue = useMemo(
    () => ({ mode, setMode, resolvedMode }),
    [mode, resolvedMode]
  );

  // Prevent flash by using light theme during SSR
  const ssrTheme = mounted ? theme : lightTheme;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeModeContext.Provider value={contextValue}>
        <ThemeProvider theme={ssrTheme}>
          <CssBaseline />
          <SettingsProvider>{children}</SettingsProvider>
        </ThemeProvider>
      </ThemeModeContext.Provider>
    </QueryClientProvider>
  );
}
