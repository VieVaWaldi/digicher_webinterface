import { ArcLayer, CompositeLayer, PickingInfo, Position } from "deck.gl";
import { createIconLayer } from "./IconLayer";
import { MapViewCollaborationByTopicType } from "db/schemas/core-map-view";

// Satisfies IconLayerInput (geolocation + count) and GeoGroupTooltip (institutions[].institution_id)
type TopicInstitutionPoint = {
  geolocation: number[];
  count: number;
  institutions: { institution_id: string }[];
};

interface TopicNetworkLayerProps {
  id: string;
  data: MapViewCollaborationByTopicType[];
  isDark: boolean;
  getTopicColor: (projectId: string) => [number, number, number, number];
  onHover?: (info: PickingInfo) => void;
  onClick?: (info: PickingInfo) => void;
}

/**
 * NOTE — deck.gl CompositeLayer event handling:
 * onHover/onClick set on *sublayers* inside renderLayers() are never called.
 * deck.gl only invokes the event callbacks on the top-level layer (this one).
 * The single `onHover` prop here fires for any sublayer hover; use the shape
 * of info.object: icons have `institutions`, arcs have `project_id`.
 */
export class TopicNetworkLayer extends CompositeLayer<TopicNetworkLayerProps> {
  static layerName = "TopicNetworkLayer";

  renderLayers() {
    const { data, isDark, getTopicColor, onHover, onClick } = this.props;

    if (!data?.length) return [];

    const geoMap = new Map<string, TopicInstitutionPoint>();

    for (const row of data) {
      for (const [key, geolocation, institution_id] of [
        [row.a_geolocation.join(","), row.a_geolocation, row.a_institution_id],
        [row.b_geolocation.join(","), row.b_geolocation, row.b_institution_id],
      ] as [string, number[], string][]) {
        if (!geoMap.has(key)) {
          geoMap.set(key, { geolocation, count: 1, institutions: [{ institution_id }] });
        } else {
          const entry = geoMap.get(key)!;
          entry.count++;
          if (!entry.institutions.some((i) => i.institution_id === institution_id)) {
            entry.institutions.push({ institution_id });
          }
        }
      }
    }

    const institutionPoints = Array.from(geoMap.values());

    const maxCost = Math.max(1, ...data.map((d) => d.total_cost ?? 0));

    const arcLayer = new ArcLayer<MapViewCollaborationByTopicType>({
      id: `${this.props.id}-arcs`,
      data,
      getSourcePosition: (d) => d.a_geolocation as Position,
      getTargetPosition: (d) => d.b_geolocation as Position,
      getSourceColor: (d) => getTopicColor(d.project_id),
      getTargetColor: (d) => getTopicColor(d.project_id),
      getWidth: (d) => {
        const cost = d.total_cost ?? 0;
        return cost > 0 ? 1 + (cost / maxCost) * 7 : 2;
      },
      widthMinPixels: 1,
      greatCircle: true,
      pickable: true,
      onClick,
      updateTriggers: {
        getSourceColor: getTopicColor,
        getTargetColor: getTopicColor,
      },
    });

    const iconLayer = createIconLayer({
      id: `${this.props.id}-icons`,
      data: institutionPoints,
      isDark,
      onHover,
      onClick,
    });

    return [arcLayer, iconLayer];
  }
}