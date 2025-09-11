// "use client";

// import BaseUI from "components/baseui/BaseUI";
// import InstitutionInfoPanel from "components/infoPanels/InstitutionInfoPanel";
// import ProjectInfoPanel from "components/infoPanels/ProjectInfoPanel";
// import useCountryFilter from "components/filter/useCountryFilter";
// import useFundingProgrammeFilter from "components/menus/filter/FundingProgrammeFilter";
// import useSimpleSearch from "components/menus/filter/SearchFilter";
// import useTopicFilter from "components/menus/filter/TopicFilter";
// import { useInstitutionById } from "core/hooks/queries/institution/useInstitutionById";
// import { useProjectById } from "core/hooks/queries/project/useProjectById";
// import { useProjectsByKeywords } from "core/hooks/queries/project/useProjectsByKeywords";
// import { useProjectsCoordinatorPoints } from "core/hooks/queries/scenario_points/useProjectsCoordinatorPoints";
// import useTransformProjects from "core/hooks/transform/useTransformProjects";
// import { ProjectCoordinatorPoint } from "datamodel/scenario_points/types";
// import { ProjectViewType } from "db/schemas/core-mats";
// import { ScatterplotLayer } from "deck.gl";
// import { baseLayerProps } from "deckgl/baseLayerProps";
// import { INITIAL_VIEW_STATE_EU } from "deckgl/viewports";
// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import { DualRangeSlider } from "shadcn/dual-range-slider";
// import { Input } from "shadcn/input";
// import { H4 } from "shadcn/typography";

// export default function CHProjectScenario() {
//   /** Data */
//   // const { data: projectView, loading, error } = useProjectsCoordinatorPoints();
//   const [projectView, setProjectView] = useState<ProjectViewType[]>([]);
//   const loading = false;
//   const error = false;

//   useEffect(() => {
//     fetch("/api/views/project")
//       .then((res) => res.json())
//       .then(setProjectView);
//   }, []);

//   const { data: transformedPoints } = useTransformProjects(projectView);

//   const [selectedProject, setSelectedProject] =
//     useState<ProjectCoordinatorPoint | null>(null);

//   const { data: project } = useProjectById(
//     selectedProject?.project_id ? selectedProject.project_id : "",
//   );
//   const { data: coordinator } = useInstitutionById(
//     selectedProject?.institution_id ?? "",
//   );

//   /** Progressive Enhancement */
//   const dataPoints = transformedPoints ?? projectView;

//   /** Calculations */
//   const { MIN_YEAR, MAX_YEAR } = useMemo(() => {
//     if (!dataPoints?.length) return { MIN_YEAR: 1957, MAX_YEAR: 2030 };

//     const validPoints = dataPoints.filter(
//       (point) =>
//         point.start_date &&
//         point.end_date &&
//         new Date(point.end_date).getFullYear() < 2100 &&
//         new Date(point.start_date).getFullYear() < 2100,
//     );

//     if (validPoints.length === 0) return { MIN_YEAR: 1957, MAX_YEAR: 2030 };

//     // ToDo: Could be a simpe sql query instead
//     const minYear = validPoints.reduce((acc, point) => {
//       return Math.min(acc, new Date(point.start_date).getFullYear());
//     }, 10000);

//     const maxYear = validPoints.reduce((acc, point) => {
//       return Math.max(acc, new Date(point.end_date).getFullYear());
//     }, 0);

//     return { MIN_YEAR: minYear, MAX_YEAR: maxYear };
//   }, [dataPoints]);

//   const [years, setYears] = useState<number[]>(() => [MIN_YEAR, MAX_YEAR]);

//   const prevMinMax = useRef({ MIN_YEAR, MAX_YEAR });
//   useEffect(() => {
//     if (
//       prevMinMax.current.MIN_YEAR !== MIN_YEAR ||
//       prevMinMax.current.MAX_YEAR !== MAX_YEAR
//     ) {
//       setYears([MIN_YEAR, MAX_YEAR]);
//       prevMinMax.current = { MIN_YEAR, MAX_YEAR };
//     }
//   }, [MIN_YEAR, MAX_YEAR]);

//   /** Filters */

//   const { CountryFilter, countryPredicate } = useCountryFilter();
//   const { TopicFilter, topicPredicate } = useTopicFilter();
//   const { FundingProgrammeFilter, fundingProgrammePredicate } =
//     useFundingProgrammeFilter();
//   const {
//     searchPredicate,
//     searchQuery,
//     setSearchQuery,
//     searchLabel,
//     placeholderText,
//   } = useSimpleSearch({
//     useSearchHook: useProjectsByKeywords,
//     idField: "project_id",
//     searchLabel: "Project Search",
//     placeholderText: "Search projects for title, acronym and objective ...",
//     idPredicate: "project_id",
//   });

