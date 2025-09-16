// "use client";

// import { ArcLayer, ColumnLayer } from "@deck.gl/layers";
// import BaseUI from "components/baseui/BaseUI";
// import RightSideMenu from "components/baseui/RightSideMenu";
// import { useSettings } from "context/SettingsContext";
// import { PickingInfo } from "deck.gl";
// import { baseLayerProps } from "deckgl/baseLayerProps";
// import { INITIAL_VIEW_STATE_TILTED_EU } from "deckgl/viewports";
// import { useAllCollaborationArcs } from "hooks/queries/collaboration/useAllCollaborationArcs";
// import { useCollaborationView } from "hooks/queries/collaboration/useCollaborationView";
// import { useInstitutionById } from "hooks/queries/institution/useInstitutionById";
// import { ReactNode, useCallback, useMemo, useState } from "react";

// export default function CollaborationScenario() {
//   const { isGlobe } = useSettings();
//   const COLOR_GAMMA = 0.7;
//   const MAX_HEIGHT = isGlobe ? 4_000_000 : 1_000_000;
//   const BAR_RADIUS = isGlobe ? 3_000 : 2_200;

//   /** Selected Institution */
//   const [selectedInstitutionId, setSelectedInstitutionId] = useState<
//     string | null
//   >(null);

//   /** Main Data */
//   const { data: collaborationView, isPending, error } = useCollaborationView();
//   const { data: allCollaborationArcs, isPending: isPendingArcs } =
//     useAllCollaborationArcs();

//   /** Selected Institution Details */
//   const { data: selectedInstitution, isPending: isPendingInstitution } =
//     useInstitutionById(selectedInstitutionId || "", {
//       enabled: !!selectedInstitutionId,
//     });

//   /** Hover State */
//   const [hoverInfo, setHoverInfo] = useState<{
//     x: number;
//     y: number;
//     weight: number;
//     object: any;
//   } | null>(null);

//   /** Calculations */
//   const MAX_COLLAB_WEIGHT = useMemo(() => {
//     if (!collaborationView) return 0;
//     return Math.max(...collaborationView.map((d) => d.collaboration_weight));
//   }, [collaborationView]);

//   /** Create institution location map for quick lookup */
//   const institutionLocationMap = useMemo(() => {
//     if (!collaborationView) return new Map();

//     const map = new Map();
//     collaborationView.forEach((institution) => {
//       map.set(institution.institution_id, institution.geolocation);
//     });
//     return map;
//   }, [collaborationView]);

//   /** Arc Data for ALL Collaborations */
//   const allArcsData = useMemo(() => {
//     if (!allCollaborationArcs || !institutionLocationMap.size) {
//       return [];
//     }

//     // Remove duplicates by creating a set of unique connections
//     // Sort institution IDs to avoid A->B and B->A duplicates
//     const uniqueConnections = new Set();
//     const arcs = [];

//     allCollaborationArcs.forEach((arc) => {
//       const sourcePos = institutionLocationMap.get(arc.source_institution_id);
//       const targetPos = arc.geolocation;

//       if (sourcePos && targetPos) {
//         // Create a unique key by sorting the institution IDs
//         const connectionKey = [arc.source_institution_id, arc.institution_id]
//           .sort()
//           .join("-");

//         if (!uniqueConnections.has(connectionKey)) {
//           uniqueConnections.add(connectionKey);
//           arcs.push({
//             sourcePosition: sourcePos,
//             targetPosition: targetPos,
//             sourceId: arc.source_institution_id,
//             targetId: arc.institution_id,
//           });
//         }
//       }
//     });

//     return arcs;
//   }, [allCollaborationArcs, institutionLocationMap]);

//   /** Event Handlers */
//   const handleMapOnClick = useCallback((info: any) => {
//     const { object } = info;
//     if (object && object.institution_id) {
//       setSelectedInstitutionId(object.institution_id);
//     }
//   }, []);

//   const handleEmptyMapClick = useCallback(() => {
//     setSelectedInstitutionId(null);
//   }, []);

//   const handleHover = useCallback((info: PickingInfo) => {
//     if (info.object) {
//       setHoverInfo({
//         x: info.x,
//         y: info.y,
//         weight: info.object.collaboration_weight,
//         object: info.object,
//       });
//     } else {
//       setHoverInfo(null);
//     }
//   }, []);

