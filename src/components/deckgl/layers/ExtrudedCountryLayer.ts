import { SolidPolygonLayer } from "@deck.gl/layers";
import { ProcessedCountry } from "@/hooks/queries/useCountryGeoData";
import { MapViewInstitutionType } from "db/schemas/core-map-view";

const MAX_ELEVATION = 1_000_000;
const COLOR_GAMMA = 0.5;

// Theme palette: teal (#4a9ba5) → gold (#d4a84b)
const COLOR_LOW: [number, number, number] = [74, 155, 165]; // teal / primary dark
const COLOR_HIGH: [number, number, number] = [212, 168, 75]; // warm gold / secondary

type EnrichedCountry = ProcessedCountry & { funding: number };

interface ExtrudedCountryLayerProps {
  data: MapViewInstitutionType[];
  countryGeoData: ProcessedCountry[] | undefined;
  isGlobe: boolean;
  onClick?: (info: any) => void;
  onHover?: (info: any) => void;
}

function aggregateByCountry(
  data: MapViewInstitutionType[],
): Record<string, number> {
  const map: Record<string, number> = {};
  for (const inst of data) {
    const cc = inst.country_code;
    if (!cc) continue;
    map[cc] = (map[cc] || 0) + (inst.total_cost || 0);
  }
  return map;
}

function lerpColor(
  t: number,
): [number, number, number, number] {
  const adjusted = Math.pow(Math.min(Math.max(t, 0), 1), COLOR_GAMMA);
  return [
    Math.round(COLOR_LOW[0] + (COLOR_HIGH[0] - COLOR_LOW[0]) * adjusted),
    Math.round(COLOR_LOW[1] + (COLOR_HIGH[1] - COLOR_LOW[1]) * adjusted),
    Math.round(COLOR_LOW[2] + (COLOR_HIGH[2] - COLOR_LOW[2]) * adjusted),
    200,
  ];
}

export function createExtrudedCountryLayer({
  data,
  countryGeoData,
  isGlobe,
  onClick,
  onHover,
}: ExtrudedCountryLayerProps) {
  if (!countryGeoData?.length) {
    return new SolidPolygonLayer({ id: "extruded-countries", data: [] });
  }

  const countryFundingMap = aggregateByCountry(data);
  const values = Object.values(countryFundingMap);
  const maxFunding = values.length > 0 ? Math.max(...values) : 1;

  const enrichedData: EnrichedCountry[] = countryGeoData
    .filter((c) => (countryFundingMap[c.countryCode] || 0) > 0)
    .map((c) => ({
      ...c,
      funding: countryFundingMap[c.countryCode] || 0,
    }));

  return new SolidPolygonLayer<EnrichedCountry>({
    id: "extruded-countries",
    data: enrichedData,
    extruded: true,
    wireframe: true,
    pickable: true,
    autoHighlight: true,
    highlightColor: [1, 200, 1],
    // opacity: 0.9,
    getPolygon: (d) => d.polygon,
    getElevation: (d) => {
      const ratio = maxFunding > 0 ? d.funding / maxFunding : 0;
      return isGlobe ? ratio * MAX_ELEVATION * 2 : ratio * MAX_ELEVATION;
    },
    getFillColor: (d) => {
      const ratio = maxFunding > 0 ? d.funding / maxFunding : 0;
      return lerpColor(ratio);
    },
    getLineColor: [120, 120, 120],
    onClick,
    onHover,
    material: {
      ambient: 0.64,
      diffuse: 0.6,
      shininess: 32,
      specularColor: [51, 51, 51],
    },
  });
}
