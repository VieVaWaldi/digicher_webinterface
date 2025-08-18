"use client";

import React, { ReactNode, useState } from "react";

import { PickingInfo } from "deck.gl";

import { H3 } from "shadcn/typography";
import { ColumnLayer } from "@deck.gl/layers";
import { baseLayerProps } from "deckgl/baseLayerProps";
import { useSettings } from "core/context/SettingsContext";
import { ScopeToggle } from "components/buttons/toggle";
import { INITIAL_VIEW_STATE_TILTED_EU } from "deckgl/viewports";
import useTopicFilter from "components/menus/filter/TopicFilter";
import ScenarioTemplate from "components/scenarios/ScenarioTemplate";
import useCountryFilter from "components/menus/filter/CountryFilter";
import { useProjectById } from "core/hooks/queries/project/useProjectById";
import ProjectInfoPanel from "components/infoPanels/ProjectInfoPanel";
import useTransformProjects from "core/hooks/transform/useTransformProjects";
import { useProjectsByIds } from "core/hooks/queries/project/useProjectsByIds";
import InstitutionInfoPanel from "components/infoPanels/InstitutionInfoPanel";
import { useInstitutionById } from "core/hooks/queries/institution/useInstitutionById";
import useFundingProgrammeFilter from "components/menus/filter/FundingProgrammeFilter";
import { useFundingProjectPoints } from "core/hooks/queries/scenario_points/useFundingProjectPoints";
import { useFundingInstitutionPoints } from "core/hooks/queries/scenario_points/useFundingInstitutionPoints";
import {
  FundingBasePoint,
  FundingInstitutionPoint,
  FundingProjectPoint,
} from "datamodel/scenario_points/types";
import useTransformInstitutionsWithProjects from "core/hooks/transform/useTransformationInstitutionsWithProjects";
import { Button } from "shadcn/button";
import useSearchComponent from "components/menus/filter/SearchFilterPaginated";
import { Navigation } from "components/navigation/Navigation";
import { useProjectsByKeywords } from "core/hooks/queries/project/useProjectsByKeywords";

