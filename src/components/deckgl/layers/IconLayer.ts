import { IconLayer, Position } from "deck.gl";
import { institutionIconUrl } from "./icons";
import { palette } from "@/lib/theme";

export interface InstitutionPoint {
  geolocation: Position | number[];
  count: number;
}

interface InstitutionIconLayerProps {
  id: string;
  data: InstitutionPoint[];
  isDark: boolean;
  onClick?: (info: unknown) => void;
}

export function createIconLayer({
  id,
  data,
  isDark,
  onClick,
}: InstitutionIconLayerProps) {
  return new IconLayer<InstitutionPoint>({
    id,
    data,
    pickable: true,
    getPosition: (d) => d.geolocation as Position,
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
    sizeMinPixels: 12,  // floor when zoomed out
    sizeMaxPixels: 40,  // cap when zoomed in
    onClick,
    updateTriggers: {
      getIcon: isDark,
    },
    parameters: { depthCompare: "always" },
  });
}