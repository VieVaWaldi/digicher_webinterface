// import { CompositeLayer, UpdateParameters, PickingInfo } from "@deck.gl/core";
// import { IconLayer, TextLayer } from "@deck.gl/layers";
// import Supercluster from "supercluster";
// import type { PointFeature, ClusterFeature, ClusterProperties } from "supercluster";
//
// // Types for our institution data
// export interface InstitutionData {
//   institution_id: string;
//   geolocation: number[] | null;
//   [key: string]: unknown;
// }
//
// type ClusterOrPoint = PointFeature<InstitutionData> | ClusterFeature<InstitutionData>;
//
// export interface InstitutionClusterLayerProps {
//   id: string;
//   data: InstitutionData[];
//   iconUrl: string;
//   iconSize?: number;
//   clusterRadius?: number;
//   pickable?: boolean;
//   onClick?: (info: PickingInfo) => void;
// }
//
// export default class InstitutionClusterLayer extends CompositeLayer<InstitutionClusterLayerProps> {
//   static layerName = "InstitutionClusterLayer";
//   static defaultProps = {
//     iconSize: 40,
//     clusterRadius: 50,
//     pickable: true,
//   };
//
//   state!: {
//     clusteredData: ClusterOrPoint[];
//     index: Supercluster<InstitutionData, InstitutionData>;
//     zoom: number;
//   };
//
//   shouldUpdateState({ changeFlags }: UpdateParameters<this>): boolean {
//     return changeFlags.somethingChanged;
//   }
//
//   updateState({ props, oldProps, changeFlags }: UpdateParameters<this>): void {
//     const rebuildIndex =
//       changeFlags.dataChanged || props.clusterRadius !== oldProps.clusterRadius;
//
//     if (rebuildIndex && props.data?.length) {
//       const index = new Supercluster<InstitutionData, InstitutionData>({
//         maxZoom: 16,
//         radius: props.clusterRadius,
//       });
//
//       // Filter out items with null geolocation
//       const validData = props.data.filter(
//         (d): d is InstitutionData & { geolocation: number[] } =>
//           d.geolocation !== null && d.geolocation.length >= 2
//       );
//
//       index.load(
//         validData.map((d) => ({
//           type: "Feature" as const,
//           geometry: {
//             type: "Point" as const,
//             coordinates: d.geolocation as [number, number],
//           },
//           properties: d,
//         }))
//       );
//
//       this.setState({ index });
//     }
//
//     const zoom = Math.floor(this.context.viewport.zoom);
//     if (rebuildIndex || zoom !== this.state.zoom) {
//       const clusteredData = this.state.index
//         ? this.state.index.getClusters([-180, -85, 180, 85], zoom)
//         : [];
//       this.setState({ clusteredData, zoom });
//     }
//   }
//
//   getPickingInfo({ info }: { info: PickingInfo<ClusterOrPoint> }): PickingInfo {
//     const pickedObject = info.object?.properties;
//     if (pickedObject) {
//       // If it's a cluster, add cluster info
//       if ("cluster" in pickedObject && pickedObject.cluster) {
//         return {
//           ...info,
//           object: {
//             ...pickedObject,
//             isCluster: true,
//             pointCount: pickedObject.point_count,
//           },
//         };
//       }
//       // Individual point - return the original data
//       return { ...info, object: pickedObject };
//     }
//     return { ...info, object: undefined };
//   }
//
//   renderLayers() {
//     const { clusteredData } = this.state;
//     const { iconUrl, iconSize, pickable, onClick } = this.props;
//
//     if (!clusteredData?.length) return [];
//
//     // Calculate icon size based on cluster size
//     const getIconSize = (d: ClusterOrPoint): number => {
//       if ("cluster" in d.properties && d.properties.cluster) {
//         // Scale up for clusters: log scale to prevent huge icons
//         const count = d.properties.point_count;
//         return iconSize! * (1 + Math.log10(count) * 0.4);
//       }
//       return iconSize!;
//     };
//
//     // Icon layer for all points (clusters and individuals)
//     const iconLayer = new IconLayer<ClusterOrPoint>({
//       id: `${this.props.id}-icons`,
//       data: clusteredData,
//       pickable,
//       getPosition: (d) => d.geometry.coordinates as [number, number],
//       getIcon: () => ({
//         url: iconUrl,
//         width: 64,
//         height: 64,
//         anchorY: 64,
//       }),
//       getSize: getIconSize,
//       sizeUnits: "meters",
//       sizeMinPixels: 16,
//       sizeMaxPixels: 60,
//       onClick,
//       updateTriggers: {
//         getPosition: clusteredData,
//         getSize: clusteredData,
//       },
//     });
//
//     // Text layer for cluster counts (only for clusters)
//     const clusterData = clusteredData.filter(
//       (d) => "cluster" in d.properties && d.properties.cluster
//     );
//
//     const textLayer = new TextLayer<ClusterOrPoint>({
//       id: `${this.props.id}-text`,
//       data: clusterData,
//       pickable: false,
//       getPosition: (d) => d.geometry.coordinates as [number, number],
//       getText: (d) => {
//         if ("cluster" in d.properties && d.properties.cluster) {
//           const count = d.properties.point_count;
//           if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
//           return String(count);
//         }
//         return "";
//       },
//       getSize: 14,
//       getColor: [0, 0, 0],
//       getTextAnchor: "middle",
//       getAlignmentBaseline: "center",
//       getPixelOffset: [0, -20], // Offset up to sit on top of icon
//       fontFamily: "Arial, sans-serif",
//       fontWeight: "bold",
//       outlineWidth: 2,
//       outlineColor: [255, 255, 255, 200],
//       updateTriggers: {
//         getPosition: clusterData,
//         getText: clusterData,
//       },
//     });
//
//     return [iconLayer, textLayer];
//   }
// }