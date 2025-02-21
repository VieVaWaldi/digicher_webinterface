"use client";

import React, { ReactNode, useState } from "react";

import { ScatterplotLayer } from "deck.gl";

import { baseLayerProps } from "deckgl/baseLayerProps";
import { DualRangeSlider } from "shadcn/dual-range-slider";
import useTopicFilter from "core/components/menus/filter/TopicFilter";
import ScenarioTemplate from "core/components/scenarios/ScenarioTemplate";
import { ProjectCoordinatorPoint } from "datamodel/scenario_points/types";
import useCountryFilter from "core/components/menus/filter/CountryFilter";
import ProjectInfoPanel from "core/components/infoPanels/ProjectInfoPanel";
import { useProjectById } from "core/hooks/queries/project/useProjectById";
import useTransformProjects from "core/hooks/transform/useTransformProjects";
import useFundingProgrammeFilter from "core/components/menus/filter/FundingProgrammeFilter";
import { useProjectsCoordinatorPoints } from "core/hooks/queries/scenario_points/useProjectsCoordinatorPoints";
import { H4 } from "shadcn/typography";

export default function ProjectScenario() {
  const id: string = "projects";

  /** Data */
  const {
    data: projectCoordinatorPoints,
    loading,
    error,
  } = useProjectsCoordinatorPoints();
  const { data: transformedPoints } = useTransformProjects(
    projectCoordinatorPoints,
  );
  const [selectedProject, setSelectedProject] =
    useState<ProjectCoordinatorPoint | null>(null);
  const { data: project } = useProjectById(selectedProject?.project_id ?? -1);

  /** Progressive Enhancement */
  const dataPoints = transformedPoints ?? projectCoordinatorPoints;

  /** Filter */
  const [years, setYears] = useState([1990, 2027]);
  const { CountryFilter, countryPredicate } = useCountryFilter();
  const { TopicFilter, topicPredicate } = useTopicFilter();
  const { FundingProgrammeFilter, fundingProgrammePredicate } =
    useFundingProgrammeFilter();

  const filterdDataPoints = dataPoints?.filter((point) => {
    const passesYearFilter =
      years[1] >= new Date(point.start_date).getFullYear() &&
      years[0] <= new Date(point.end_date).getFullYear();
    return (
      passesYearFilter &&
      countryPredicate(point) &&
      topicPredicate(point) &&
      fundingProgrammePredicate(point)
    );
  });

  // ToDo: Get min and max year from data in useMemo
  const filterMenus: ReactNode[] = [
    <div className="h-auto" key="dualyear-filter">
      <H4>Time Range</H4>
      <DualRangeSlider
        className="pt-10 md:pt-8"
        label={(value) => value}
        value={years}
        onValueChange={setYears}
        min={1990}
        max={2027}
        step={1}
      />
    </div>,
    <CountryFilter key="country-filter" />,
    <FundingProgrammeFilter key="funding-filter" />,
    <TopicFilter key="topic-filter" />,
  ];

  /** Layer */
  const layer = new ScatterplotLayer({
    ...baseLayerProps,
    id: `scatter-${id}`,
    data: filterdDataPoints,
    filled: true,
    stroked: false,

    radiusScale: 6,
    radiusMinPixels: 3,
    radiusMaxPixels: 100,
    lineWidthMinPixels: 1,
    getRadius: 100,

    getFillColor: [255, 140, 0],
    getPosition: (d) => [d.geolocation[1], d.geolocation[0]],
    onClick: (info) => {
      if (info.object) {
        setSelectedProject(info.object as ProjectCoordinatorPoint);
      }
    },
  });

  return (
    <ScenarioTemplate
      id={id}
      title="Project Map"
      isLoading={loading}
      error={error}
      statsCard={
        <span>
          Displaying {filterdDataPoints?.length.toLocaleString() || 0} Projects
        </span>
      }
      filterMenus={filterMenus}
      layers={[layer]}
      infoPanel={project && <ProjectInfoPanel project={project} />}
    />
  );
}

// const layer = new ScatterplotLayer({
//   ...baseLayerProps,
//   id: `scatter-${id}`,
//   data: filterdDataPoints,
//   filled: true,
//   stroked: true,

//   radiusScale: 12,
//   radiusMinPixels: 12,
//   radiusMaxPixels: 1000,
//   lineWidthMinPixels: 1,
//   opacity: 0.7,

//   getFillColor: [255, 140, 0],
//   getPosition: (d: ProjectCoordinatorPoint) => [
//     d.geolocation[1],
//     d.geolocation[0],
//   ],
//   onClick: (info) => {
//     if (info.object) {
//       setSelectedProject(info.object as ProjectCoordinatorPoint);
//     }
//   },
// });

// function calculatePointDensity(
//   coordinate: number[],
//   allPoints: BasePoint[],
//   radiusThreshold: number = 0.01,
// ): number {
//   return allPoints.filter((p) => {
//     const distance = Math.sqrt(
//       Math.pow(coordinate[1] - p.geolocation[1], 2) +
//         Math.pow(coordinate[0] - p.geolocation[0], 2),
//     );
//     return distance < radiusThreshold;
//   }).length;
// }

// // Helper function to get color based on density
// function getColorByDensity(density: number): [number, number, number] {
//   const baseColor = [255, 140, 0]; // Your original orange color
//   const intensity = Math.min(density / 5, 1); // Adjust divisor based on your data
//   return [
//     baseColor[0],
//     Math.floor(baseColor[1] * (1 - intensity * 0.5)),
//     baseColor[2],
//   ];
// }
