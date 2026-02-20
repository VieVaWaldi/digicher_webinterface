import { HexagonLayer } from "deck.gl";
import { baseLayerProps } from "@/components/deckgl/layers/baseLayerProps";

const BASE_ELEVATION_SCALE = 400;
const BASE_RADIUS = 10_000;
const BASE_ZOOM = 4.2;

interface HexagonLayerProps {
  data: any[];
  isGlobe: boolean;
  zoom?: number;
  onClick: (info: any) => void;
  onHover: (info: any) => void;
}

export function createHexagonLayer({
  data,
  isGlobe,
  zoom = BASE_ZOOM,
  onClick,
  onHover,
}: HexagonLayerProps) {
  const zoomFactor = Math.pow(1.6, BASE_ZOOM - zoom);

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
    elevationScale: BASE_ELEVATION_SCALE * zoomFactor * (isGlobe ? 10 : 1),
    extruded: true,
    radius: BASE_RADIUS * zoomFactor,
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