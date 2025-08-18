"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import { ScatterplotLayer } from "deck.gl";
import { H4 } from "shadcn/typography";
import { Input } from "shadcn/input";
import { baseLayerProps } from "deckgl/baseLayerProps";
import { DualRangeSlider } from "shadcn/dual-range-slider";
import { INITIAL_VIEW_STATE_EU } from "deckgl/viewports";
import useTopicFilter from "components/menus/filter/TopicFilter";
import useCountryFilter from "components/menus/filter/CountryFilter";
import ProjectInfoPanel from "components/infoPanels/ProjectInfoPanel";
import { ProjectCoordinatorPoint } from "datamodel/scenario_points/types";
import { useProjectById } from "core/hooks/queries/project/useProjectById";
import useTransformProjects from "core/hooks/transform/useTransformProjects";
import InstitutionInfoPanel from "components/infoPanels/InstitutionInfoPanel";
import { useInstitutionById } from "core/hooks/queries/institution/useInstitutionById";
import useFundingProgrammeFilter from "components/menus/filter/FundingProgrammeFilter";
import { useProjectsCoordinatorPoints } from "core/hooks/queries/scenario_points/useProjectsCoordinatorPoints";
import useSimpleSearch from "components/menus/filter/SearchFilter";
import { useProjectsByKeywords } from "core/hooks/queries/project/useProjectsByKeywords";
import { Spinner } from "shadcn/spinner";
import BaseUI from "components/BaseUI";

