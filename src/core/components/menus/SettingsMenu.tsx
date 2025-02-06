import React from "react";
import { Globe2, Map } from "lucide-react";
import { MapBoxStyle, useSettings } from "core/context/SettingsContext";
import { Card } from "../shadcn/card";
import { Button } from "../shadcn/button";

const ViewToggle = ({
  isGlobe,
  onChange,
}: {
  isGlobe: boolean;
  onChange: (value: boolean) => void;
}) => {
  return (
    <Button
      variant="outline"
      className="relative h-10 w-32 cursor-pointer overflow-hidden p-0"
      onClick={() => onChange(!isGlobe)}
    >
      {/* Background indicator that slides */}
      <div
        className={`absolute inset-0 bg-primary transition-transform duration-200 ${
          isGlobe ? "translate-x-0" : "translate-x-16"
        }`}
        style={{ width: "50%" }}
      />

      {/* Globe side */}
      <div
        className={`absolute left-0 flex h-full w-16 items-center justify-center transition-colors duration-200 ${
          isGlobe ? "text-primary-foreground" : "text-foreground"
        }`}
      >
        <Globe2 className="h-4 w-4" />
      </div>

      {/* Map side */}
      <div
        className={`absolute right-0 flex h-full w-16 items-center justify-center transition-colors duration-200 ${
          !isGlobe ? "text-primary-foreground" : "text-foreground"
        }`}
      >
        <Map className="h-4 w-4" />
      </div>
    </Button>
  );
};

const SettingsMenu = () => {
  const { mapBoxStyle, setMapBoxStyle, isGlobe, setIsGlobe } = useSettings();

  const mapStyles: Array<{
    value: MapBoxStyle;
    label: string;
    imageUrl: string;
  }> = [
    {
      value: "mapbox/standard",
      label: "Standard",
      imageUrl: "/api/placeholder/120/80",
    },
    {
      value: "mapbox/light-v11",
      label: "Light",
      imageUrl: "/api/placeholder/120/80",
    },
    {
      value: "mapbox/dark-v11",
      label: "Dark",
      imageUrl: "/api/placeholder/120/80",
    },
  ];

  return (
    <div className="flex h-full flex-col justify-end">
      <div className="space-y-8">
        {/* Map Style Selection */}
        <div className="flex flex-col space-y-4">
          <h3 className="text-lg font-semibold">Map Style</h3>
          <div className="flex flex-col gap-4">
            {mapStyles.map((style) => (
              <Card
                key={style.value}
                className={`relative cursor-pointer overflow-hidden ${
                  mapBoxStyle === style.value
                    ? "ring-2 ring-primary"
                    : "hover:ring-2 hover:ring-muted"
                }`}
                onClick={() => setMapBoxStyle(style.value)}
              >
                <div className="relative h-20">
                  <img
                    src={style.imageUrl}
                    alt={style.label}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <span className="text-sm font-medium text-white">
                      {style.label}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex flex-col items-center space-y-2 pb-4">
          <span className="text-sm font-medium">Map View</span>
          <ViewToggle isGlobe={isGlobe} onChange={setIsGlobe} />
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;
