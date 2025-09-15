// import { ColumnLayer, ScatterplotLayer } from "@deck.gl/layers";
// import { useSettings } from "context/SettingsContext";
// import { HeatmapLayer, HexagonLayer, Layer } from "deck.gl";
// import { baseLayerProps } from "deckgl/baseLayerProps";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import { useMemo, useState } from "react";
// import { Button } from "shadcn/button";

// interface LayerSwitcherProps {
//   data: any[];
//   maxTotalCost: number;
//   onMapClick: (info: any) => void;
//   onHover: (info: any) => void;
// }

// interface LayerConfig {
//   id: string;
//   name: string;
//   description: string;
//   createLayer: (props: LayerSwitcherProps & { isGlobe: boolean }) => Layer;
// }

// const CSS_BUTTON = "h-10 w-10 rounded-xl bg-white text-orange-500";
// const STRK_WDTH = 2.2;
// const BTN_SCALE = 1.5;

// const MAX_HEIGHT = 1_000_000;
// const BAR_RADIUS = 2_200;
// const COLOR_GAMMA = 0.5;

// export function LayerSwitcher({
//   data,
//   maxTotalCost,
//   onMapClick,
//   onHover,
// }: LayerSwitcherProps) {
//   const { isGlobe } = useSettings();
//   const [currentLayerIndex, setCurrentLayerIndex] = useState(0);

//   const layerConfigs: LayerConfig[] = useMemo(
//     () => [
//       {
//         id: "column",
//         name: "Column View",
//         description: "3D columns showing funding amounts as height",
//         createLayer: ({ data, maxTotalCost, onMapClick, onHover, isGlobe }) =>
//           new ColumnLayer({
//             ...baseLayerProps,
//             id: "column-projects",
//             data,
//             getElevation: (d: any) => {
//               const funding = d.total_cost || 0;
//               const ratio = maxTotalCost > 0 ? funding / maxTotalCost : 0;
//               return isGlobe ? ratio * MAX_HEIGHT * 3.5 : ratio * MAX_HEIGHT;
//             },
//             getFillColor: (d: any) => {
//               const funding = d.total_cost || 0;
//               const normalizedFunding =
//                 maxTotalCost > 0 ? funding / maxTotalCost : 0;
//               const adjustedValue = Math.pow(normalizedFunding, COLOR_GAMMA);
//               return [
//                 50 + (255 - 50) * adjustedValue,
//                 50 - 50 * adjustedValue,
//                 50 - 50 * adjustedValue,
//                 200,
//               ];
//             },
//             getPosition: (d: any) => d.geolocation || [0, 0],
//             onClick: onMapClick,
//             onHover,
//             radius: isGlobe ? BAR_RADIUS * 2.5 : BAR_RADIUS,
//             diskResolution: 32,
//             extruded: true,
//             material: {
//               ambient: 0.64,
//               diffuse: 0.6,
//               shininess: 32,
//               specularColor: [51, 51, 51],
//             },
//           }),
//       },
//       {
//         id: "scatterplot",
//         name: "Scatter View",
//         description: "2D circles with size representing funding amounts",
//         createLayer: ({ data, maxTotalCost, onMapClick, onHover }) =>
//           new ScatterplotLayer({
//             ...baseLayerProps,
//             id: "scatterplot-projects",
//             data,
//             getPosition: (d: any) => d.geolocation || [0, 0],
//             getRadius: (d: any) => {
//               const funding = d.total_cost || 0;
//               const ratio = maxTotalCost > 0 ? funding / maxTotalCost : 0;
//               return Math.max(500, ratio * 50000); // Min 500m, max ~50km
//             },
//             getFillColor: (d: any) => {
//               const funding = d.total_cost || 0;
//               const normalizedFunding =
//                 maxTotalCost > 0 ? funding / maxTotalCost : 0;
//               const adjustedValue = Math.pow(normalizedFunding, COLOR_GAMMA);
//               return [
//                 50 + (255 - 50) * adjustedValue,
//                 50 - 50 * adjustedValue,
//                 50 - 50 * adjustedValue,
//                 200,
//               ];
//             },
//             onClick: onMapClick,
//             onHover,
//             radiusUnits: "meters",
//             radiusScale: 1,
//             stroked: true,
//             filled: true,
//             getLineColor: [255, 255, 255],
//             getLineWidth: 2,
//             lineWidthUnits: "pixels",
//           }),
//       },
//       {
//         id: "hexagon",
//         name: "Hexagon View",
//         description: "Aggregated hexagonal bins showing funding density",
//         createLayer: ({ data, onMapClick, onHover, isGlobe }) =>
//           new HexagonLayer({
//             ...baseLayerProps,
//             id: "hexagon-projects",
//             data,
//             getPosition: (d: any) => d.geolocation || [0, 0],
//             getColorWeight: (d: any) => d.total_cost || 0,
//             getElevationWeight: (d: any) => d.total_cost || 500,
//             elevationScale: isGlobe ? 800 : 400,
//             extruded: true,
//             radius: 50000, // 10km radius
//             onClick: onMapClick,
//             onHover,
//             colorRange: [
//               [255, 255, 178],
//               [254, 204, 92],
//               [253, 141, 60],
//               [240, 59, 32],
//               [189, 0, 38],
//               [128, 0, 38],
//             ],
//             elevationRange: [0, 3000],
//             coverage: 0.8,
//           }),
//       },
//       {
//         id: "heatmap",
//         name: "Heatmap View",
//         description: "Smooth heatmap showing funding concentration",
//         createLayer: ({ data, onHover }) =>
//           new HeatmapLayer({
//             ...baseLayerProps,
//             id: "heatmap-projects",
//             data,
//             getPosition: (d: any) => d.geolocation || [0, 0],
//             getWeight: (d: any) => Math.log(d.total_cost) || 0,
//             radiusPixels: 220,
//             onHover,
//             colorRange: [
//               [255, 255, 178, 0],
//               [254, 204, 92, 100],
//               [253, 141, 60, 150],
//               [240, 59, 32, 200],
//               [189, 0, 38, 255],
//             ],
//             threshold: 0.03,
//           }),
//       },
//     ],
//     [],
//   );

