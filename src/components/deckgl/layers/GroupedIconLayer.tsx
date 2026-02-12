import { CompositeLayer, IconLayer, UpdateParameters, Position } from "deck.gl";
import Supercluster, { ClusterProperties, PointFeature } from "supercluster";
import { clusterIconUrl, CLUSTER_ICON_SIZE } from "./icons";
import { palette } from "@/lib/theme";
import { createIconLayer } from "./IconLayer";

interface GroupedInstitution {
  geolocation: number[] | null;
  institutions: unknown[];
  count: number;
}

interface PointProps {
  count: number;
}

interface ClusterProps {
  totalCount: number;
}

interface ClusterPoint {
  geolocation: Position;
  count: number;
  isCluster: boolean;
}

interface GroupedIconLayerProps {
  id: string;
  data: GroupedInstitution[];
  isDark: boolean;
  pickable?: boolean;
  onClick?: (info: unknown) => void;
}

const ZOOM_THRESHOLD: number = 6;

export class GroupedIconLayer extends CompositeLayer<GroupedIconLayerProps> {
  static layerName = "GroupedIconLayer";

  state!: {
    index: Supercluster<PointProps, ClusterProps>;
  };

  initializeState() {
    this.setState({
      index: new Supercluster<PointProps, ClusterProps>({
        radius: 60,
        maxZoom: ZOOM_THRESHOLD,
        map: (props) => ({ totalCount: props.count }),
        reduce: (acc, props) => {
          acc.totalCount += props.totalCount;
        },
      }),
    });
  }

  shouldUpdateState({ changeFlags }: UpdateParameters<this>): boolean {
    if (changeFlags.propsOrDataChanged) return true;
    // Only update on viewport changes when zoomed past the cluster threshold
    return (
      changeFlags.viewportChanged && this.context.viewport.zoom < ZOOM_THRESHOLD
    );
  }

  updateState(params: UpdateParameters<this>) {
    if (params.changeFlags.dataChanged) {
      const features: PointFeature<PointProps>[] = (this.props.data || [])
        .filter((d) => d.geolocation)
        .map((d) => ({
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: d.geolocation as [number, number],
          },
          properties: { count: d.count },
        }));
      this.state.index.load(features);
    }
  }

  renderLayers() {
    const { isDark, onClick } = this.props;
    const zoom = Math.floor(this.context.viewport.zoom);
    const clusters = this.state.index.getClusters([-180, -85, 180, 85], zoom);

    const clusterData: ClusterPoint[] = clusters.map((c) => {
      const isCluster = "cluster" in c.properties && c.properties.cluster;
      return {
        geolocation: c.geometry.coordinates as Position,
        count: isCluster
          ? (c.properties as ClusterProperties & ClusterProps).totalCount
          : (c.properties as PointProps).count,
        isCluster,
      };
    });

    const singles = clusterData.filter((d) => !d.isCluster);
    const clustered = clusterData.filter((d) => d.isCluster);

    const singleLayer = createIconLayer({
      id: `${this.props.id}-singles`,
      data: singles,
      isDark,
      onClick,
    });

    const clusterLayer = new IconLayer<ClusterPoint>({
      id: `${this.props.id}-clusters`,
      data: clustered,
      pickable: true,
      getPosition: (d) =>
        d.geolocation as Position,
      getIcon: (d) => ({
        url: clusterIconUrl(
          isDark ? palette.dark.secondaryLight : palette.light.secondaryLight,
          d.count,
          isDark,
        ),
        width: CLUSTER_ICON_SIZE,
        height: CLUSTER_ICON_SIZE,
        anchorY: CLUSTER_ICON_SIZE,
      }),
      getSize: (d) => Math.min(80, 28 + d.count * 0.05),
      sizeUnits: "pixels",
      // sizeMinPixels: 32,
      // sizeMaxPixels: 124,
      onClick,
      updateTriggers: {
        getIcon: isDark,
        getSize: zoom,
      },
      parameters: { depthCompare: "less-equal" },
    });

    return [singleLayer, clusterLayer];
  }
}

// A) Linear scale — simple, predictable
// getSize: (d) => Math.min(80, 28 + d.count * 0.05)
// Starts at 28px, grows slowly, caps at 80px. Good if most clusters are small.
//
//   B) Square root scale — common for map bubbles, prevents huge clusters from dominating
// getSize: (d) => 24 + Math.sqrt(d.count) * 4
// 10 institutions = 37px, 100 = 64px, 1000 = 150px. No hard cap needed since growth tapers naturally.
//
//   C) Log scale — compresses large ranges heavily, all clusters stay readable
// getSize: (d) => 24 + Math.log2(d.count) * 8
// 2 institutions = 32px, 10 = 51px, 100 = 77px, 1000 = 104px. Tight range even with wildly different counts.
//
//   D) Stepped tiers — discrete sizes, very clean visually
// getSize: (d) =>
//   d.count > 500 ? 72 : d.count > 100 ? 56 : d.count > 10 ? 40 : 28
// Four distinct sizes. Easy to read at a glance.
//
//   I'd recommend B or C — they scale naturally without a hard cap and won't produce icons that are too similar or too extreme. Tweak the base size (24) and multiplier (4/8) to taste.