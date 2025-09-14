"use client";

import { createContext, ReactNode, useContext, useState } from "react";

type MapBoxStyle = "mapbox/standard" | "mapbox/light-v11" | "mapbox/dark-v11";

interface SettingsContextType {
  mapBoxStyle: MapBoxStyle;
  setMapBoxStyle: (mapBoxStyle: MapBoxStyle) => void;
  isGlobe: boolean;
  setIsGlobe: (useGlobe: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

interface SettingsProviderProps {
  children: ReactNode;
}

function SettingsProvider({ children }: SettingsProviderProps) {
  const [mapBoxStyle, setMapBoxStyle] =
    useState<MapBoxStyle>("mapbox/light-v11");
  const [isGlobe, setIsGlobe] = useState<boolean>(false);

  const settings: SettingsContextType = {
    mapBoxStyle,
    setMapBoxStyle,
    isGlobe,
    setIsGlobe,
  };

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

export { SettingsProvider, useSettings, type MapBoxStyle };