//   const currentLayer = useMemo(() => {
//     const config = layerConfigs[currentLayerIndex];
//     return config.createLayer({
//       data,
//       maxTotalCost,
//       onMapClick,
//       onHover,
//       isGlobe,
//     });
//   }, [
//     currentLayerIndex,
//     data,
//     maxTotalCost,
//     onMapClick,
//     onHover,
//     isGlobe,
//     layerConfigs,
//   ]);

//   const goToPrevious = () => {
//     setCurrentLayerIndex((prev) =>
//       prev === 0 ? layerConfigs.length - 1 : prev - 1,
//     );
//   };

//   const goToNext = () => {
//     setCurrentLayerIndex((prev) =>
//       prev === layerConfigs.length - 1 ? 0 : prev + 1,
//     );
//   };

//   const currentConfig = layerConfigs[currentLayerIndex];

//   return {
//     layer: currentLayer,
//     layerSwitcherUI: (
//       <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 transform items-center space-x-4">
//         <Button
//           variant="secondary"
//           className={CSS_BUTTON}
//           onClick={goToPrevious}
//         >
//           <ChevronLeft
//             strokeWidth={STRK_WDTH}
//             style={{ transform: `scale(${BTN_SCALE})` }}
//           />
//         </Button>

//         <div className="rounded-xl bg-white/90 px-4 py-2 text-center backdrop-blur-sm">
//           <div className="font-semibold text-orange-600">
//             {currentConfig.name}
//           </div>
//           <div className="text-xs text-gray-600">
//             {currentConfig.description}
//           </div>
//         </div>

//         <Button variant="secondary" className={CSS_BUTTON} onClick={goToNext}>
//           <ChevronRight
//             strokeWidth={STRK_WDTH}
//             style={{ transform: `scale(${BTN_SCALE})` }}
//           />
//         </Button>
//       </div>
//     ),
//   };
// }