//   /** Layers */
//   //   const columnLayer = useMemo(() => {
//   //     return new ColumnLayer({
//   //       ...baseLayerProps,
//   //       id: "collaboration-columns",
//   //       data: collaborationView || [],
//   //       diskResolution: 32,
//   //       radius: BAR_RADIUS,
//   //       getPosition: (d) => [d.geolocation[0], d.geolocation[1]],
//   //       getElevation: (d) => {
//   //         return (d.collaboration_weight / MAX_COLLAB_WEIGHT) * MAX_HEIGHT;
//   //       },
//   //       getFillColor: (d) => {
//   //         const normalizedFunding = d.collaboration_weight / MAX_COLLAB_WEIGHT;
//   //         const adjustedValue = Math.pow(normalizedFunding, COLOR_GAMMA);
//   //         return [
//   //           50 + (255 - 50) * adjustedValue,
//   //           50 - 50 * adjustedValue,
//   //           50 - 50 * adjustedValue,
//   //           200,
//   //         ];
//   //       },
//   //       pickable: true,
//   //       autoHighlight: true,
//   //       extruded: true,
//   //       material: {
//   //         ambient: 0.64,
//   //         diffuse: 0.6,
//   //         shininess: 32,
//   //         specularColor: [51, 51, 51],
//   //       },
//   //       onClick: handleMapOnClick,
//   //       onHover: handleHover,
//   //       updateTriggers: {
//   //         getPosition: collaborationView,
//   //         getElevation: [collaborationView, MAX_COLLAB_WEIGHT],
//   //         getFillColor: [collaborationView, MAX_COLLAB_WEIGHT],
//   //       },
//   //     });
//   //   }, [
//   //     collaborationView,
//   //     MAX_COLLAB_WEIGHT,
//   //     BAR_RADIUS,
//   //     MAX_HEIGHT,
//   //     handleMapOnClick,
//   //     handleHover,
//   //   ]);

//   const arcLayer = useMemo(() => {
//     return new ArcLayer({
//       id: "collaboration-arcs-all",
//       data: allArcsData,
//       pickable: true,
//       getSourcePosition: (d) => d.sourcePosition,
//       getTargetPosition: (d) => d.targetPosition,
//       getSourceColor: [255, 165, 0, 120], // Made more transparent
//       getTargetColor: [0, 255, 255, 120], // Made more transparent
//       getWidth: 1,
//       widthScale: 1,
//       widthMinPixels: 1,
//       updateTriggers: {
//         getSourcePosition: allArcsData,
//         getTargetPosition: allArcsData,
//       },
//     });
//   }, [allArcsData]);

//   /** Right Side Menu */
//   const rightPanelTabs: { id: string; label: string; content: ReactNode }[] =
//     [];

//   const { panel, togglePanel, isOpen, activeTabId } = RightSideMenu({
//     rightPanelTabs,
//   });

//   /** Title Content */
//   const titleContent = (
//     <div className="space-y-2">
//       <p>
//         Displaying{" "}
//         <span className="font-semibold text-orange-400">
//           {collaborationView?.length.toLocaleString() || 0}
//         </span>{" "}
//         Institutions
//         {allArcsData.length > 0 && (
//           <>
//             {" "}
//             with{" "}
//             <span className="font-semibold text-orange-400">
//               {allArcsData.length.toLocaleString()}
//             </span>{" "}
//             collaboration connections
//           </>
//         )}
//       </p>
//     </div>
//   );

//   /** Info Box Content */
//   const infoBoxContent = (
//     <div className="space-y-2">
//       <p className="text-sm">
//         This scenario shows all collaboration networks at once. Institution bars
//         indicate the total number of unique project partners, with arcs showing
//         all collaborations.
//       </p>
//       <p className="text-sm">
//         Click on an institution to select it (future functionality).
//       </p>
//     </div>
//   );

//   /** Hover Tooltip */
//   const hoverTooltip = hoverInfo && (
//     <div
//       style={{
//         position: "absolute",
//         pointerEvents: "none",
//         left: hoverInfo.x,
//         top: hoverInfo.y,
//         backgroundColor: "rgba(0, 0, 0, 0.8)",
//         color: "#fff",
//         padding: "8px",
//         borderRadius: "4px",
//         transform: "translate(-50%, -100%)",
//         marginTop: "-15px",
//         zIndex: 1000,
//       }}
//     >
//       <div>Total Collaborators: {hoverInfo.weight}</div>
//     </div>
//   );

//   const isLoading = isPending || isPendingArcs;

//   return (
//     <>
//       <BaseUI
//         layers={[arcLayer]} // columnLayer
//         viewState={INITIAL_VIEW_STATE_TILTED_EU}
//         titleContent={titleContent}
//         infoBoxContent={infoBoxContent}
//         rightSideMenu={panel}
//         toggleRightSideMenu={() => togglePanel("institution-details")}
//         isRightMenuOpen={isOpen}
//         activeRightMenuTab={activeTabId}
//         onEmptyMapClick={handleEmptyMapClick}
//         loading={isLoading}
//         error={error}
//         scenarioName="collaboration"
//         scenarioTitle="Collaboration"
//       />
//       {hoverTooltip}
//     </>
//   );
// }
