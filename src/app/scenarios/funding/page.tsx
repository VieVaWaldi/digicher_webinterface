"use client";

import React, { ReactNode, useState } from "react";

import { PickingInfo } from "deck.gl";

import { Button } from "shadcn/button";
import { ColumnLayer } from "@deck.gl/layers";
import { baseLayerProps } from "deckgl/baseLayerProps";
import { useSettings } from "core/context/SettingsContext";
import { INITIAL_VIEW_STATE_TILTED_EU } from "deckgl/viewports";
import useTopicFilter from "core/components/menus/filter/TopicFilter";
import ScenarioTemplate from "core/components/scenarios/ScenarioTemplate";
import useCountryFilter from "core/components/menus/filter/CountryFilter";
import ProjectInfoPanel from "core/components/infoPanels/ProjectInfoPanel";
import { useProjectById } from "core/hooks/queries/project/useProjectById";
import useTransformProjects from "core/hooks/transform/useTransformProjects";
import InstitutionInfoPanel from "core/components/infoPanels/InstitutionInfoPanel";
import { useInstitutionById } from "core/hooks/queries/institution/useInstitutionById";
import useFundingProgrammeFilter from "core/components/menus/filter/FundingProgrammeFilter";
import { useFundingProjectPoints } from "core/hooks/queries/scenario_points/useFundingProjectPoints";
import { useFundingInstitutionPoints } from "core/hooks/queries/scenario_points/useFundingInstitutionPoints";
import {
  FundingBasePoint,
  FundingInstitutionPoint,
  FundingProjectPoint,
} from "datamodel/scenario_points/types";
import useTransformInstitutionsWithProjects from "core/hooks/transform/useTransformationInstitutionsWithProjects";
import { ScopeToggle } from "core/components/buttons/toggle";

export default function FundingScenario() {
  const id: string = "funding";
  const { isGlobe } = useSettings();
  const [showInstitutions, setShowInstitutions] = useState<boolean>(true);

  const COLOR_GAMMA = 0.7;
  const MAX_HEIGHT = isGlobe ? 5_000_000 : 800_000;
  const BAR_RADIUS = isGlobe ? 2_500 : 700;

  /** Institution data */
  const {
    data: fundingInstitutionPoints,
    loading,
    error,
  } = useFundingInstitutionPoints();
  const { data: transformedInstitutionPoints } =
    useTransformInstitutionsWithProjects(fundingInstitutionPoints);
  const [selectedInstitution, setSelectedInstitution] =
    useState<FundingInstitutionPoint | null>(null);
  const { data: institution } = useInstitutionById(
    selectedInstitution?.institution_id ?? -1,
  );

  /** Project data */
  const { data: fundingProjectPoints } = useFundingProjectPoints();
  const { data: transformedProjectPoints } =
    useTransformProjects(fundingProjectPoints);
  const [selectedProject, setSelectedProject] =
    useState<FundingProjectPoint | null>(null);
  const { data: project } = useProjectById(selectedProject?.project_id ?? -1);

  /**  Progressive Enhancement */
  const dataInstitutionPoints =
    transformedInstitutionPoints ?? fundingInstitutionPoints;
  const dataProjectPoints = transformedProjectPoints ?? fundingProjectPoints;

  /**  Filters */
  const { CountryFilter, countryPredicate } = useCountryFilter();
  const { TopicFilter, topicPredicate } = useTopicFilter();
  const { FundingProgrammeFilter, fundingProgrammePredicate } =
    useFundingProgrammeFilter();

  /**  Filters Institutions */
  const countryFilteredInstitutions = dataInstitutionPoints?.filter(
    (institution) => countryPredicate(institution),
  );
  const filteredAllInstitutions = countryFilteredInstitutions?.map(
    (institution) => {
      const filteredProjects = institution.projects_funding.filter(
        (project) =>
          topicPredicate(project) && fundingProgrammePredicate(project),
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
      fundingProgrammePredicate(point),
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
        return ratio * MAX_HEIGHT;
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
      ...baseLayerProps,
      diskResolution: 32,
      radius: BAR_RADIUS,
      getPosition: (d) => [d.geolocation[1], d.geolocation[0]],
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
    (object) => showInstitutions && setSelectedInstitution(object),
  );

  const layerPrj = createColumnLayer<FundingProjectPoint>(
    "projects",
    filterdProjectPoints,
    getProjectFunding,
    (object) => !showInstitutions && setSelectedProject(object),
  );

  const filterMenus: ReactNode[] = [
    <div key="toggle-filter" className="flex justify-center">
      <ScopeToggle
        isInstitution={showInstitutions}
        onChange={setShowInstitutions}
      />
    </div>,
    <CountryFilter key="country-filter" />,
    <FundingProgrammeFilter key="funding-filter" />,
    <TopicFilter key="topic-filter" />,
  ];

  const data: FundingBasePoint[] | undefined = showInstitutions
    ? filterdInstitutionPoints
    : filterdProjectPoints;
  const layer = showInstitutions ? layerInst : layerPrj;
  const totalFunding: number = showInstitutions
    ? totalFundingInstitutions
    : totalFundingProjects;

  return (
    <ScenarioTemplate
      id={id}
      title="Funding Map"
      description="Projects are placed given their coordinatores geolocation. About a quarter of the projects dont have a specific cost listing attributed to the individual institutions (sadly especially the big ones like ALTER-NET or SUNLIQUID). When displaying institutions the sum of all existing partial listings is used as the funding amount displayed, which means some projects are excluded from the Institution view."
      isLoading={loading}
      error={error}
      statsCard={
        <span>
          Displaying {data?.length.toLocaleString() || 0}{" "}
          {showInstitutions ? "Institutions" : "Projects"} with{" "}
          {new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "EUR",
          }).format(totalFunding)}
        </span>
      }
      filterMenus={filterMenus}
      layers={[layer]}
      infoPanel={
        showInstitutions
          ? institution && <InstitutionInfoPanel institution={institution} />
          : project && <ProjectInfoPanel project={project} />
      }
      viewState={INITIAL_VIEW_STATE_TILTED_EU}
    />
  );
}
