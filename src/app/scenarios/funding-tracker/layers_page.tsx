// "use client";

// import BaseUI from "components/baseui/BaseUI";
// import { LayerSwitcher } from "components/baseui/LayerSwitcher";
// import RightSideMenu from "components/baseui/RightSideMenu";
// import { ScopeToggle } from "components/buttons/toggle";
// import ProjectViewInfoPanel from "components/infoPanels/ProjectViewInfoPanel";
// import { PickingInfo } from "deck.gl";
// import { INITIAL_VIEW_STATE_TILTED_EU } from "deckgl/viewports";
// import { useInstitutionById } from "hooks/queries/institution/useInstitutionById";
// import { useProjectbyId } from "hooks/queries/project/useProjectById";
// import { useProjectYearRange } from "hooks/queries/project/useProjectYearRange";
// import { useInstitutionView } from "hooks/queries/views/project/useInstitutionView";
// import { useProjectView } from "hooks/queries/views/project/useProjectView";
// import { ReactNode, useCallback, useMemo, useState } from "react";
// import { FundingInfoBox, FundingTitle } from "./content";

// export default function FundingScenario() {
//   /** Main Data */
//   const { data: projectView, isPending, error } = useProjectView();
//   const {
//     data: institutionView,
//     isPending: isPendingInstitutionView,
//     error: errorInstitutionView,
//   } = useInstitutionView();

//   /** View Toggle */
//   const [showInstitutions, setShowInstitutions] = useState<boolean>(false);

//   const dataView = showInstitutions ? institutionView : projectView;

//   /** Selected Project */
//   const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
//     null,
//   );
//   const { data: project, isPending: isPendingProject } = useProjectbyId(
//     selectedProjectId || "",
//     {
//       enabled: !!selectedProjectId,
//     },
//   );

//   /** Selected Institution */
//   const [selectedInstitutionId, setSelectedInstitutionId] = useState<
//     string | null
//   >(null);
//   const { data: institution, isPending: isPendingInstitution } =
//     useInstitutionById(selectedInstitutionId || "", {
//       enabled: !!selectedInstitutionId,
//     });

//   /** Year Range */
//   const { data: { minStartDate = 1985, maxEndDate = 2035 } = {} } =
//     useProjectYearRange();
//   const [years, setYears] = useState<number[]>(() => [
//     minStartDate,
//     maxEndDate,
//   ]);

//   /** Hover State */
//   const [hoverInfo, setHoverInfo] = useState<{
//     x: number;
//     y: number;
//     funding: number;
//     object: any;
//   } | null>(null);

//   /** Filters - Commented out as requested */
//   // const { YearRangeFilter, yearRangePredicate } = useYearRangeFilter({
//   //   years: years,
//   //   handleYearsChange: setYears,
//   //   minStartDate: minStartDate,
//   //   maxEndDate: maxEndDate,
//   // });
//   // const { CountryFilter, countryPredicate } = useCountryFilter();
//   // const { TypeAndSmeFilter, typeAndSmePredicate } = useTypeAndSmeFilter();
//   // const { NutsFilter, nutsPredicate } = useNutsFilter(dataView);
//   // const { InstitutionSearchFilter, institutionSearchPredicate } =
//   //   useInstitutionSearchFilter();
//   // const { ProjectSearchFilter, projectSearchPredicate } =
//   //   useProjectSearchFilter();
//   // const { FrameworkProgrammeFilter, frameworkProgrammePredicate } =
//   //   useFrameworkProgrammeFilter();
//   // const { TopicFilter, topicPredicate } = useTopicFilter();

//   /** Apply Filters - Using unfiltered data for now */
//   const filteredDataView = useMemo(() => {
//     if (!dataView?.length) return [];

//     // For demonstration, return raw data without filters
//     // You can uncomment the filter logic above when needed
//     if (showInstitutions) {
//       const institutionMap = new Map();

//       dataView.forEach((row) => {
//         const existing = institutionMap.get(row.institution_id);
//         if (existing) {
//           existing.total_cost += row.total_cost || 0;
//           existing.project_count += 1;
//           existing.project_ids.push(row.project_id);
//         } else {
//           institutionMap.set(row.institution_id, {
//             ...row,
//             total_cost: row.total_cost || 0,
//             project_count: 1,
//             project_ids: [row.project_id],
//           });
//         }
//       });

//       return Array.from(institutionMap.values());
//     }

//     return dataView;
//   }, [dataView, showInstitutions]);

