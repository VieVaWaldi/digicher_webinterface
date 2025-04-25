"use client";

import React, { useState } from "react";
import { Globe2, Home } from "lucide-react";
import { SolidPolygonLayer } from "@deck.gl/layers";
import { Button } from "shadcn/button";
import { useRouter } from "next/navigation";
import {
  ProcessedCountry,
  useCountryGeoData,
} from "core/hooks/queries/countrygeodata/useCountryGeoData";
import BaseDeckGLMap from "components/scenarios/BaseDeckGLMap";
import { INITIAL_VIEW_STATE_TILTED_EU } from "deckgl/viewports";
import { useFundingInstitutionPoints } from "core/hooks/queries/scenario_points/useFundingInstitutionPoints";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "shadcn/sheet";
import SettingsMenu from "components/menus/SettingsMenu";
import {
  FundingInstitutionPoint,
  InstitutionProjectsFunding,
} from "datamodel/scenario_points/types";
import { Slider } from "shadcn/slider";
import { H4, H5 } from "shadcn/typography";

export default function CountryFunding() {
  const [year, setYear] = useState(2024);
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    countryName: "",
    funding: 0,
  });

  const router = useRouter();
  const MAX_ELEVATION = 5000000;

  const { data: countryGeoData } = useCountryGeoData();

  const {
    data: fundingInstitutionPoints,
    loading: isLoading,
    error,
  } = useFundingInstitutionPoints();

  const reduceFundingInstitutionPoints = (
    points: FundingInstitutionPoint[] | undefined,
    useYear: boolean,
  ): Record<string, number> => {
    if (!points || !Array.isArray(points)) return {};

    return points.reduce<Record<string, number>>((acc, inst) => {
      const countryCode = inst?.country_code;
      if (!countryCode) return acc;

      acc[countryCode] =
        (acc[countryCode] || 0) +
        (inst.projects_funding || []).reduce(
          (sum: number, p: InstitutionProjectsFunding) => {
            // If we're not filtering by year, include all projects with contributions
            if (!useYear) {
              return sum + (p.ec_contribution || 0);
            }

            // If we are filtering by year, only include projects with matching year
            if (!p.start_date) {
              return sum;
            }
            const projectStartYear = new Date(p.start_date).getFullYear();
            return (
              sum + (projectStartYear === year ? p.ec_contribution || 0 : 0)
            );
          },
          0,
        );

      return acc;
    }, {});
  };

  const countryFundingMap = reduceFundingInstitutionPoints(
    fundingInstitutionPoints,
    true,
  );

  const getFundingForCountry = (countryCode: string) => {
    if (countryFundingMap[countryCode]) {
      return countryFundingMap[countryCode];
    }
    return 0;
  };

  const countriesWithFunding =
    countryGeoData?.filter(
      (country) => getFundingForCountry(country.countryCode) > 0,
    ) || [];

  // --- HELPER ----------------------------------------------------------------------------- //

  const countryFundingMapWithoutYear = reduceFundingInstitutionPoints(
    fundingInstitutionPoints,
    false,
  );

  const maxFundingAll =
    Object.values(countryFundingMapWithoutYear).length > 0
      ? Math.max(...(Object.values(countryFundingMapWithoutYear) as number[]))
      : 1;

  const maxFunding =
    Object.values(countryFundingMap).length > 0
      ? Math.max(...(Object.values(countryFundingMap) as number[]))
      : 1;

  const getColorForValue = (value: number): [number, number, number] => {
    const normalized = maxFunding ? value / maxFunding : 0;
    return [
      Math.floor(normalized * 255),
      Math.floor(100 + normalized * 50),
      Math.floor(255 - normalized * 255),
    ];
  };

  const formatEuro = (value: number): string => {
    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getTotalFundingForYear = (
    countryFundingMap: Record<string, number>,
  ): number => {
    return Object.values(countryFundingMap).length > 0
      ? Object.values(countryFundingMap).reduce((sum, value) => sum + value, 0)
      : 0;
  };
  // --- LAYER ----------------------------------------------------------------------------- //

  const layers =
    countriesWithFunding.length > 0
      ? [
          new SolidPolygonLayer({
            id: "countries-layer",
            data: countriesWithFunding,
            extruded: true,
            wireframe: true,
            getPolygon: (d: ProcessedCountry) => {
              return d.polygon;
            },
            getElevation: (d: ProcessedCountry) => {
              const value = getFundingForCountry(d.countryCode) || 0;
              return (value / maxFundingAll) * MAX_ELEVATION;
            },
            getFillColor: (d: ProcessedCountry) => {
              const value = getFundingForCountry(d.countryCode) || 0;
              return getColorForValue(value);
            },
            getLineColor: [80, 80, 80],
            pickable: true,
            onClick: (info) => {
              if (info.object) {
                const country = info.object as ProcessedCountry;
                const funding = getFundingForCountry(country.countryCode);
                setTooltip({
                  visible: true,
                  x: info.x,
                  y: info.y,
                  countryName: country.name,
                  funding: funding,
                });
              }
            },
          }),
        ]
      : [];

  // --- REACT ----------------------------------------------------------------------------- //

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading map data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        Error loading map: {error}
      </div>
    );
  }

  const HomeButton = () => {
    return (
      <Button
        variant="secondary"
        className="h-12 w-12 rounded-lg bg-white text-orange-500 shadow-md"
        onClick={() => router.push("/")}
      >
        <Home className="h-6 w-6" strokeWidth={2.2} />
      </Button>
    );
  };

  const GlobeButton = () => {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="secondary"
            className="h-12 w-12 rounded-lg bg-white text-orange-500 shadow-md"
          >
            <Globe2 className="h-6 w-6" strokeWidth={2.2} />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetTitle>Settings</SheetTitle>
          <SettingsMenu />
        </SheetContent>
      </Sheet>
    );
  };

  const TopLeftMenu = () => {
    return (
      <div
        className="absolute left-4 top-4 z-10 flex flex-col space-y-2"
        onClick={() => setTooltip({ ...tooltip, visible: false })}
      >
        <HomeButton />
        <GlobeButton />
      </div>
    );
  };

  const BottomLeftMenu = () => {
    return (
      <div
        className="absolute bottom-4 left-4 z-10 rounded-lg bg-black/15 p-4 backdrop-blur-sm"
        onClick={() => setTooltip({ ...tooltip, visible: false })}
      >
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-6 md:space-y-0">
          <div className="flex w-40 min-w-64 items-center gap-4 md:min-w-96">
            <H4 className="text-gray-100">{year}</H4>
            <Slider
              defaultValue={[year]}
              min={2014}
              max={2025}
              step={1}
              className="flex-grow py-2"
              onValueCommit={(newValue) => setYear(newValue[0])}
            />
          </div>
        </div>
      </div>
    );
  };

  // Country Tooltip component that appears when a country is clicked
  const CountryTooltip = () => {
    if (!tooltip.visible) return null;

    return (
      <div
        className="absolute z-20 rounded-lg bg-black/15 p-4 backdrop-blur-sm"
        style={{
          left: tooltip.x,
          top: tooltip.y - 70, // Position above the click point
        }}
      >
        <div className="flex flex-col space-y-1">
          <H4 className="text-gray-100">{tooltip.countryName}</H4>
          <div className="text-gray-100">
            Funding: {formatEuro(tooltip.funding)}
          </div>
        </div>
      </div>
    );
  };

  const Title = () => {
    return (
      <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 transform rounded-lg bg-white px-4 py-2 text-center shadow-md">
        <H5>
          <span className="text-gray-700">EC Funding in</span>{" "}
          <span className="font-semibold text-orange-400">{year}</span>{" "}
          <span>totaling</span>{" "}
          <span className="font-semibold text-orange-400">
            {formatEuro(getTotalFundingForYear(countryFundingMap))}
          </span>{" "}
          <span>for CH*</span>
        </H5>
      </div>
    );
  };

  return (
    <div className="m-0 h-screen w-full overflow-hidden p-0">
      <div className="relative m-0 h-full w-full p-0">
        <div className="absolute inset-0 overflow-hidden rounded-2xl border border-gray-200">
          <Title />
          <TopLeftMenu />
          <BaseDeckGLMap
            id="funding-map"
            layers={layers}
            viewState={INITIAL_VIEW_STATE_TILTED_EU}
            onMapClick={(event) => {
              // Hide tooltip when clicking on the map (not on a country)
              if (!event.picked) {
                setTooltip({ ...tooltip, visible: false });
              }
            }}
          />
          <BottomLeftMenu />
          <CountryTooltip />
        </div>
      </div>
    </div>
  );
}
