import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export type InCountryFeature = {
  type: string;
  properties: {
    name: string;
    "ISO3166-1-Alpha-3": string;
    "ISO3166-1-Alpha-2": string;
  };
  geometry: {
    type: string;
    coordinates: any[][];
  };
};

export type ProcessedCountry = {
  name: string;
  countryCode: string;
  polygon: any;
  originalIndex: number;
};

function fixCountryCode(countryCode: string, countryName: string): string {
  if (countryCode === "GB") return "UK";
  if (countryCode === "GR") return "EL";
  if (countryCode !== "-99") return countryCode;

  const specialTerritoryMap: Record<string, string> = {
    France: "FR",
    Norway: "NO",
    Argentina: "AR",
    Cyprus: "CY",
    "Dhekelia Sovereign Base Area": "XS",
    Somaliland: "SO",
    Kosovo: "XK",
    "US Naval Base Guantanamo Bay": "CU",
    "Brazilian Island": "BR",
    "Northern Cyprus": "CY",
    "Cyprus No Mans Area": "CY",
    "Siachen Glacier": "XX",
    "Baykonur Cosmodrome": "KZ",
    "Akrotiri Sovereign Base Area": "XS",
    "Southern Patagonian Ice Field": "XX",
    "Bir Tawil": "XX",
    "Indian Ocean Territories": "AU",
    "Coral Sea Islands": "AU",
    "Spratly Islands": "XX",
    "Clipperton Island": "FR",
    "Ashmore and Cartier Islands": "AU",
    "Bajo Nuevo Bank (Petrel Is.)": "XX",
    "Serranilla Bank": "XX",
    "Scarborough Reef": "XX",
  };

  return specialTerritoryMap[countryName] || "XX";
}

function processGeoJSONForDeckGL(
  features: InCountryFeature[],
): ProcessedCountry[] {
  const result: ProcessedCountry[] = [];

  features.forEach((feature, featureIndex) => {
    const countryCode = fixCountryCode(
      feature.properties["ISO3166-1-Alpha-2"],
      feature.properties.name,
    );

    if (feature.geometry.type === "MultiPolygon") {
      feature.geometry.coordinates.forEach((polygonCoords) => {
        result.push({
          name: feature.properties.name,
          countryCode,
          polygon: polygonCoords,
          originalIndex: featureIndex,
        });
      });
    } else if (feature.geometry.type === "Polygon") {
      result.push({
        name: feature.properties.name,
        countryCode,
        polygon: feature.geometry.coordinates,
        originalIndex: featureIndex,
      });
    }
  });

  return result;
}

async function fetchGeoJSON(): Promise<any> {
  const response = await fetch("/countries/countries.geojson");
  if (!response.ok) {
    throw new Error(
      `Failed to fetch countries.geojson: ${response.statusText}`,
    );
  }
  return response.json();
}

export function useCountryGeoData() {
  const { data: rawData, ...rest } = useQuery({
    queryKey: ["country-geo-data"],
    queryFn: fetchGeoJSON,
    staleTime: Infinity,
  });

  const data = useMemo(() => {
    if (!rawData) return undefined;
    return processGeoJSONForDeckGL(rawData.features);
  }, [rawData]);

  return { data, ...rest };
}
