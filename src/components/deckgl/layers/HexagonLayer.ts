import { HexagonLayer } from "deck.gl";
import { baseLayerProps } from "@/components/deckgl/layers/baseLayerProps";

interface HexagonLayerProps {
  data: any[];
  isGlobe: boolean;
  onClick: (info: any) => void;
  onHover: (info: any) => void;
}

export function createHexagonLayer({
  data,
  isGlobe,
  onClick,
  onHover,
}: HexagonLayerProps) {
  return new HexagonLayer({
    ...baseLayerProps,
    id: "hexagon-projects",
    data,
    getPosition: (d: any) => d.geolocation || [0, 0],
    getColorWeight: (d: any) =>
      d.institutions.reduce(
        (acc: number, i: any) => acc + (i.total_cost ?? 0),
        0,
      ),
    getElevationWeight: (d: any) =>
      d.institutions.reduce(
        (acc: number, i: any) => acc + (i.total_cost ?? 0),
        0,
      ),
    elevationScale: isGlobe ? 4000 : 400,
    extruded: true,
    radius: 10000,
    onClick: onClick as any,
    onHover: onHover as any,
    gpuAggregation: false, // Needed for simple point aggregation for onclick
    colorRange: [
      [255, 255, 178],
      [254, 204, 92],
      [253, 141, 60],
      [240, 59, 32],
      [189, 0, 38],
      [128, 0, 38],
    ],
    elevationRange: [0, 3000],
    coverage: 0.8,
  });
}