import { ColumnLayer } from "@deck.gl/layers";
import { baseLayerProps } from "@/components/deckgl/layers/baseLayerProps";
import { MapViewInstitutionType } from "db/schemas/core-map-view";

const MAX_HEIGHT = 1_000_000;
const BAR_RADIUS = 3_200;
const COLOR_GAMMA = 0.5;
const BASE_ZOOM = 4.2;

interface ColumnLayerProps {
  data: any[];
  maxTotalCost: number;
  isGlobe: boolean;
  zoom?: number;
  onClick?: (info: any) => void;
  onHover?: (info: any) => void;
}

export function createColumnLayer({
  data,
  maxTotalCost,
  isGlobe,
  zoom = BASE_ZOOM,
  onClick,
  onHover,
}: ColumnLayerProps) {
  // Halve elevation for every zoom level above the base zoom, double for every level below.
  const elevationScale = Math.pow(1.6, BASE_ZOOM - zoom) * (isGlobe ? 3.5 : 1);
  const radiusScale =
    BAR_RADIUS * Math.pow(1.6, BASE_ZOOM - zoom) * (isGlobe ? 2.5 : 1);

  return new ColumnLayer({
    ...baseLayerProps,
    id: "column-projects",
    data,
    elevationScale,
    getElevation: (d: any) => {
      const funding = d.institutions.reduce(
        (acc: number, i: MapViewInstitutionType) => acc + (i.total_cost ?? 0),
        0,
      );
      const ratio = maxTotalCost > 0 ? funding / maxTotalCost : 0;
      return ratio * MAX_HEIGHT;
    },
    getFillColor: (d: any) => {
      const funding = d.institutions.reduce(
        (acc: number, i: MapViewInstitutionType) => acc + (i.total_cost ?? 0),
        0,
      );
      const normalizedFunding = maxTotalCost > 0 ? funding / maxTotalCost : 0;
      const adjustedValue = Math.pow(normalizedFunding, COLOR_GAMMA);
      return [
        50 + (255 - 50) * adjustedValue,
        50 - 50 * adjustedValue,
        50 - 50 * adjustedValue,
        200,
      ];
    },
    getPosition: (d: any) => d.geolocation,
    onClick,
    onHover,
    radius: radiusScale,
    diskResolution: 32,
    extruded: true,
    material: {
      ambient: 0.64,
      diffuse: 0.6,
      shininess: 32,
      specularColor: [0, 0, 0],
    },
  });
}