//   /** Apply Filters */

//   const filteredDataPoints = useMemo(() => {
//     if (!dataPoints?.length) return [];

//     return dataPoints.filter((point) => {
//       const passesYearFilter =
//         point.start_date &&
//         point.end_date &&
//         years[1] >= new Date(point.start_date).getFullYear() &&
//         years[0] <= new Date(point.end_date).getFullYear();
//       return (
//         passesYearFilter &&
//         countryPredicate(point) &&
//         topicPredicate(point) &&
//         fundingProgrammePredicate(point) &&
//         searchPredicate(point)
//       );
//     });
//   }, [
//     dataPoints,
//     years,
//     countryPredicate,
//     topicPredicate,
//     fundingProgrammePredicate,
//     searchPredicate,
//   ]);

//   /** Event Handlers */
//   const handleLayerClick = useCallback((info: any) => {
//     if (info.object) {
//       setSelectedProject(info.object as ProjectCoordinatorPoint);
//     }
//   }, []);

//   const handleYearsChange = useCallback((newYears: number[]) => {
//     setYears(newYears);
//   }, []);

//   const handleSearchChange = useCallback(
//     (e: React.ChangeEvent<HTMLInputElement>) => {
//       setSearchQuery(e.target.value);
//     },
//     [setSearchQuery],
//   );

//   const handleDownload = useCallback(() => {
//     const jsonStr = JSON.stringify(filteredDataPoints, null, 2);
//     const blob = new Blob([jsonStr], { type: "application/json" });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = `filtered-projects-${new Date().toISOString().split("T")[0]}.json`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//   }, [filteredDataPoints]);

//   /** Content */
//   const titleContent = useMemo(
//     () => (
//       <>
//         <span className="text-gray-700">Displaying</span>{" "}
//         <span className="font-semibold text-orange-400">
//           {filteredDataPoints?.length.toLocaleString() || 0}
//         </span>{" "}
//         <span className="text-gray-700">Projects</span>
//       </>
//     ),
//     [filteredDataPoints?.length],
//   );

//   const infoBoxContent = useMemo(
//     () => (
//       <div className="space-y-4 text-gray-700">
//         <section>
//           <h3 className="font-semibold text-gray-800">Project Map</h3>
//           <p>
//             Each dot represents a project with its coordinating institution from
//             the aggregated dataset. Click on any project to view detailed
//             information including title, objective, funding amount and call
//             information. Use the search box to filter projects by keyword.
//           </p>
//         </section>
//       </div>
//     ),
//     [],
//   );

//   const rightPanelTabs = [
//     {
//       id: "filters",
//       label: "Filters",
//       content: (
//         <div className="space-y-6">
//           <div>
//             <H4>Time Range</H4>
//             <DualRangeSlider
//               key={`slider-${MIN_YEAR}-${MAX_YEAR}`}
//               className="pt-10 md:pt-8"
//               label={(value: number | undefined) => value}
//               value={years}
//               onValueChange={handleYearsChange}
//               min={MIN_YEAR}
//               max={MAX_YEAR}
//               step={1}
//             />
//           </div>
//           <div>
//             <CountryFilter />
//           </div>
//           <div>
//             <FundingProgrammeFilter />
//           </div>
//           <div>
//             <TopicFilter />
//           </div>
//           <div>
//             <H4>{searchLabel}</H4>
//             <Input
//               type="text"
//               placeholder={placeholderText}
//               value={searchQuery}
//               onChange={handleSearchChange}
//               className="mt-2"
//             />
//           </div>
//         </div>
//       ),
//     },
//   ];

//   // Only add data tab if there's selected data
//   if (selectedProject && (coordinator || project)) {
//     rightPanelTabs.push({
//       id: "data",
//       label: "Details",
//       content: (
//         <div className="space-y-4">
//           {coordinator && <InstitutionInfoPanel institution={coordinator} />}
//           {project && <ProjectInfoPanel project={project} />}
//         </div>
//       ),
//     });
//   }

//   /** Layer */
//   const layer = useMemo(() => {
//     return new ScatterplotLayer({
//       ...baseLayerProps,
//       id: "scatter-projects",
//       data: filteredDataPoints,
//       getFillColor: [255, 140, 0],
//       getPosition: (d) => [d.geolocation[0], d.geolocation[1]],
//       onClick: handleLayerClick,
//     });
//   }, [filteredDataPoints, handleLayerClick]);

//   return (
//     <BaseUI
//       layers={[layer]}
//       viewState={INITIAL_VIEW_STATE_EU}
//       titleContent={titleContent}
//       infoBoxContent={infoBoxContent}
//       rightPanelTabs={rightPanelTabs}
//       onDownloadAction={handleDownload}
//       loading={loading}
//       error={error}
//     />
//   );
// }
