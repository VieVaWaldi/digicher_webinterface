import { ColumnLayer } from "@deck.gl/layers";
import { baseLayerProps } from "@/components/deckgl/layers/baseLayerProps";
import { MapViewInstitutionType } from "db/schemas/core-map-view";

const MAX_HEIGHT = 1_000_000;
const BAR_RADIUS = 2_200;
const COLOR_GAMMA = 0.5;

interface ColumnLayerProps {
  data: any[];
  maxTotalCost: number;
  isGlobe: boolean;
  onClick?: (info: any) => void;
  onHover?: (info: any) => void;
}

export function createColumnLayer({
  data,
  maxTotalCost,
  isGlobe,
  onClick,
  onHover,
}: ColumnLayerProps) {
  return new ColumnLayer({
    ...baseLayerProps,
    id: "column-projects",
    data,
    getElevation: (d: any) => {
      const funding = d.institutions.reduce(
        (acc: number, i: MapViewInstitutionType) => acc + (i.total_cost ?? 0),
        0,
      );
      const ratio = maxTotalCost > 0 ? funding / maxTotalCost : 0;
      return isGlobe ? ratio * MAX_HEIGHT * 3.5 : ratio * MAX_HEIGHT;
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
    radius: isGlobe ? BAR_RADIUS * 2.5 : BAR_RADIUS,
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