"use client";

import React, { ReactNode, useState } from "react";

import { ScatterplotLayer } from "deck.gl";

import { DualRangeSlider } from "shadcn/dual-range-slider";
import ProjectInfoPanel from "core/components/infoPanels/ProjectInfoPanel";
import useTopicFilter from "core/components/menus/filter/TopicFilter";
import ScenarioTemplate from "core/components/scenarios/ScenarioTemplate";
import { ProjectCoordinatorPoint } from "datamodel/scenario_points/types";
import useCountryFilter from "core/components/menus/filter/CountryFilter";
import { useProjectById } from "core/hooks/queries/project/useProjectById";
import useTransformProjects from "core/hooks/transform/useTransformProjects";
import useFundingProgrammeFilter from "core/components/menus/filter/FundingProgrammeFilter";
import { useProjectsCoordinatorPoints } from "core/hooks/queries/scenario_points/useProjectsCoordinatorPoints";

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

  const filterMenus: ReactNode[] = [
    <div
      className="h-auto min-w-72 px-6 pb-2 pt-8 md:pt-6"
      key="dualyear-filter"
    >
      <DualRangeSlider
        label={(value) => value}
        value={years}
        onValueChange={setYears}
        min={1990}
        max={2027}
        step={1}
      />
    </div>,
    <CountryFilter key="country-filter" />,
    <TopicFilter key="topic-filter" />,
    <FundingProgrammeFilter key="funding-filter" />,
  ];

  /** Layer */
  const layer = new ScatterplotLayer({
    id: `scatter-${id}`,
    data: filterdDataPoints,
    pickable: true,
    opacity: 0.8,
    filled: true,
    stroked: false,
    radiusScale: 6,
    radiusMinPixels: 3,
    radiusMaxPixels: 100,
    lineWidthMinPixels: 1,
    getRadius: 100,
    getFillColor: [255, 140, 0],
    antialiasing: true,
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
