import { MapViewInstitutionType } from "db/schemas/core-map-view";

export type GeoGroup = {
  geolocation: number[];
  institutions: MapViewInstitutionType[];
  count: number;
};

export function groupByGeolocation(data: MapViewInstitutionType[]): GeoGroup[] {
  const geoMap = new Map<string, MapViewInstitutionType[]>();
  data.forEach((item) => {
    if (!item.geolocation) return;
    const key = item.geolocation.join(",");
    if (!geoMap.has(key)) geoMap.set(key, []);
    geoMap.get(key)!.push(item);
  });

  // Stats (uncomment to analyse)
  // const grouped = Array.from(geoMap.values());
  // const withGeo = grouped.reduce((sum, g) => sum + g.length, 0);
  // console.log({
  //   totalInstitutions: filteredData.length,
  //   withGeolocation: withGeo,
  //   withoutGeolocation: filteredData.length - withGeo,
  //   uniqueLocations: geoMap.size,
  //   duplicatesSaved: withGeo - geoMap.size,
  //   withMultiple: grouped.filter((g) => g.length > 1).length,
  //   maxAtSameLocation: Math.max(...grouped.scenarios((g) => g.length)),
  // });

  return Array.from(geoMap.values()).map((institutions) => ({
    geolocation: institutions[0].geolocation!,
    institutions,
    count: institutions.length,
  }));
}
