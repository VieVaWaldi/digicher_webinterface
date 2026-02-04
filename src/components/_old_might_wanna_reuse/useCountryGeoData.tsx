// import { useFetch } from "core/hooks/useFetch";
// import { useMemo } from "react";

// export type InCountryFeature = {
//   /* Represents the data in countries.geojson */
//   type: string;
//   properties: {
//     name: string;
//     "ISO3166-1-Alpha-3": string;
//     "ISO3166-1-Alpha-2": string;
//   };
//   geometry: {
//     type: string;
//     coordinates: any[][];
//   };
// };

// export type ProcessedCountry = {
//   /* Represents what we want countries.geojson to be */
//   name: string;
//   countryCode: string;
//   polygon: any;
//   originalIndex: number; // To keep track of the original feature
// };

// /**
//  * Fixes country codes that are set to "-99" by mapping them to their correct ISO codes
//  * based on the country or territory name
//  *
//  * @param countryCode - The country code to check (and fix if it's "-99")
//  * @param countryName - The name of the country or territory
//  * @returns The correct country code
//  */
// function fixCountryCode(countryCode: string, countryName: string): string {
//   if (countryCode === "GB") {
//     return "UK";
//   }

//   if (countryCode === "GR") {
//     return "EL";
//   }

//   if (countryCode !== "-99") {
//     return countryCode;
//   }

//   const specialTerritoryMap: Record<string, string> = {
//     France: "FR",
//     Norway: "NO",
//     Argentina: "AR",
//     Cyprus: "CY",

//     // Disputed or special territories
//     "Dhekelia Sovereign Base Area": "XS", // UK Sovereign Base Area in Cyprus (non-standard code)
//     Somaliland: "SO", // De facto independent but internationally recognized as part of Somalia
//     Kosovo: "XK", // De facto independent (partially recognized), using XK as per EU recommendation
//     "US Naval Base Guantanamo Bay": "CU", // Located in Cuba, though under US control
//     "Brazilian Island": "BR", // Brazil
//     "Northern Cyprus": "CY", // De facto state, internationally recognized as part of Cyprus
//     "Cyprus No Mans Area": "CY", // Buffer zone in Cyprus
//     "Siachen Glacier": "XX", // Disputed between India and Pakistan
//     "Baykonur Cosmodrome": "KZ", // In Kazakhstan but leased to Russia
//     "Akrotiri Sovereign Base Area": "XS", // UK Sovereign Base Area in Cyprus (non-standard code)
//     "Southern Patagonian Ice Field": "XX", // Disputed between Chile and Argentina
//     "Bir Tawil": "XX", // Unclaimed territory between Egypt and Sudan

//     // Remote islands and territories
//     "Indian Ocean Territories": "AU", // Australian external territories
//     "Coral Sea Islands": "AU", // Australian external territories
//     "Spratly Islands": "XX", // Disputed islands in the South China Sea
//     "Clipperton Island": "FR", // French overseas territory
//     "Ashmore and Cartier Islands": "AU", // Australian external territories
//     "Bajo Nuevo Bank (Petrel Is.)": "XX", // Disputed territory
//     "Serranilla Bank": "XX", // Disputed territory
//     "Scarborough Reef": "XX", // Disputed territory
//   };
//   return specialTerritoryMap[countryName] || "XX";
// }

// export function useCountryGeoData() {
//   const { data, loading, error } = useFetch<any>(
//     "/countries/countries.geojson",
//   );

//   const processGeoJSONForDeckGL = (
//     features: InCountryFeature[],
//   ): ProcessedCountry[] => {
//     const result: ProcessedCountry[] = [];

//     features.forEach((feature, featureIndex) => {
//       const countryCode = fixCountryCode(
//         feature.properties["ISO3166-1-Alpha-2"],
//         feature.properties.name,
//       );

//       if (feature.geometry.type === "MultiPolygon") {
//         feature.geometry.coordinates.forEach((polygonCoords, polygonIndex) => {
//           result.push({
//             name: feature.properties.name,
//             countryCode: countryCode,
//             polygon: polygonCoords,
//             originalIndex: featureIndex,
//           });
//         });
//       } else if (feature.geometry.type === "Polygon") {
//         result.push({
//           name: feature.properties.name,
//           countryCode: countryCode,
//           polygon: feature.geometry.coordinates,
//           originalIndex: featureIndex,
//         });
//       }
//     });

//     return result;
//   };

//   const processedData = useMemo(() => {
//     if (!data) return [];
//     return processGeoJSONForDeckGL(data.features);
//   }, [data]);

//   return {
//     data: processedData,
//     loading,
//     error,
//   };
// }
