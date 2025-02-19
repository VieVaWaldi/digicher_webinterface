"use client";

import React, { ReactNode, useState } from "react";

import { ArcLayer, ColumnLayer } from "@deck.gl/layers";
import InstitutionCard from "core/components/cards/InstitutionCard";
import useTopicFilter from "core/components/menus/filter/TopicFilter";
import ScenarioTemplate from "core/components/deckgl/ScenarioTemplate";
import useCountryFilter from "core/components/menus/filter/CountryFilter";
import { InstitutionCollaborationWeights } from "datamodel/scenario_points/types";
import useTransformInstitutions from "core/hooks/transform/useTransformInstitutions";
import { useInstitutionById } from "core/hooks/queries/institution/useInstitutionById";
import useFundingProgrammeFilter from "core/components/menus/filter/FundingProgrammeFilter";
import { useInstitutionCollaboratorsById } from "core/hooks/queries/scenario_points/useCollaborationInstitutionById";
import { useInstitutionCollaborationWeights } from "core/hooks/queries/scenario_points/useCollaborationWeightsPoints";

export default function CollaborationScenario() {
  const id: string = "collaboration";

  /** Data */
  const {
    data: collaborationPoints,
    error,
    loading,
  } = useInstitutionCollaborationWeights();
  const { data: transformedPoints } =
    useTransformInstitutions(collaborationPoints);
  const [selectedInstitutionId, setSelectedInstitutionId] =
    useState<number>(-1);
  const [selectedInstitutionLocation, setSelectedInstitutionLocation] =
    useState<number[] | null>(null);
  const { data: institutionCollaborators } = useInstitutionCollaboratorsById(
    selectedInstitutionId,
  );

  const { data: institution } = useInstitutionById(selectedInstitutionId ?? -1);

  /** Progressive Enhancement */
  const dataPoints = transformedPoints ?? collaborationPoints;

  /** Filter */
  const { CountryFilter, countryPredicate } = useCountryFilter();
  const { TopicFilter, topicPredicate } = useTopicFilter();
  const { FundingProgrammeFilter, fundingProgrammePredicate } =
    useFundingProgrammeFilter();

  const filteredDataPoints = dataPoints?.filter((point) => {
    return (
      countryPredicate(point) &&
      topicPredicate(point) &&
      fundingProgrammePredicate(point)
    );
  });

  const filterMenus: ReactNode[] = [
    <CountryFilter key="country-filter" />,
    <TopicFilter key="topic-filter" />,
    <FundingProgrammeFilter key="funding-filter" />,
  ];

  /** Layer */

  const maxCollabWeight = React.useMemo(() => {
    if (!filteredDataPoints) return 0;
    return Math.max(...filteredDataPoints.map((d) => d.collaboration_weight));
  }, [filteredDataPoints]);

  const columnLayer = new ColumnLayer<InstitutionCollaborationWeights>({
    id: `column-${id}`,
    data: filteredDataPoints || [],
    diskResolution: 12,
    radius: 1500,
    getPosition: (d) => [d.geolocation[1], d.geolocation[0]],
    getElevation: (d) => {
      const MAX_HEIGHT = 200000;
      return (d.collaboration_weight / maxCollabWeight) * MAX_HEIGHT;
    },
    getFillColor: (d) => {
      const normalizedWeight = d.collaboration_weight / maxCollabWeight;
      return [0, 0 * (1 - normalizedWeight), 0 * (1 - normalizedWeight), 200];
    },
    pickable: true,
    autoHighlight: true,
    extruded: true,
    material: {
      ambient: 0.64,
      diffuse: 0.8,
      shininess: 32,
      specularColor: [51, 51, 51],
    },
    onClick: (info) => {
      const { object } = info;
      if (object) {
        setSelectedInstitutionId(object.institution_id);
        setSelectedInstitutionLocation([
          object.geolocation[1],
          object.geolocation[0],
        ]);
      } else {
        setSelectedInstitutionId(-1);
        setSelectedInstitutionLocation(null);
      }
    },
  });

  const arcData = React.useMemo(() => {
    if (
      !selectedInstitutionLocation ||
      !institutionCollaborators ||
      !Array.isArray(institutionCollaborators)
    ) {
      return [];
    }

    return institutionCollaborators.map((collaborator) => ({
      sourcePosition: selectedInstitutionLocation,
      targetPosition: [
        collaborator.geolocation[1],
        collaborator.geolocation[0],
      ],
      collaborator: collaborator,
    }));
  }, [selectedInstitutionLocation, institutionCollaborators]);

  const arcLayer = new ArcLayer({
    id: "collaboration-arcs",
    data: arcData,
    pickable: true,
    getSourcePosition: (d) => d.sourcePosition,
    getTargetPosition: (d) => d.targetPosition,
    getSourceColor: [255, 165, 0, 180],
    getTargetColor: [0, 255, 255, 180],
    getWidth: 2,
    widthScale: 2,
    widthMinPixels: 2,
  });

  return (
    <ScenarioTemplate
      id={id}
      title="Collaboration Map"
      isLoading={loading}
      error={error}
      statsCard={
        <span>
          Displaying {filteredDataPoints?.length.toLocaleString() || 0}{" "}
          Institutions
        </span>
      }
      filterMenus={filterMenus}
      layers={[columnLayer, arcLayer]}
      detailsCard={institution && <InstitutionCard institution={institution} />}
    />
  );
}