//   /** Calculations */
//   const maxTotalCost = useMemo(() => {
//     return filteredDataView.reduce((max, p) => {
//       const cost = p.total_cost || 0;
//       return Math.max(max, cost);
//     }, 0);
//   }, [filteredDataView]);

//   const totalFunding = useMemo(() => {
//     return filteredDataView.reduce((sum, p) => sum + (p.total_cost || 0), 0);
//   }, [filteredDataView]);

//   /** Event Handlers */
//   const handleMapOnClick = useCallback(
//     (info: PickingInfo) => {
//       if (showInstitutions && info.object?.institution_id) {
//         setSelectedInstitutionId(info.object.institution_id);
//         console.log(info.object);
//         togglePanel("institution-view");
//       } else if (!showInstitutions && info.object?.project_id) {
//         setSelectedProjectId(info.object.project_id);
//         setSelectedInstitutionId(info.object.institution_id);
//         togglePanel("project-view");
//       }
//     },
//     [showInstitutions],
//   );

//   const handleHover = useCallback((info: PickingInfo) => {
//     if (info.object) {
//       setHoverInfo({
//         x: info.x,
//         y: info.y,
//         funding: info.object.total_cost || 0,
//         object: info.object,
//       });
//     } else {
//       setHoverInfo(null);
//     }
//   }, []);

//   /** Layer Switcher */
//   const { layer, layerSwitcherUI } = LayerSwitcher({
//     data: filteredDataView,
//     maxTotalCost,
//     onMapClick: handleMapOnClick,
//     onHover: handleHover,
//   });

//   /** UI Components - Filters commented out */
//   const filters: ReactNode = (
//     <div className="space-y-6">
//       <div className="flex justify-center">
//         <ScopeToggle
//           isInstitution={showInstitutions}
//           onChange={setShowInstitutions}
//         />
//       </div>
//       {/*
//       {YearRangeFilter}
//       {TypeAndSmeFilter}
//       {InstitutionSearchFilter}
//       {ProjectSearchFilter}
//       {CountryFilter}
//       {FrameworkProgrammeFilter}
//       {TopicFilter}
//       {NutsFilter}
//       */}
//       <div className="p-4 text-center text-gray-500">
//         <p>Filters temporarily disabled</p>
//         <p>Enable layer switching functionality first</p>
//       </div>
//     </div>
//   );

//   const rightPanelTabs = [
//     {
//       id: "filters",
//       label: "Filters",
//       content: filters,
//     },
//   ];

//   if (project && !showInstitutions) {
//     rightPanelTabs.push({
//       id: "project-view",
//       label: "Details",
//       content: (
//         <ProjectViewInfoPanel
//           institution={institution}
//           project={project}
//           isPendingInstitution={isPendingInstitution}
//           isPendingProject={isPendingProject}
//         />
//       ),
//     });
//   }

//   if (showInstitutions) {
//     rightPanelTabs.push({
//       id: "institution-placeholder",
//       label: "Institutions",
//       content: (
//         <div className="p-4 text-center text-gray-500">
//           <p>Institution View</p>
//           <p>Institution functionality not yet implemented.</p>
//           <p>Switch to Projects view to explore project funding data.</p>
//         </div>
//       ),
//     });
//   }

//   const { panel, togglePanel } = RightSideMenu({ rightPanelTabs });

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
//       <div>
//         Total Cost:{" "}
//         {new Intl.NumberFormat("de-DE", {
//           style: "currency",
//           currency: "EUR",
//         }).format(hoverInfo.funding)}
//       </div>
//     </div>
//   );

//   return (
//     <>
//       <BaseUI
//         layers={[layer]}
//         viewState={INITIAL_VIEW_STATE_TILTED_EU}
//         titleContent={
//           <FundingTitle
//             count={filteredDataView?.length || 0}
//             totalFunding={totalFunding}
//             showInstitutions={showInstitutions}
//           />
//         }
//         infoBoxContent={
//           <FundingInfoBox
//             count={filteredDataView?.length || 0}
//             totalFunding={totalFunding}
//             showInstitutions={showInstitutions}
//           />
//         }
//         rightSideMenu={panel}
//         toggleRightSideMenu={togglePanel}
//         loading={showInstitutions ? isPendingInstitutionView : isPending}
//         error={showInstitutions ? errorInstitutionView : error}
//       />
//       {hoverTooltip}
//       {layerSwitcherUI}
//     </>
//   );
// }
