import { ArcLayer, CompositeLayer, Position } from "deck.gl";
import { createIconLayer, InstitutionPoint } from "./IconLayer";
import { MapViewCollaborationByTopicType } from "db/schemas/core-map-view";

interface TopicNetworkLayerProps {
  id: string;
  data: MapViewCollaborationByTopicType[];
  isDark: boolean;
  getTopicColor: (projectId: string) => [number, number, number, number];
}

export class TopicNetworkLayer extends CompositeLayer<TopicNetworkLayerProps> {
  static layerName = "TopicNetworkLayer";

  renderLayers() {
    const { data, isDark, getTopicColor } = this.props;

    if (!data?.length) return [];
    
    const geoMap = new Map<string, { geolocation: number[]; count: number }>();

    for (const row of data) {
      const aKey = row.a_geolocation.join(",");
      if (!geoMap.has(aKey)) {
        geoMap.set(aKey, { geolocation: row.a_geolocation, count: 1 });
      } else {
        geoMap.get(aKey)!.count++;
      }

      const bKey = row.b_geolocation.join(",");
      if (!geoMap.has(bKey)) {
        geoMap.set(bKey, { geolocation: row.b_geolocation, count: 1 });
      } else {
        geoMap.get(bKey)!.count++;
      }
    }

    const institutionPoints: InstitutionPoint[] = Array.from(geoMap.values());

    const arcLayer = new ArcLayer<MapViewCollaborationByTopicType>({
      id: `${this.props.id}-arcs`,
      data,
      getSourcePosition: (d) => d.a_geolocation as Position,
      getTargetPosition: (d) => d.b_geolocation as Position,
      getSourceColor: (d) => getTopicColor(d.project_id),
      getTargetColor: (d) => getTopicColor(d.project_id),
      getWidth: 2,
      widthMinPixels: 1,
      greatCircle: true,
      pickable: false,
    });

    const iconLayer = createIconLayer({
      id: `${this.props.id}-icons`,
      data: institutionPoints,
      isDark,
    });

    return [arcLayer, iconLayer];
  }
}