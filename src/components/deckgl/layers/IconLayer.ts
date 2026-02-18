import { IconLayer, Position } from "deck.gl";
import { institutionIconUrl } from "./icons";
import { palette } from "@/lib/theme";

// Minimal structural type — both GeoGroup and GroupedIconLayer's RenderPoint satisfy this
interface IconLayerInput {
  geolocation: Position | number[];
  count: number;
}

interface InstitutionIconLayerProps {
  id: string;
  data: IconLayerInput[];
  isDark: boolean;
  onClick?: (info: any) => void;
  onHover?: (info: any) => void;
}

export function createIconLayer({
  id,
  data,
  isDark,
  onClick,
  onHover,
}: InstitutionIconLayerProps) {
  return new IconLayer<IconLayerInput>({
    id,
    data,
    pickable: true,
    getPosition: (d) => d.geolocation ? d.geolocation as Position : [10, 10],
    getIcon: (d) => ({
      url: institutionIconUrl(
        isDark
          ? d.count >= 2
            ? palette.dark.secondaryLight
            : palette.dark.primaryLight
          : d.count >= 2
            ? palette.light.secondaryLight
            : palette.light.primaryLight,
      ),
      width: 64,
      height: 64,
      anchorY: 64,
    }),
    getSize: 400,
    sizeUnits: "meters",
    sizeMinPixels: 12,
    sizeMaxPixels: 40,
    onClick,
    onHover,
    updateTriggers: {
      getIcon: isDark,
    },
    parameters: { depthCompare: "always" },
  });
}