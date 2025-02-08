"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import React, { ReactNode, useState } from "react";
import { ScatterplotLayer } from "deck.gl";

import TimeSlider from "core/components/menus/TimeSlider";
import { useProjectsCoordinatorPoints } from "core/hooks/queries/project/useProjectsCoordinatorPoints";
import { useProjectById } from "core/hooks/queries/project/useProjectById";
import ProjectCard from "core/components/cards/ProjectCard";
import { ProjectCoordinatorPoint } from "datamodel/project/types";
import ScenarioTemplate from "core/components/deckgl/ScenarioTemplate";
import CountryFilter from "core/components/menus/filter/CountryFilter";
import useTransformProjectCoordinator from "core/hooks/transform/useTransformProjectCoordinatorTopics";
import TopicFilter from "core/components/menus/filter/TopicFilter";
import FundingFilter from "core/components/menus/filter/FundingFilter";

export default function ProjectScenario() {
  const id: string = "projects";

  /** Data */
  // filter year below
  const {
    data: projectCoordinatorPoints,
    loading,
    error,
  } = useProjectsCoordinatorPoints();
  const {
    data: transformedPoints,
    loading: loadingTransformed,
    error: errorTransformed,
  } = useTransformProjectCoordinator(projectCoordinatorPoints);
  const [selectedProject, setSelectedProject] =
    useState<ProjectCoordinatorPoint | null>(null);
  const {
    data: project,
    loading: loadingInfo,
    error: errorInfo,
  } = useProjectById(selectedProject?.project_id ?? -1);

  // Progressive Enhancement
  const dataPoints = transformedPoints ?? projectCoordinatorPoints; // ?? institutionPoints;

  /** Filter */
  const [selectedYear, setSelectedYear] = useState(2024);
  const [countriesFilter, setCountriesFilter] = useState<string[]>([]);
  const [topics0Filter, setTopics0Filter] = useState<string[]>([]);
  const [topics1Filter, setTopics1Filter] = useState<string[]>([]);
  const [topics2Filter, setTopics2Filter] = useState<string[]>([]);
  const [frameworksFilter, setFrameworksFilter] = useState<string[]>([]);
  const [codeFilter, setCodeFilter] = useState<string[]>([]);

  const filterdDataPoints = dataPoints?.filter((point) => {
    const passesTimeFilter =
      selectedYear >= new Date(point.start_date).getFullYear() &&
      selectedYear <= new Date(point.end_date).getFullYear();

    const passesCountryFilter =
      countriesFilter.length === 0 ||
      !point.address_country ||
      countriesFilter.includes(point.address_country);

    function topicFilter(data: string[]): boolean {
      return (
        data.length === 0 ||
        (point.topics?.some((topic) => data.includes(topic.id.toString())) ??
          false)
      );
    }
    const passesTopic0Filter = topicFilter(topics0Filter);
    const passesTopic1Filter = topicFilter(topics1Filter);
    const passesTopic2Filter = topicFilter(topics2Filter);

    const passesFrameworkFilter =
      frameworksFilter.length === 0 ||
      (point.funding_programmes?.some((funding) =>
        frameworksFilter.includes(funding.framework_programme),
      ) ??
        false);
    const passesCodeFilter =
      codeFilter.length === 0 ||
      (point.funding_programmes?.some((funding) =>
        codeFilter.includes(funding.code),
      ) ??
        false);

    return (
      passesTimeFilter &&
      passesCountryFilter &&
      passesTopic0Filter &&
      passesTopic1Filter &&
      passesTopic2Filter &&
      passesFrameworkFilter &&
      passesCodeFilter
    );
  });

  const filterMenus: ReactNode[] = [
    <TimeSlider
      key="time-filter"
      year={selectedYear}
      onChange={setSelectedYear}
    />,
    <CountryFilter
      key="country-filter"
      setSelectedCountries={setCountriesFilter}
    />,
    <TopicFilter
      key="topic-filter"
      setTopics0Filter={setTopics0Filter}
      setTopics1Filter={setTopics1Filter}
      setTopics2Filter={setTopics2Filter}
    />,
    <FundingFilter
      key="funding-filter"
      setFrameworksFilter={setFrameworksFilter}
      setCodeFilter={setCodeFilter}
    />,
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
    getPosition: (d) => [d.address_geolocation[1], d.address_geolocation[0]],
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
      description="WIP! this displays the coordinators topics and funding programmes, not the projects topics and funding programmes."
      isLoading={loading}
      error={error}
      statsCard={
        <span>
          Displaying {filterdDataPoints?.length.toLocaleString() || 0} Projects
        </span>
      }
      filterMenus={filterMenus}
      layers={[layer]}
      detailsCard={project && <ProjectCard project={project} />}
    />
  );
}
