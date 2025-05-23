"use client";

import React, { ReactNode, useState } from "react";

import { ScatterplotLayer } from "deck.gl";

import { H4 } from "shadcn/typography";
import { baseLayerProps } from "deckgl/baseLayerProps";
import { DualRangeSlider } from "shadcn/dual-range-slider";
import useTopicFilter from "components/menus/filter/TopicFilter";
import ScenarioTemplate from "components/scenarios/ScenarioTemplate";
import useCountryFilter from "components/menus/filter/CountryFilter";
import ProjectInfoPanel from "components/infoPanels/ProjectInfoPanel";
import { ProjectCoordinatorPoint } from "datamodel/scenario_points/types";
import { useProjectById } from "core/hooks/queries/project/useProjectById";
import useTransformProjects from "core/hooks/transform/useTransformProjects";
import InstitutionInfoPanel from "components/infoPanels/InstitutionInfoPanel";
import { useInstitutionById } from "core/hooks/queries/institution/useInstitutionById";
import useFundingProgrammeFilter from "components/menus/filter/FundingProgrammeFilter";
import { useProjectsCoordinatorPoints } from "core/hooks/queries/scenario_points/useProjectsCoordinatorPoints";
import useSearchComponent from "components/menus/filter/SearchFilter";
import { useProjectsByKeywords } from "core/hooks/queries/project/useProjectsByKeywords";
import { Navigation } from "components/navigation/Navigation";

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
  const { data: coordinator } = useInstitutionById(
    selectedProject?.institution_id ?? -1,
  );

  /** Progressive Enhancement */

  const dataPoints = transformedPoints ?? projectCoordinatorPoints;

  /** Filter */
  const MIN_YEAR =
    dataPoints
      ?.filter(
        (point) =>
          point.start_date &&
          point.end_date &&
          new Date(point.end_date).getFullYear() < 2100 &&
          new Date(point.start_date).getFullYear() < 2100,
      )
      .reduce((acc, point) => {
        return Math.min(acc, new Date(point.start_date).getFullYear());
      }, 10000) ?? 1957;
  const MAX_YEAR =
    dataPoints
      ?.filter(
        (point) =>
          point.start_date &&
          point.end_date &&
          new Date(point.end_date).getFullYear() < 2100 &&
          new Date(point.start_date).getFullYear() < 2100,
      )
      .reduce((acc, point) => {
        return Math.max(acc, new Date(point.end_date).getFullYear());
      }, 0) ?? 2030;

  const [years, setYears] = useState([MIN_YEAR, MAX_YEAR]);
  const { CountryFilter, countryPredicate } = useCountryFilter();
  const { TopicFilter, topicPredicate } = useTopicFilter();
  const { FundingProgrammeFilter, fundingProgrammePredicate } =
    useFundingProgrammeFilter();
  const { PaginatedResults, searchPredicate } = useSearchComponent({
    useSearchHook: useProjectsByKeywords,
    idField: "project_id",
    displayField: "title",
    searchLabel: "Project Search",
    placeholderText: "Search projects for title, acronymn and objective ...",
    idPredicate: "project_id",
  });

  const filterdDataPoints = dataPoints?.filter((point) => {
    const passesYearFilter =
      point.start_date &&
      point.end_date &&
      years[1] >= new Date(point.start_date).getFullYear() &&
      years[0] <= new Date(point.end_date).getFullYear();
    return (
      passesYearFilter &&
      countryPredicate(point) &&
      topicPredicate(point) &&
      fundingProgrammePredicate(point) &&
      searchPredicate(point)
    );
  });

  /** Layer */

  const layer = new ScatterplotLayer({
    ...baseLayerProps,
    id: `scatter-${id}`,
    data: filterdDataPoints,

    getFillColor: [255, 140, 0],
    getPosition: (d) => [d.geolocation[1], d.geolocation[0]],
    onClick: (info) => {
      if (info.object) {
        setSelectedProject(info.object as ProjectCoordinatorPoint);
      }
    },
  });

  /** Component */

  const filterMenus: ReactNode[] = [
    <div className="h-auto" key="dualyear-filter">
      <H4>Time Range</H4>
      <DualRangeSlider
        className="pt-10 md:pt-8"
        label={(value) => value}
        value={years}
        onValueChange={setYears}
        min={MIN_YEAR}
        max={MAX_YEAR}
        step={1}
      />
    </div>,
    <CountryFilter key="country-filter" />,
    <FundingProgrammeFilter key="funding-filter" />,
    <TopicFilter key="topic-filter" />,
  ];

  const InfoPanel = (
    <div>
      {coordinator && <InstitutionInfoPanel institution={coordinator} />}
      {project && <ProjectInfoPanel project={project} />}
    </div>
  );

  return (
    <div className="md:pt-12">
      <Navigation />
      <ScenarioTemplate
        id={id}
        title="Project Map"
        description="Each dot represents a project with its coordinating institution from the aggregated dataset. Click on any project to view detailed information including title, objective, funding amount and call information. Use the search box above to filter projects by keyword."
        statsCard={
          <span>
            Displaying{" "}
            <span className="font-semibold text-orange-400">
              {filterdDataPoints?.length.toLocaleString() || 0}
            </span>{" "}
            Projects
          </span>
        }
        filterMenus={filterMenus}
        dataMenu={PaginatedResults}
        infoPanel={InfoPanel}
        layers={[layer]}
        isLoading={loading}
        error={error}
      />
    </div>
  );
}
