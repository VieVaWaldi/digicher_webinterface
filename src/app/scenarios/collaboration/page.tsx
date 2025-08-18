"use client";

import React, { ReactNode, useMemo, useState } from "react";

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
import { PickingInfo } from "deck.gl";
import { H3 } from "shadcn/typography";
import { useInstitutionsByIds } from "core/hooks/queries/institution/useInstitutionsByIds";
import useSearchComponent from "components/menus/filter/SearchFilterPaginated";
import { useInstitutionsByName } from "core/hooks/queries/institution/useInstitutionByName";
import { Navigation } from "components/navigation/Navigation";

export default function CollaborationScenario() {
  const id: string = "collaboration";

  const { isGlobe } = useSettings();
  const COLOR_GAMMA = 0.7;
  const MAX_HEIGHT = isGlobe ? 5_000_000 : 800_000;
  const BAR_RADIUS = isGlobe ? 3_500 : 700;

  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    weight: number;
    object: InstitutionCollaborationWeights | null;
  } | null>(null);

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
  const { data: selectedInstitution } = useInstitutionById(
    selectedInstitutionId ?? -1,
  );

  const { data: collaborationPartners } = useCollaborationInstitutionsById(
    selectedInstitutionId,
  );
  const { data: transformedCollaborationPartners } = useTransformInstitutions(
    collaborationPartners,
  );

  /** Progressive Enhancement */

  const dataPoints = transformedPoints ?? collaborationPoints;
  const collaboratorPartners =
    transformedCollaborationPartners ?? collaborationPartners;

  /** Filter */

  const { CountryFilter, countryPredicate } = useCountryFilter();
  const { TopicFilter, topicPredicate } = useTopicFilter();
  const { FundingProgrammeFilter, fundingProgrammePredicate } =
    useFundingProgrammeFilter();

  const { PaginatedResults, searchPredicate } = useSearchComponent({
    useSearchHook: useInstitutionsByName,
    idField: "institution_id",
    displayField: "name",
    searchLabel: "Institution Search",
    placeholderText: "Search institutions for name ...",
    idPredicate: "institution_id",
  });

  const filteredDataPoints = dataPoints?.filter((point) => {
    return (
      countryPredicate(point) &&
      topicPredicate(point) &&
      fundingProgrammePredicate(point) &&
      searchPredicate(point)
    );
  });

  const filteredCollaboratorPartners = useMemo(() => {
    return (
      collaboratorPartners?.filter((point) => {
        return (
          countryPredicate(point) &&
          topicPredicate(point) &&
          fundingProgrammePredicate(point) &&
          searchPredicate(point)
        );
      }) ?? []
    );
  }, [
    collaboratorPartners,
    countryPredicate,
    topicPredicate,
    fundingProgrammePredicate,
    searchPredicate,
  ]);

  const partnerIds = selectedInstitution
    ? (filteredCollaboratorPartners?.map((p) => p.institution_id ?? -1) ?? [])
    : [];
  const { data: institutionPartners } = useInstitutionsByIds(
    partnerIds.slice(0, 10),
  );

  const partnersArcData = useMemo(() => {
    if (
      !selectedInstitutionLocation ||
      !filteredCollaboratorPartners ||
      !Array.isArray(filteredCollaboratorPartners)
    ) {
      return [];
    }

    return filteredCollaboratorPartners.map((partner) => ({
      sourcePosition: selectedInstitutionLocation,
      targetPosition: [partner.geolocation[1], partner.geolocation[0]],
      partner: partner,
    }));
  }, [selectedInstitutionLocation, filteredCollaboratorPartners]);

  /** Calculations */

  const MAX_COLLAB_WEIGHT = React.useMemo(() => {
    if (!collaborationPoints) return 0;
    return Math.max(...collaborationPoints.map((d) => d.collaboration_weight));
  }, [collaborationPoints]);

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
    onHover: (info: PickingInfo) => {
      if (info.object) {
        setHoverInfo({
          x: info.x,
          y: info.y,
          weight: info.object.collaboration_weight,
          object: info.object as InstitutionCollaborationWeights,
        });
      } else {
        setHoverInfo(null);
      }
    },
  });

  const arcLayer = new ArcLayer({
    id: "collaboration-arcs",
    data: partnersArcData,
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

  const infoPanel = (
    <>
      {selectedInstitution && (
        <div>
          <InstitutionInfoPanel institution={selectedInstitution} />
          {filteredCollaboratorPartners?.length > 0 ? (
            <>
              <H3 className="p-2 text-center">
                displaying {institutionPartners?.length || 0} of{" "}
                {filteredCollaboratorPartners?.length} Partners
              </H3>
              {institutionPartners?.map((partner) => (
                <InstitutionInfoPanel
                  key={partner.institution_id}
                  institution={partner}
                />
              ))}
            </>
          ) : (
            <H3 className="p-2 text-center">No partners found</H3>
          )}
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
      <div>* Total Collaborators: {hoverInfo?.weight ?? -1}</div>
    </div>
  );

  return (
    <div className="md:pt-12">
      <Navigation />
      <ScenarioTemplate
        id={id}
        title="Collaboration Map WIP"
        description="This scenario depicts each institution as a bar, with height indicating the total number of unique project partners across all projects. When you click on an institution, its network of partners is displayed. While filters affect which connections are visible in the current view, the bar heights always represent the institution's complete collaboration count regardless of filters. The 'Displaying X Institutions with Y connections' counter shows only the currently visible subset based on applied filters."
        statsCard={
          <span>
            Displaying{" "}
            <span className="font-semibold text-orange-400">
              {filteredDataPoints?.length.toLocaleString() || 0}
            </span>{" "}
            Institutions{" "}
            {partnersArcData.length !== 0 && (
              <>
                with{" "}
                <span className="font-semibold text-orange-400">
                  {partnersArcData.length}
                </span>{" "}
                connections
              </>
            )}
          </span>
        }
        filterMenus={filterMenus}
        dataMenu={PaginatedResults}
        infoPanel={infoPanel}
        layers={[columnLayer, arcLayer]}
        hoverTooltip={hoverInfoComponent}
        viewState={INITIAL_VIEW_STATE_TILTED_EU}
        isLoading={loading}
        error={error}
        onEmptyMapClick={() => {
          setSelectedInstitutionId(-1);
          setSelectedInstitutionLocation(null);
        }}
      />
    </div>
  );
}