export default function FundingScenario() {
  const id: string = "funding";
  const [showInstitutions, setShowInstitutions] = useState<boolean>(true);

  const { isGlobe } = useSettings();
  const [visibleMode, setvisibleMode] = useState<boolean>(false);
  const COLOR_GAMMA = 0.7;
  const MAX_HEIGHT = isGlobe ? 5_000_000 : 1_200_000;
  let BAR_RADIUS = isGlobe ? 2_500 : 1_200;
  if (visibleMode) BAR_RADIUS *= 2;

  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    funding: number;
    object: FundingBasePoint | null;
  } | null>(null);

  /** Institution data */

  const {
    data: fundingInstitutionPoints,
    loading,
    error,
  } = useFundingInstitutionPoints();
  const { data: transformedInstitutionPoints } =
    useTransformInstitutionsWithProjects(fundingInstitutionPoints);

  /** Project data */

  const { data: fundingProjectPoints } = useFundingProjectPoints();
  const { data: transformedProjectPoints } =
    useTransformProjects(fundingProjectPoints);

  /**  Progressive Enhancement */

  const dataInstitutionPoints =
    transformedInstitutionPoints ?? fundingInstitutionPoints;
  const dataProjectPoints = transformedProjectPoints ?? fundingProjectPoints;

  /**  Filters */

  const { CountryFilter, countryPredicate } = useCountryFilter();
  const { TopicFilter, topicPredicate } = useTopicFilter();
  const { FundingProgrammeFilter, fundingProgrammePredicate } =
    useFundingProgrammeFilter();

  const {
    PaginatedResults: PaginatedProjectResults,
    searchPredicate: searchProjectPredicate,
  } = useSearchComponent({
    useSearchHook: useProjectsByKeywords,
    idField: "project_id",
    displayField: "title",
    searchLabel: "Project Search",
    placeholderText: "Search projects for title, acronymn and objective ...",
    idPredicate: "project_id",
  });

  /**  Filters Institutions */

  // ToDo we dont really need to be filtering projects when showInstitutions is enabled and vice verca lol

  const countryFilteredInstitutions = dataInstitutionPoints?.filter(
    (institution) => countryPredicate(institution),
  );

  const filteredAllInstitutions = countryFilteredInstitutions?.map(
    (institution) => {
      const filteredProjects = institution.projects_funding.filter(
        (project) =>
          topicPredicate(project) &&
          fundingProgrammePredicate(project) &&
          searchProjectPredicate(project),
      );
      return {
        ...institution,
        projects_funding: filteredProjects,
      } as FundingInstitutionPoint;
    },
  );

  const filterdInstitutionPoints = filteredAllInstitutions?.filter(
    (institution) => institution.projects_funding.length > 0,
  );

  /**  Filters Projects */

  const filterdProjectPoints = dataProjectPoints?.filter(
    (point) =>
      countryPredicate(point) &&
      topicPredicate(point) &&
      fundingProgrammePredicate(point) &&
      searchProjectPredicate(point),
  );

  /**  State Selected Institution */

  const [selectedInstitutionId, setSelectedInstitutionId] = useState<
    number | null
  >(null);
  const selectedInstitution = selectedInstitutionId
    ? filterdInstitutionPoints?.find(
        (i) => i.institution_id === selectedInstitutionId,
      ) || null
    : null;

  const { data: institution } = useInstitutionById(
    selectedInstitution?.institution_id ?? -1,
  );
  const projectIds = selectedInstitution
    ? selectedInstitution.projects_funding.map((p) => p.project_id ?? -1)
    : [];

  const { data: institutionProjects } = useProjectsByIds(
    projectIds.slice(0, 10),
  );

  /**  State Selected Project */

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );
  const selectedProject = selectedProjectId
    ? filterdProjectPoints?.find((p) => p.project_id === selectedProjectId) ||
      null
    : null;
  const { data: project } = useProjectById(selectedProject?.project_id ?? -1);
  const { data: coordinator } = useInstitutionById(
    selectedProject?.institution_id ?? -1,
  );

  /** Calculations */

  const getInstitutionFunding = (inst: FundingInstitutionPoint): number =>
    inst.projects_funding.reduce(
      (acc, p) => acc + (p.total_cost ? p.total_cost : 0),
      0,
    );

  const getProjectFunding = (prj: FundingProjectPoint): number =>
    parseInt(prj.total_cost ?? "0");

  const INSTITUTION_MAX_TOTAL_COST =
    fundingInstitutionPoints?.reduce(
      (acc, inst) => Math.max(acc, getInstitutionFunding(inst)),
      0,
    ) ?? 0;

  const PROJECT_MAX_TOTAL_COST =
    fundingProjectPoints?.reduce(
      (acc, prj) => Math.max(acc, getProjectFunding(prj)),
      0,
    ) ?? 0;

  const MAX_TOTAL_COST = Math.max(
    INSTITUTION_MAX_TOTAL_COST,
    PROJECT_MAX_TOTAL_COST,
  );

  const totalFundingInstitutions =
    filterdInstitutionPoints?.reduce(
      (acc, inst) => acc + getInstitutionFunding(inst),
      0,
    ) ?? 0;

  const totalFundingProjects =
    filterdProjectPoints?.reduce(
      (acc, prj) => acc + getProjectFunding(prj),
      0,
    ) ?? 0;

  const dataLength: string =
    (showInstitutions
      ? filterdInstitutionPoints
      : filterdProjectPoints
    )?.length.toLocaleString() || "0";
  const totalFunding: number = showInstitutions
    ? totalFundingInstitutions
    : totalFundingProjects;

  /** Layers */
  const createColumnLayer = <T extends FundingBasePoint>(
    id: string,
    data: T[] | undefined,
    getFunding: (d: T) => number,
    handleClick: (object: T) => void,
  ) => {
    return new ColumnLayer({
      id: `id-${id}`,
      data,
      getElevation: (d) => {
        const funding = getFunding(d);
        const ratio = funding / MAX_TOTAL_COST;
        if (visibleMode) return ratio * MAX_HEIGHT * 8;
        else return ratio * MAX_HEIGHT;
      },
      getFillColor: (d) => {
        const funding = getFunding(d);
        const normalizedFunding = funding / MAX_TOTAL_COST;
        const adjustedValue = Math.pow(normalizedFunding, COLOR_GAMMA);

        return [
          50 + (255 - 50) * adjustedValue,
          50 - 50 * adjustedValue,
          50 - 50 * adjustedValue,
          200,
        ];
      },
      onClick: (info: PickingInfo) => {
        if (info.object) {
          handleClick(info.object as T);
        }
      },
      onHover: (info: PickingInfo) => {
        if (info.object) {
          setHoverInfo({
            x: info.x,
            y: info.y,
            funding: getFunding(info.object as T),
            object: info.object as FundingBasePoint,
          });
        } else {
          setHoverInfo(null);
        }
      },
      ...baseLayerProps,
      diskResolution: 32,
      radius: BAR_RADIUS,
      getPosition: (d) => [d.geolocation[0], d.geolocation[1]],
      extruded: true,
      material: {
        ambient: 0.64,
        diffuse: 0.6,
        shininess: 32,
        specularColor: [51, 51, 51],
      },
    });
  };

  const layerInst = createColumnLayer<FundingInstitutionPoint>(
    "institutions",
    filterdInstitutionPoints,
    getInstitutionFunding,
    (object) =>
      showInstitutions && setSelectedInstitutionId(object.institution_id),
  );

  const layerPrj = createColumnLayer<FundingProjectPoint>(
    "projects",
    filterdProjectPoints,
    getProjectFunding,
    (object) =>
      !showInstitutions && setSelectedProjectId(object.project_id ?? -1),
  );

  const layer = showInstitutions ? layerInst : layerPrj;

  /** Components */

  const filterMenus: ReactNode[] = [
    <div key="toggle-filter" className="flex justify-center">
      <ScopeToggle
        isInstitution={showInstitutions}
        onChange={setShowInstitutions}
      />
    </div>,
    <div key="toggle-bar-size">
      <Button onClick={() => setvisibleMode(!visibleMode)}>
        {visibleMode ? "Less visible" : "More visible"}
      </Button>
    </div>,
    <CountryFilter key="country-filter" />,
    <FundingProgrammeFilter key="funding-filter" />,
    <TopicFilter key="topic-filter" />,
  ];

  const infoPanel = (
    <>
      {showInstitutions
        ? selectedInstitution && (
            <div>
              {institution && (
                <InstitutionInfoPanel institution={institution} />
              )}
              {institutionProjects && (
                <H3 className="p-2 text-center">
                  displaying {institutionProjects.length} of{" "}
                  {selectedInstitution.projects_funding.length} Projects
                </H3>
              )}
              {institutionProjects?.map((p) => (
                <ProjectInfoPanel key={`prj-${p.id}`} project={p} />
              ))}
            </div>
          )
        : selectedProject && (
            <div>
              {coordinator && (
                <InstitutionInfoPanel institution={coordinator} />
              )}
              {project && <ProjectInfoPanel project={project} />}
            </div>
          )}
    </>
  );

  const hoverInfoComponent = (
    <div
      style={{
        position: "absolute",
        pointerEvents: "none",
        left: hoverInfo?.x,
        top: hoverInfo?.y,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: "#fff",
        padding: "8px",
        borderRadius: "4px",
        transform: "translate(-50%, -100%)",
        marginTop: "-15px",
      }}
    >
      <div>
        Total Cost:{" "}
        {new Intl.NumberFormat("de-DE", {
          style: "currency",
          currency: "EUR",
        }).format(hoverInfo?.funding ?? -1)}
      </div>
    </div>
  );

  return (
    <div className="md:pt-12">
      <Navigation />
      <ScenarioTemplate
        id={id}
        title="Funding Map"
        description="
          This scenario displays funding data as geographical bars on the map. 
          Toggle between two views: 'Institutions' shows all institutions with bar heights 
          representing their total received funding. Click on an institution to view its 
          associated projects (demo limited to first 10 projects). 'Projects' displays 
          project locations based on their coordinator institution, with bar heights 
          showing each project's total funding. Click on any project for detailed 
          information. Note that approximately 25% of projects (including major ones 
          like ALTER-NET and SUNLIQUID) do not specify individual institutional funding 
          amounts and are not listed in the 'Institutions' view."
        statsCard={
          <span>
            Displaying {dataLength}{" "}
            <span className="font-semibold text-orange-400">
              {showInstitutions ? "Institutions" : "Projects"}{" "}
            </span>{" "}
            with{" "}
            <span className="font-semibold text-orange-400">
              {new Intl.NumberFormat("de-DE", {
                style: "currency",
                currency: "EUR",
              }).format(totalFunding)}
            </span>
          </span>
        }
        filterMenus={filterMenus}
        dataMenu={PaginatedProjectResults}
        infoPanel={infoPanel}
        layers={[layer]}
        hoverTooltip={hoverInfoComponent}
        viewState={INITIAL_VIEW_STATE_TILTED_EU}
        isLoading={loading}
        error={error}
      />
    </div>
  );
}