export default function ProjectScenario() {
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

  // Data menu state
  const isDataMenuOpen = selectedProject !== null;

  /** Progressive Enhancement */
  const dataPoints = transformedPoints ?? projectCoordinatorPoints;

  /** Filter - Calculate year range once and memoize */
  const { MIN_YEAR, MAX_YEAR } = useMemo(() => {
    if (!dataPoints?.length) return { MIN_YEAR: 1957, MAX_YEAR: 2030 };

    const validPoints = dataPoints.filter(
      (point) =>
        point.start_date &&
        point.end_date &&
        new Date(point.end_date).getFullYear() < 2100 &&
        new Date(point.start_date).getFullYear() < 2100,
    );

    if (validPoints.length === 0) return { MIN_YEAR: 1957, MAX_YEAR: 2030 };

    const minYear = validPoints.reduce((acc, point) => {
      return Math.min(acc, new Date(point.start_date).getFullYear());
    }, 10000);

    const maxYear = validPoints.reduce((acc, point) => {
      return Math.max(acc, new Date(point.end_date).getFullYear());
    }, 0);

    return { MIN_YEAR: minYear, MAX_YEAR: maxYear };
  }, [dataPoints]);

  // Initialize years state with calculated values
  const [years, setYears] = useState<number[]>(() => [MIN_YEAR, MAX_YEAR]);

  // Only update years when the calculated range actually changes
  const prevMinMax = useRef({ MIN_YEAR, MAX_YEAR });
  React.useEffect(() => {
    if (
      prevMinMax.current.MIN_YEAR !== MIN_YEAR ||
      prevMinMax.current.MAX_YEAR !== MAX_YEAR
    ) {
      setYears([MIN_YEAR, MAX_YEAR]);
      prevMinMax.current = { MIN_YEAR, MAX_YEAR };
    }
  }, [MIN_YEAR, MAX_YEAR]);

  const { CountryFilter, countryPredicate } = useCountryFilter();
  const { TopicFilter, topicPredicate } = useTopicFilter();
  const { FundingProgrammeFilter, fundingProgrammePredicate } =
    useFundingProgrammeFilter();

  const {
    searchPredicate,
    searchQuery,
    setSearchQuery,
    searchLabel,
    placeholderText,
  } = useSimpleSearch({
    useSearchHook: useProjectsByKeywords,
    idField: "project_id",
    searchLabel: "Project Search",
    placeholderText: "Search projects for title, acronym and objective ...",
    idPredicate: "project_id",
  });

  // Optimize the filtering with better memoization
  const filterdDataPoints = useMemo(() => {
    if (!dataPoints?.length) return [];

    return dataPoints.filter((point) => {
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
  }, [
    dataPoints,
    years,
    countryPredicate,
    topicPredicate,
    fundingProgrammePredicate,
    searchPredicate,
  ]);

  /** Layer with stable onClick handler */
  const handleLayerClick = useCallback((info: any) => {
    if (info.object) {
      setSelectedProject(info.object as ProjectCoordinatorPoint);
    }
  }, []);

  const layer = useMemo(() => {
    return new ScatterplotLayer({
      ...baseLayerProps,
      id: "scatter-projects",
      data: filterdDataPoints,
      getFillColor: [255, 140, 0],
      getPosition: (d) => [d.geolocation[0], d.geolocation[1]],
      onClick: handleLayerClick,
    });
  }, [filterdDataPoints, handleLayerClick]);

  /** Stable event handlers */
  const downloadAsJson = useCallback((data: any, filename: string) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const handleDownload = useCallback(() => {
    downloadAsJson(
      filterdDataPoints,
      `filtered-projects-${new Date().toISOString().split("T")[0]}.json`,
    );
  }, [downloadAsJson, filterdDataPoints]);

  const handleMapClick = useCallback((info: any) => {
    if (!info.picked) {
      setSelectedProject(null);
    }
  }, []);

  const handleCloseDataMenu = useCallback(() => {
    setSelectedProject(null);
  }, []);

  // Create stable handlers for slider
  const handleYearsChange = useCallback((newYears: number[]) => {
    setYears(newYears);
  }, []);

  // Create stable handler for search
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [setSearchQuery],
  );

  /** Content for BaseUI */
  const titleContent = useMemo(
    () => (
      <>
        <span className="text-gray-700">Displaying</span>{" "}
        <span className="font-semibold text-orange-400">
          {filterdDataPoints?.length.toLocaleString() || 0}
        </span>{" "}
        <span className="text-gray-700">Projects</span>
      </>
    ),
    [filterdDataPoints?.length],
  );

  const infoBoxContent = useMemo(
    () => (
      <div className="space-y-4 text-gray-700">
        <section>
          <h3 className="font-semibold text-gray-800">Project Map</h3>
          <p>
            Each dot represents a project with its coordinating institution from
            the aggregated dataset. Click on any project to view detailed
            information including title, objective, funding amount and call
            information. Use the search box to filter projects by keyword.
          </p>
        </section>
      </div>
    ),
    [],
  );

  // Create stable filter content with proper key to prevent remounting
  const filterContent = useMemo(
    () => (
      <>
        <div className="h-auto" key="time-range-filter">
          <H4>Time Range</H4>
          <DualRangeSlider
            key={`slider-${MIN_YEAR}-${MAX_YEAR}`} // Stable key based on range
            className="pt-10 md:pt-8"
            label={(value: number | undefined) => value}
            value={years}
            onValueChange={handleYearsChange}
            min={MIN_YEAR}
            max={MAX_YEAR}
            step={1}
          />
        </div>
        <div key="country-filter">
          <CountryFilter />
        </div>
        <div key="funding-filter">
          <FundingProgrammeFilter />
        </div>
        <div key="topic-filter">
          <TopicFilter />
        </div>
        <div className="h-auto" key="search-filter">
          <H4>{searchLabel}</H4>
          <Input
            key="search-input" // Stable key
            type="text"
            placeholder={placeholderText}
            value={searchQuery}
            onChange={handleSearchChange}
            className="mt-2"
          />
        </div>
      </>
    ),
    [
      years,
      handleYearsChange,
      MIN_YEAR,
      MAX_YEAR,
      CountryFilter,
      FundingProgrammeFilter,
      TopicFilter,
      searchLabel,
      placeholderText,
      searchQuery,
      handleSearchChange,
    ],
  );

  const dataMenuContent = useMemo(
    () => (
      <div className="space-y-4">
        {coordinator && <InstitutionInfoPanel institution={coordinator} />}
        {project && <ProjectInfoPanel project={project} />}
      </div>
    ),
    [coordinator, project],
  );

  /** Loading and Error States */
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        Error loading projects: {error}
      </div>
    );
  }

  return (
    <BaseUI
      layers={[layer]}
      viewState={INITIAL_VIEW_STATE_EU}
      onMapClick={handleMapClick}
      titleContent={titleContent}
      infoBoxContent={infoBoxContent}
      onDownload={handleDownload}
      filterContent={filterContent}
      dataMenuContent={dataMenuContent}
      isDataMenuOpen={isDataMenuOpen}
      onCloseDataMenu={handleCloseDataMenu}
      additionalContent={null}
    />
  );
}
