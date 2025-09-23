"use client";

import { ArcLayer, ScatterplotLayer } from "@deck.gl/layers";
import BaseUI from "components/baseui/BaseUI";
import LeftSideFilters from "components/baseui/LeftSideFilterMenu";
import SelectedInfo from "components/baseui/SelectedEntity";
import { useTopicFilter } from "components/filter/useTopicFilter";
import useYearRangeFilter from "components/filter/useYearRangeFilter";
import InstitutionInfoPanel from "components/infoPanels/InstitutionInfoPanel";
import { PickingInfo } from "deck.gl";
import { baseLayerProps } from "deckgl/baseLayerProps";
import { INITIAL_VIEW_STATE_TILTED_EU } from "deckgl/viewports";
import { useInstitutionById } from "hooks/queries/institution/useInstitutionById";
import { useCollaborationsEnriched } from "hooks/queries/views/map/useMapViewCollaborationsEnriched";
import { ReactNode, useCallback, useMemo, useState } from "react";
import TitleContent from "./content";

export default function CollaborationScenario() {
  //   const { isGlobe } = useSettings();
  //   const COLOR_GAMMA = 0.7;
  //   const MAX_HEIGHT = isGlobe ? 4_000_000 : 1_000_000;
  //   const BAR_RADIUS = isGlobe ? 3_000 : 2_200;

  /** Main Data */
  const {
    data: mapViewCollaborations,
    isPending,
    error,
  } = useCollaborationsEnriched(); // loses projects not in map view
  //   const {
  //     data: mapViewCollaborations,
  //     isPending,
  //     error,
  //   } = useMapViewCollaborations();

  /** Center Selection UGH */
  const [showSelectedInfo, setSelectedInfo] = useState(false);

  const [selectedInstitutionId, setSelectedInstitutionId] = useState<
    string | null
  >(null);
  const { data: selectedInstitution, isPending: isPendingInstitution } =
    useInstitutionById(selectedInstitutionId || "", {
      enabled: !!selectedInstitutionId,
    });

  /** Hover State */
  //   const [hoverInfo, setHoverInfo] = useState<{
  //     x: number;
  //     y: number;
  //     weight: number;
  //     object: any;
  //   } | null>(null);

  /** Filters */
  const { YearRangeFilter, yearRangePredicate, minYear, maxYear } =
    useYearRangeFilter({
      defaultMinYear: 2020,
      defaultMaxYear: 2025,
    });
  const {
    TopicFilter,
    topicPredicate,
    getTopicColor,
    selectedDomains,
    selectedFields,
    selectedSubfields,
    selectedTopics,
  } = useTopicFilter("1206");

  const filteredDataView = useMemo(() => {
    if (!mapViewCollaborations?.length) return [];

    const filtered = mapViewCollaborations.filter((p) => {
      return (
        topicPredicate(p.project_id) &&
        //  institutionSearchPredicate(p.institution_id) &&
        //  projectSearchPredicate(p.project_id) &&
        //  frameworkProgrammePredicate(p.framework_programmes) &&
        yearRangePredicate(p.start_date, p.end_date)
        //  countryPredicate(p.country_code) &&
        //  typeAndSmePredicate(p.type, p.sme) &&
        //  nutsPredicate(p.nuts_0, p.nuts_1, p.nuts_2, p.nuts_3)
      );
    });

    if (filtered.length > 100000) {
      return filtered.slice(0, 100000);
    }

    return filtered;
  }, [
    mapViewCollaborations,
    //  showInstitutions,
    //  institutionSearchPredicate,
    //  projectSearchPredicate,
    //  frameworkProgrammePredicate,
    yearRangePredicate,
    //  countryPredicate,
    //  typeAndSmePredicate,
    //  nutsPredicate,
    topicPredicate,
  ]);

  /** Calculations */
  const uniqueInstitutions = useMemo(() => {
    if (!filteredDataView) return [];

    const institutionMap = new Map();

    filteredDataView
      .flatMap((collab) => [
        { id: collab?.a_institution_id, geolocation: collab?.a_geolocation },
        { id: collab?.b_institution_id, geolocation: collab?.b_geolocation },
      ])
      .forEach((inst) => {
        institutionMap.set(inst.id, inst);
      });

    return Array.from(institutionMap.values());
  }, [filteredDataView]);

  //   const MAX_COLLAB_WEIGHT = useMemo(() => {
  //     if (!collaborationView) return 0;
  //     return Math.max(...collaborationView.map((d) => d.collaboration_weight));
  //   }, [collaborationView]);

  /** Event Handlers */
  //   const handleMapOnClick = useCallback((info: any) => {
  //     const { object } = info;
  //     if (object && object.institution_id) {
  //       setSelectedInstitutionId(object.institution_id);
  //     }
  //   }, []);

  //   const handleEmptyMapClick = useCallback(() => {
  //     setSelectedInstitutionId(null);
  //   }, []);

  //   const handleHover = useCallback((info: PickingInfo) => {
  //     if (info.object) {
  //       setHoverInfo({
  //         x: info.x,
  //         y: info.y,
  //         weight: info.object.collaboration_weight,
  //         object: info.object,
  //       });
  //     } else {
  //       setHoverInfo(null);
  //     }
  //   }, []);

  /** Layers */
  //   const columnLayer = useMemo(() => {
  //     return new ColumnLayer({
  //       ...baseLayerProps,
  //       id: "collaboration-columns",
  //       data: collaborationView || [],
  //       diskResolution: 32,
  //       radius: BAR_RADIUS,
  //       getPosition: (d) => [d.geolocation[0], d.geolocation[1]],
  //       getElevation: (d) => {
  //         return (d.collaboration_weight / MAX_COLLAB_WEIGHT) * MAX_HEIGHT;
  //       },
  //       getFillColor: (d) => {
  //         const normalizedFunding = d.collaboration_weight / MAX_COLLAB_WEIGHT;
  //         const adjustedValue = Math.pow(normalizedFunding, COLOR_GAMMA);
  //         return [
  //           50 + (255 - 50) * adjustedValue,
  //           50 - 50 * adjustedValue,
  //           50 - 50 * adjustedValue,
  //           200,
  //         ];
  //       },
  //       pickable: true,
  //       autoHighlight: true,
  //       extruded: true,
  //       material: {
  //         ambient: 0.64,
  //         diffuse: 0.6,
  //         shininess: 32,
  //         specularColor: [51, 51, 51],
  //       },
  //       onClick: handleMapOnClick,
  //       onHover: handleHover,
  //       updateTriggers: {
  //         getPosition: collaborationView,
  //         getElevation: [collaborationView, MAX_COLLAB_WEIGHT],
  //         getFillColor: [collaborationView, MAX_COLLAB_WEIGHT],
  //       },
  //     });
  //   }, [
  //     collaborationView,
  //     MAX_COLLAB_WEIGHT,
  //     BAR_RADIUS,
  //     MAX_HEIGHT,
  //     handleMapOnClick,
  //     handleHover,
  //   ]);

  const handleScatterOnClick = useCallback(
    (info: PickingInfo) => {
      console.log(info.object);
      if (info.object?.id) {
        setSelectedInstitutionId(info.object.id);
        setSelectedInfo(true);
      }
    },
    [uniqueInstitutions],
  );

  const scatterLayer = useMemo(() => {
    return new ScatterplotLayer({
      ...baseLayerProps,
      id: "scatter-projects",
      data: uniqueInstitutions,
      getFillColor: [255, 140, 0],
      getPosition: (d) => d.geolocation,
      onClick: handleScatterOnClick,
      updateTriggers: {
        getPosition: uniqueInstitutions,
        getFillColor: uniqueInstitutions,
      },
    });
  }, [uniqueInstitutions, handleScatterOnClick]);

  const arcLayer = useMemo(() => {
    return new ArcLayer({
      id: "collaboration-arcs-all",
      data: filteredDataView,
      pickable: true,
      getSourcePosition: (c) => c.a_geolocation,
      getTargetPosition: (c) => c.b_geolocation,
      getSourceColor: (c) => getTopicColor(c.project_id),
      getTargetColor: (c) => getTopicColor(c.project_id),
      getWidth: 1,
      widthScale: 1,
      widthMinPixels: 0.5,
      updateTriggers: {
        getSourcePosition: filteredDataView,
        getTargetPosition: filteredDataView,
      },
    });
  }, [filteredDataView]);

  /** Hover Tooltip */
  //   const hoverTooltip = hoverInfo && (
  //     <div
  //       style={{
  //         position: "absolute",
  //         pointerEvents: "none",
  //         left: hoverInfo.x,
  //         top: hoverInfo.y,
  //         backgroundColor: "rgba(0, 0, 0, 0.8)",
  //         color: "#fff",
  //         padding: "8px",
  //         borderRadius: "4px",
  //         transform: "translate(-50%, -100%)",
  //         marginTop: "-15px",
  //         zIndex: 1000,
  //       }}
  //     >
  //       <div>Total Collaborators: {hoverInfo.weight}</div>
  //     </div>
  //   );

  const isLoading = isPending;

  const filters: ReactNode = (
    <div className="space-y-6">
      {YearRangeFilter}
      {TopicFilter}
      {/* {TypeAndSmeFilter}
        {InstitutionSearchFilter}
        {ProjectSearchFilter}
        {CountryFilter}
        {FrameworkProgrammeFilter}
        {NutsFilter} */}
    </div>
  );

  return (
    <div onClick={() => setSelectedInfo(false)}>
      <SelectedInfo show={showSelectedInfo} setSelectedInfo={setSelectedInfo}>
        <InstitutionInfoPanel institution_id={selectedInstitutionId} />
      </SelectedInfo>
      <LeftSideFilters>{filters}</LeftSideFilters>
      <BaseUI
        layers={[arcLayer, scatterLayer]} // columnLayer
        viewState={INITIAL_VIEW_STATE_TILTED_EU}
        titleContent={
          <TitleContent
            institutionCount={uniqueInstitutions.length}
            connectionsCount={filteredDataView?.length || 0}
          />
        }
        infoBoxContent={null}
        loading={isLoading}
        scenarioName="collaboration"
        scenarioTitle="Collaboration"
        error={error}
      />
      {/* {hoverTooltip} */}
    </div>
  );
}
