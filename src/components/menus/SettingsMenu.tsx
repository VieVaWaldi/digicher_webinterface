import React from "react";

import Image from "next/image";
import { Card } from "shadcn/card";
import { H5 } from "shadcn/typography";
import { MapBoxStyle, useSettings } from "core/context/SettingsContext";
import { ViewToggle } from "../buttons/toggle";

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
      imageUrl: "/images/settings/mapbox-standard.png",
    },
    {
      value: "mapbox/light-v11",
      label: "Light",
      imageUrl: "/images/settings/mapbox-light.png",
    },
    {
      value: "mapbox/dark-v11",
      label: "Dark",
      imageUrl: "/images/settings/mapbox-dark.png",
    },
  ];

  return (
    <div className="flex h-full flex-col justify-end">
      <div className="space-y-8">
        {/* Map Style Selection */}
        <div className="flex flex-col space-y-4">
          <H5 className="text-center">Map Style</H5>
          <div className="flex flex-col items-center gap-4">
            {mapStyles.map((style) => (
              <Card
                key={style.value}
                className={`relative w-64 cursor-pointer overflow-hidden ${
                  mapBoxStyle === style.value
                    ? "ring-2 ring-primary"
                    : "hover:ring-2 hover:ring-muted"
                }`}
                onClick={() => setMapBoxStyle(style.value)}
              >
                <div className="relative h-20">
                  <Image
                    src={style.imageUrl}
                    alt={style.label}
                    height={240}
                    width={100}
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
        <div className="flex flex-col items-center space-y-2 pb-8">
          <H5>Map View</H5>
          <ViewToggle isGlobe={isGlobe} onChange={setIsGlobe} />
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;
