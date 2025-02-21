"use client";

import React, { ReactNode, useState } from "react";

import { Button } from "shadcn/button";
import { ColumnLayer } from "@deck.gl/layers";
import { baseLayerProps } from "deckgl/baseLayerProps";
import { INITIAL_VIEW_STATE_TILTED_EU } from "deckgl/viewports";
import useTopicFilter from "core/components/menus/filter/TopicFilter";
import ScenarioTemplate from "core/components/scenarios/ScenarioTemplate";
import useCountryFilter from "core/components/menus/filter/CountryFilter";
import ProjectInfoPanel from "core/components/infoPanels/ProjectInfoPanel";
import { useProjectById } from "core/hooks/queries/project/useProjectById";
import useTransformProjects from "core/hooks/transform/useTransformProjects";
import InstitutionInfoPanel from "core/components/infoPanels/InstitutionInfoPanel";
import useTransformInstitutions from "core/hooks/transform/useTransformInstitutions";
import { useInstitutionById } from "core/hooks/queries/institution/useInstitutionById";
import useFundingProgrammeFilter from "core/components/menus/filter/FundingProgrammeFilter";
import { useFundingProjectPoints } from "core/hooks/queries/scenario_points/useFundingProjectPoints";
import { useFundingInstitutionPoints } from "core/hooks/queries/scenario_points/useFundingInstitutionPoints";
import {
  FundingBasePoint,
  FundingInstitutionPoint,
  FundingProjectPoint,
} from "datamodel/scenario_points/types";

export default function FundingScenario() {
  const id: string = "funding";

  /** Data Institutions */
  const {
    data: fundingInstitutionPoints,
    loading: loading,
    error: error,
  } = useFundingInstitutionPoints();
  const { data: transformedInstitutionPoints } = useTransformInstitutions(
    fundingInstitutionPoints,
  );
  const [selectedInstitution, setSelectedInstitution] =
    useState<FundingInstitutionPoint | null>(null);
  const { data: institution } = useInstitutionById(
    selectedInstitution?.institution_id ?? -1,
  );

  /** Data Projects */
  const { data: fundingProjectPoints } = useFundingProjectPoints();
  const { data: transformedProjectPoints } =
    useTransformProjects(fundingProjectPoints);
  const [selectedProject, setSelectedProject] =
    useState<FundingProjectPoint | null>(null);
  const { data: project } = useProjectById(selectedProject?.project_id ?? -1);

  /** Progressive Enhancement */
  const dataInstitutionPoints =
    transformedInstitutionPoints ?? fundingInstitutionPoints;
  const dataProjectPoints = transformedProjectPoints ?? fundingProjectPoints;

  /** Filter */
  const [showInstitutions, setShowInstitutions] = useState<boolean>(true);

  const { CountryFilter, countryPredicate } = useCountryFilter();
  const { TopicFilter, topicPredicate } = useTopicFilter();
  const { FundingProgrammeFilter, fundingProgrammePredicate } =
    useFundingProgrammeFilter();

  const filterdDataInstitutionPoints = dataInstitutionPoints?.filter(
    (point) => {
      return (
        countryPredicate(point) &&
        topicPredicate(point) &&
        fundingProgrammePredicate(point)
      );
    },
  );

  const filterdDataProjectPoints = dataProjectPoints?.filter((point) => {
    return (
      countryPredicate(point) &&
      topicPredicate(point) &&
      fundingProgrammePredicate(point)
    );
  });

  const filterMenus: ReactNode[] = [
    <Button
      key="toggle-filter"
      onClick={() => setShowInstitutions(!showInstitutions)}
    >
      Switch to {showInstitutions ? "Projects" : "Institutions"}
    </Button>,
    <CountryFilter key="country-filter" />,
    <TopicFilter key="topic-filter" />,
    <FundingProgrammeFilter key="funding-filter" />,
  ];

  const data = showInstitutions
    ? filterdDataInstitutionPoints
    : filterdDataProjectPoints;

  const layer = new ColumnLayer<FundingBasePoint>({
    ...baseLayerProps,
    id: id,
    data: data,
    diskResolution: 32,
    radius: 400,
    getPosition: (d) => [d.geolocation[1], d.geolocation[0]],
    getElevation: (d) => {
      const MAX_FUNDING = 205538467.02; // Known maximum
      const MAX_HEIGHT = 1000000; // Maximum height in m

      const funding = d.total_cost ? parseFloat(d.total_cost as string) : 0;
      return (funding / MAX_FUNDING) * MAX_HEIGHT;
    },
    getFillColor: (d) => {
      const MAX_FUNDING = 205538467.02;
      const funding = d.total_cost ? parseFloat(d.total_cost as string) : 0;
      const normalizedFunding = funding / MAX_FUNDING;

      return [255 * normalizedFunding, 0, 0, 200];
    },
    extruded: true,
    material: {
      ambient: 0.64,
      diffuse: 0.6,
      shininess: 32,
      specularColor: [51, 51, 51],
    },
    onClick: (info) => {
      if (info.object && showInstitutions) {
        setSelectedInstitution(info.object as FundingInstitutionPoint);
      }
      if (info.object && !showInstitutions) {
        setSelectedProject(info.object as FundingProjectPoint);
      }
    },
  });

  const funding = data?.reduce(
    (acc, o) => acc + parseFloat(o.total_cost ? o.total_cost : "0"),
    0,
  );

  return (
    <ScenarioTemplate
      id={id}
      title="Funding Map"
      isLoading={loading}
      error={error}
      statsCard={
        <span>
          Displaying {data?.length.toLocaleString() || 0}{" "}
          {showInstitutions ? "Institutions" : "Projects"} with{" "}
          {new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "EUR",
          }).format(funding ? funding : 0)}
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
