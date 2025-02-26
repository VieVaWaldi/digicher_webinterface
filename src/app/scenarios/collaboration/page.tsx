"use client";

import React, { ReactNode, useState } from "react";

import { baseLayerProps } from "deckgl/baseLayerProps";
import { ArcLayer, ColumnLayer } from "@deck.gl/layers";
import { INITIAL_VIEW_STATE_TILTED_EU } from "deckgl/viewports";
import useTopicFilter from "components/menus/filter/TopicFilter";
import ScenarioTemplate from "components/scenarios/ScenarioTemplate";
import useCountryFilter from "components/menus/filter/CountryFilter";
import InstitutionInfoPanel from "components/infoPanels/InstitutionInfoPanel";
import { InstitutionCollaborationWeights } from "datamodel/scenario_points/types";
import useTransformInstitutions from "core/hooks/transform/useTransformInstitutions";
import { useInstitutionById } from "core/hooks/queries/institution/useInstitutionById";
import useFundingProgrammeFilter from "components/menus/filter/FundingProgrammeFilter";
import { useCollaborationWeightPoints } from "core/hooks/queries/scenario_points/useCollaborationWeightPoints";
import { useCollaborationInstitutionsById } from "core/hooks/queries/scenario_points/useCollaborationInstitutionsById";
import { useSettings } from "core/context/SettingsContext";

export default function CollaborationScenario() {
  const id: string = "collaboration";

  const { isGlobe } = useSettings();
  const COLOR_GAMMA = 0.7;
  const MAX_HEIGHT = isGlobe ? 5_000_000 : 800_000;
  const BAR_RADIUS = isGlobe ? 3_500 : 700;

  /** Data */

  const {
    data: collaborationPoints,
    error,
    loading,
  } = useCollaborationWeightPoints();
  const { data: transformedPoints } =
    useTransformInstitutions(collaborationPoints);

  const [selectedInstitutionId, setSelectedInstitutionId] =
    useState<number>(-1);
  const [selectedInstitutionLocation, setSelectedInstitutionLocation] =
    useState<number[] | null>(null);

  const { data: institutionCollaboratorsOmg } =
    useCollaborationInstitutionsById(selectedInstitutionId);
  const { data: transformedPoints2 } = useTransformInstitutions(
    institutionCollaboratorsOmg,
  );

  const { data: institution } = useInstitutionById(selectedInstitutionId ?? -1);

  /** Progressive Enhancement */

  const dataPoints = transformedPoints ?? collaborationPoints;
  const institutionCollaborators =
    transformedPoints2 ?? institutionCollaboratorsOmg;

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

  const filteredDataPointsOmg = institutionCollaborators?.filter((point) => {
    return (
      countryPredicate(point) &&
      topicPredicate(point) &&
      fundingProgrammePredicate(point)
    );
  });

  const arcData = React.useMemo(() => {
    if (
      !selectedInstitutionLocation ||
      !filteredDataPointsOmg ||
      !Array.isArray(filteredDataPointsOmg)
    ) {
      return [];
    }

    return filteredDataPointsOmg.map((collaborator) => ({
      sourcePosition: selectedInstitutionLocation,
      targetPosition: [
        collaborator.geolocation[1],
        collaborator.geolocation[0],
      ],
      collaborator: collaborator,
    }));
  }, [selectedInstitutionLocation, filteredDataPointsOmg]);

  /** Calculations */

  const MAX_COLLAB_WEIGHT = React.useMemo(() => {
    if (!filteredDataPoints) return 0;
    return Math.max(...filteredDataPoints.map((d) => d.collaboration_weight));
  }, [filteredDataPoints]);

  /** Layer */

  const columnLayer = new ColumnLayer<InstitutionCollaborationWeights>({
    ...baseLayerProps,
    id: `column-${id}`,
    data: filteredDataPoints || [],
    diskResolution: 32,
    radius: BAR_RADIUS,
    getPosition: (d) => [d.geolocation[1], d.geolocation[0]],
    getElevation: (d) => {
      return (d.collaboration_weight / MAX_COLLAB_WEIGHT) * MAX_HEIGHT;
    },
    getFillColor: (d) => {
      const normalizedFunding = d.collaboration_weight / MAX_COLLAB_WEIGHT;
      const adjustedValue = Math.pow(normalizedFunding, COLOR_GAMMA);
      return [
        50 + (255 - 50) * adjustedValue,
        50 - 50 * adjustedValue,
        50 - 50 * adjustedValue,
        200,
      ];
    },
    pickable: true,
    autoHighlight: true,
    extruded: true,
    material: {
      ambient: 0.64,
      diffuse: 0.6,
      shininess: 32,
      specularColor: [51, 51, 51],
    },
    onClick: (info) => {
      const { object } = info;
      if (info.object) {
        setSelectedInstitutionId(object.institution_id);
        setSelectedInstitutionLocation([
          object.geolocation[1],
          object.geolocation[0],
        ]);
      }
    },
  });

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

  /** Commponents */

  const filterMenus: ReactNode[] = [
    <CountryFilter key="country-filter" />,
    <FundingProgrammeFilter key="funding-filter" />,
    <TopicFilter key="topic-filter" />,
  ];

  return (
    <ScenarioTemplate
      id={id}
      title="Collaboration Map"
      description="Collaboration weights values dont change with the filters!"
      statsCard={
        <span>
          Displaying{" "}
          <span className="font-semibold text-orange-400">
            {filteredDataPoints?.length.toLocaleString() || 0}
          </span>{" "}
          Institutions{" "}
          {arcData.length !== 0 && (
            <>
              with{" "}
              <span className="font-semibold text-orange-400">
                {arcData.length}
              </span>{" "}
              connections
            </>
          )}
        </span>
      }
      filterMenus={filterMenus}
      infoPanel={
        institution && <InstitutionInfoPanel institution={institution} />
      }
      layers={[columnLayer, arcLayer]}
      viewState={INITIAL_VIEW_STATE_TILTED_EU}
      isLoading={loading}
      error={error}
      onEmptyMapClick={() => {
        setSelectedInstitutionId(-1);
        setSelectedInstitutionLocation(null);
      }}
    />
  );
}
