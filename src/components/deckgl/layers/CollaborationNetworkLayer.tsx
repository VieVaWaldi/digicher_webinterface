import { ArcLayer, CompositeLayer, Position } from "deck.gl";
import { createIconLayer } from "./IconLayer";
import { GeoGroup } from "@/app/scenarios/scenario_data";
import { MapViewCollaborationNetworkType } from "db/schemas/core-map-view";

interface CollaborationNetworkLayerProps {
  id: string;
  data: GeoGroup[];
  isDark: boolean;
  onClick?: (info: unknown) => void;
  networkData?: MapViewCollaborationNetworkType[];
  sourcePosition?: number[];
}

export class CollaborationNetworkLayer extends CompositeLayer<CollaborationNetworkLayerProps> {
  static layerName = "CollaborationNetworkLayer";

  renderLayers() {
    const { data, isDark, networkData, sourcePosition } = this.props;

    /* Use default institution view when no inst is selected, otherwise only show the network */
    if (!networkData?.length || !sourcePosition) {
      const iconLayer = createIconLayer({
        id: `${this.props.id}-icons`,
        data,
        isDark,
      });
      return [iconLayer];
    }

    const networkIds = new Set<string>();
    for (const d of networkData) {
      networkIds.add(d.institution_id);
      networkIds.add(d.collaborator_id);
    }

    const filteredData = data
      .map((group) => {
        const matchingInstitutions = group.institutions.filter((inst) =>
          networkIds.has(inst.institution_id),
        );
        if (!matchingInstitutions.length) return null;
        return {
          ...group,
          institutions: matchingInstitutions,
          count: matchingInstitutions.length,
        };
      })
      .filter(Boolean) as typeof data;

    const iconLayer = createIconLayer({
      id: `${this.props.id}-icons`,
      data: filteredData,
      isDark,
    });

    const arcLayer = new ArcLayer<MapViewCollaborationNetworkType>({
      id: `${this.props.id}-arcs`,
      data: networkData,
      getSourcePosition: () => sourcePosition as Position,
      getTargetPosition: (d) => d.collaborator_geolocation as Position,
      getSourceColor: [80, 180, 250, 200],
      getTargetColor: [255, 80, 120, 200],
      getWidth: 2,
      widthMinPixels: 1,
      greatCircle: true,
      pickable: false,
    });

    return [arcLayer, iconLayer];
  }
}