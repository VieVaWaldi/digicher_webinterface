import { ArcLayer, CompositeLayer, PickingInfo, Position } from "deck.gl";
import { createIconLayer } from "./IconLayer";
import { GeoGroup } from "@/app/scenarios/scenario_data";
import { MapViewCollaborationNetworkType } from "db/schemas/core-map-view";

interface CollaborationNetworkLayerProps {
  id: string;
  data: GeoGroup[];
  isDark: boolean;
  onClick?: (info: unknown) => void;
  onHover?: (info: PickingInfo) => void;
  getTopicColor?: (projectId: string) => [number, number, number, number];
  networkData?: MapViewCollaborationNetworkType[];
  sourcePosition?: number[];
}

/**
 * NOTE — deck.gl CompositeLayer event handling:
 * onHover/onClick set on *sublayers* inside renderLayers() are never called.
 * deck.gl only invokes the event callbacks on the top-level layer (this one).
 * The single `onHover` prop here fires for any sublayer hover; use the shape
 * of info.object to tell icon data (has `institutions`) from arc data (has `projects`).
 */
export class CollaborationNetworkLayer extends CompositeLayer<CollaborationNetworkLayerProps> {
  static layerName = "CollaborationNetworkLayer";

  renderLayers() {
    const { data, isDark, networkData, sourcePosition, onHover, getTopicColor } = this.props;

    /* Use default institution view when no inst is selected, otherwise only show the network */
    if (!networkData?.length || !sourcePosition) {
      const iconLayer = createIconLayer({
        id: `${this.props.id}-icons`,
        data,
        isDark,
        onHover,
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
      onHover,
    });

    const arcCost = (d: MapViewCollaborationNetworkType) =>
      d.projects?.reduce((s, p) => s + (p.total_cost ?? 0), 0) ?? 0;
    const maxCost = Math.max(1, ...networkData.map(arcCost));

    const topProject = (d: MapViewCollaborationNetworkType) =>
      d.projects?.reduce((best, p) =>
        (p.total_cost ?? 0) > (best?.total_cost ?? 0) ? p : best,
      );

    const arcLayer = new ArcLayer<MapViewCollaborationNetworkType>({
      id: `${this.props.id}-arcs`,
      data: networkData,
      getSourcePosition: () => sourcePosition as Position,
      getTargetPosition: (d) => d.collaborator_geolocation as Position,
      getSourceColor: (d) => {
        const top = topProject(d);
        return top && getTopicColor ? getTopicColor(top.project_id) : [80, 180, 250, 200];
      },
      getTargetColor: (d) => {
        const top = topProject(d);
        return top && getTopicColor ? getTopicColor(top.project_id) : [255, 80, 120, 200];
      },
      getWidth: (d) => {
        const cost = arcCost(d);
        return cost > 0 ? 1 + (cost / maxCost) * 7 : 2;
      },
      widthMinPixels: 1,
      greatCircle: true,
      pickable: true,
      onClick: this.props.onClick,
      updateTriggers: {
        getSourceColor: getTopicColor,
        getTargetColor: getTopicColor,
      },
    });

    return [arcLayer, iconLayer];
  }
}