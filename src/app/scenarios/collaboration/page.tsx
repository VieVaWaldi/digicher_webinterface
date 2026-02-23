"use client";

import MapController from "@/components/deckgl/MapController";
import { useTopicFilter } from "components/filter/useTopicFilter";
import usePlayYearFilter from "components/filter/usePlayYearFilter";
import { INITIAL_VIEW_STATE_TILTED_EU } from "@/components/deckgl/viewports";
import {
  ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useCountryFilter from "@/components/filter/useCountryFilter";
import { useFilters } from "@/hooks/persistence/useFilters";
import { useDebouncedCallback } from "use-debounce";
import { useMapViewInstitution } from "@/hooks/queries/views/map/useMapViewInstitution";
import useTypeAndSmeFilter from "@/components/filter/useTypeAndSmeFilter";
import { FilterSection, useUnifiedSearchFilter } from "@/components/mui";
import { ENTITY_OPTIONS } from "@/components/mui/SearchBar";
import useFrameworkProgrammeFilter from "@/components/filter/useFrameworkProgrammeFilter";
import { Box, Typography, useTheme } from "@mui/material";
import { GeoGroup, groupByGeolocation } from "@/app/scenarios/scenario_data";
import { LayerConfig } from "@/components/mui/LayerSwitcher";
import { CollaborationNetworkLayer } from "@/components/deckgl/layers/CollaborationNetworkLayer";
import { TopicNetworkLayer } from "@/components/deckgl/layers/TopicNetworkLayer";
import { useCollaborationNetworkById } from "@/hooks/queries/collaboration/useCollaborationNetworkById";
import { useMapViewCollaborationByTopic } from "@/hooks/queries/views/map/useMapViewCollaborationByTopic";
import { useMapHover } from "@/components/deckgl/hover/useMapHover";
import { MapTooltip } from "@/components/deckgl/hover/MapTooltip";
import { GeoGroupTooltip } from "@/components/deckgl/hover/GeoGroupTooltip";
import { ArcTooltip } from "@/components/deckgl/hover/ArcTooltip";
import { ArcProjectItem } from "@/components/deckgl/hover/ArcProjectItem";
import useMinConnectionsFilter from "@/components/filter/useMinConnectionsFilter";
import {
  useInstitutionListView,
  useTopicNetworkListView,
} from "@/components/maplistview";

/** ToDo:
 * If performance becomes an issue, useMapViewInstitution and useMapViewCollaborationByTopic both run and get filtered always
 * Because of the 2 layers we have 2 different primary data sources in here: useMapViewInstitution for layer 1 and useMapViewCollaborationByTopic for layer 2*/
function CollaborationScenarioContent() {
  const { data, isPending, error } = useMapViewInstitution();

  const [selectedInstitutionId, setSelectedInstitutionId] = useState<
    string | null
  >(null);

  const { data: networkData } = useCollaborationNetworkById(
    selectedInstitutionId,
  );

  /** URL Filter State */

  const { filters: filterValues, setters, resetAll } = useFilters();

  const debouncedSetYearRange = useDebouncedCallback(setters.setYearRange, 300);
  const debouncedSetViewState = useDebouncedCallback(setters.setViewState, 300);
  const { YearRangeFilter, yearRangePredicate } = usePlayYearFilter({
    initialValue: filterValues.yearRange,
    onChange: debouncedSetYearRange,
  });
  const { CountryFilter, countryPredicate } = useCountryFilter({
    initialValue: filterValues.countries,
    onChange: setters.setCountries,
  });
  const { TypeAndSmeFilter, typeAndSmePredicate } = useTypeAndSmeFilter({
    initialValue: filterValues.typeAndSme,
    onChange: setters.setTypeAndSme,
  });
  const {
    SearchFilter,
    institutionSearchPredicate,
    projectSearchPredicate,
    MinorityGroupsFilter,
  } = useUnifiedSearchFilter({
    entityOptions: ENTITY_OPTIONS,
    defaultEntity: "projects",
    initialEntity: filterValues.unifiedSearch.entity,
    initialQuery: filterValues.unifiedSearch.query,
    initialMinorityGroups: filterValues.unifiedSearch.minorityGroups,
    onEntityChange: setters.setEntity,
    onQueryChange: setters.setQuery,
    onMinorityGroupsChange: setters.setMinorityGroups,
  });
  const { FrameworkProgrammeFilter, frameworkProgrammePredicate } =
    useFrameworkProgrammeFilter({
      initialValue: filterValues.frameworkProgrammes,
      onChange: setters.setFrameworkProgrammes,
    });
  const {
    TopicFilter,
    topicPredicate,
    getTopicColor,
    selectedFields,
    selectedSubfields,
    selectedTopics,
  } = useTopicFilter({
    initialFields: filterValues.topicFields,
    initialSubfields: filterValues.topicSubfields,
    initialTopics: filterValues.topicTopics,
    onFieldsChange: setters.setTopicFields,
    onSubfieldsChange: setters.setTopicSubfields,
    onTopicsChange: setters.setTopicTopics,
  });

  /** Apply Filters */

  const filteredData = useMemo(() => {
    if (!data?.length) return [];
    return data.flatMap((p) => {
      if (!institutionSearchPredicate(p.institution_id)) return [];
      if (!countryPredicate(p.country_code)) return [];
      if (!typeAndSmePredicate(p.type, p.sme)) return [];

      const matchingProjects = p.projects?.filter(
        (proj) =>
          topicPredicate(proj.id) &&
          projectSearchPredicate(proj.id) &&
          frameworkProgrammePredicate(proj.framework_programmes) &&
          yearRangePredicate(proj.start, proj.end),
      );
      if (!matchingProjects?.length) return [];

      return [{ ...p, projects: matchingProjects }];
    });
  }, [
    data,
    institutionSearchPredicate,
    countryPredicate,
    typeAndSmePredicate,
    topicPredicate,
    projectSearchPredicate,
    frameworkProgrammePredicate,
    yearRangePredicate,
  ]);

  /** Topic Network Data */

  const {
    data: topicCollabData,
    isLoading: isTopicCollabLoading,
    error: topicCollabError,
  } = useMapViewCollaborationByTopic({
    topicIds: selectedTopics.map(String),
    subfieldIds: selectedSubfields,
    fieldIds: selectedFields,
  });

  const filteredTopicCollabData = useMemo(() => {
    if (!topicCollabData?.length) return [];
    return topicCollabData.filter(
      (row) =>
        (!row.start_date ||
          !row.end_date ||
          yearRangePredicate(row.start_date, row.end_date)) &&
        countryPredicate(row.a_country) &&
        countryPredicate(row.b_country) &&
        frameworkProgrammePredicate(row.framework_programmes),
    );
  }, [
    topicCollabData,
    yearRangePredicate,
    countryPredicate,
    frameworkProgrammePredicate,
  ]);

  /** Min Connections Filter (Topic layer only) */

  /** ToDo: Refactor this to the style of the other filters with predicates */

  const { MinConnectionsFilter, connectionFilteredData } =
    useMinConnectionsFilter({ data: filteredTopicCollabData });

  /** List View */

  const flyToRef = useRef<((geo: number[]) => void) | null>(null);
  const handleFlyTo = useCallback((geo: number[]) => flyToRef.current?.(geo), []);
  const handleFlyToReady = useCallback((fn: (geo: number[]) => void) => {
    flyToRef.current = fn;
  }, []);

  const layer1List = useInstitutionListView(filteredData, {
    onFlyTo: handleFlyTo,
  });
  const layer2List = useTopicNetworkListView(connectionFilteredData, {
    onFlyTo: handleFlyTo,
  });
  const listContent =
    filterValues.activeLayerIndex === 0 ? layer1List : layer2List;

  /** UI Components */

  const totalProjects = useMemo(() => {
    if (!networkData?.length) return 0;
    const seen = new Set<string>();
    for (const p of networkData)
      for (const proj of p.projects ?? []) seen.add(proj.project_id);
    return seen.size;
  }, [networkData]);

  const hasSelectedTopic =
    selectedTopics.length > 0 ||
    selectedSubfields.length > 0 ||
    selectedFields.length > 0;

  const Title: ReactNode = (
    <Typography
      variant="h5"
      color="text.secondary"
      sx={{ textAlign: "center", mt: 1 }}
    >
      {filterValues.activeLayerIndex === 0 && !selectedInstitutionId && (
        <Box component="span" sx={{ color: "warning.main" }}>
          Click on an institution to see its network
        </Box>
      )}
      {filterValues.activeLayerIndex === 1 && !hasSelectedTopic && (
        <Box component="span" sx={{ color: "warning.main" }}>
          Please select a topic in Filter
        </Box>
      )}
      {filterValues.activeLayerIndex === 0 && selectedInstitutionId && (
        <>
          Displaying{" "}
          <Box
            component="span"
            sx={{ color: "secondary.main", fontWeight: 500 }}
          >
            {networkData?.length.toLocaleString()}
          </Box>{" "}
          collaborations across{" "}
          <Box
            component="span"
            sx={{ color: "secondary.main", fontWeight: 500 }}
          >
            {totalProjects.toLocaleString()}
          </Box>{" "}
          projects
        </>
      )}
      {filterValues.activeLayerIndex === 1 && hasSelectedTopic && (
        <>
          Displaying{" "}
          <Box
            component="span"
            sx={{ color: "secondary.main", fontWeight: 500 }}
          >
            {connectionFilteredData.length.toLocaleString()}
          </Box>{" "}
          project collaborations
        </>
      )}
    </Typography>
  );

  const Filters: ReactNode = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <FilterSection showDivider={false}>{SearchFilter}</FilterSection>

      {filterValues.activeLayerIndex === 1 && (
        <FilterSection title="Network">{MinConnectionsFilter}</FilterSection>
      )}

      <FilterSection title="Project Time" showDivider={true}>
        {YearRangeFilter}
      </FilterSection>

      <FilterSection title="Geographic & Demographic">
        {CountryFilter}
        {MinorityGroupsFilter}
      </FilterSection>

      <FilterSection title="Institutional">
        {TypeAndSmeFilter}
        {FrameworkProgrammeFilter}
      </FilterSection>

      <FilterSection title="Topics">{TopicFilter}</FilterSection>
    </Box>
  );

  /** Calculations */

  /** ToDo: A Layer that shows highest collaborator would be cool */

  //   const MAX_COLLAB_WEIGHT = useMemo(() => {
  //     if (!collaborationView) return 0;
  //     return Math.max(...collaborationView.scenarios((d) => d.collaboration_weight));
  //   }, [collaborationView]);

  /** Event Handlers */

  useEffect(() => {
    /** We treate this as the onClick for the institution network */
    if (networkData) {
      /** ToDo: This is where we open the InfoPanel from */
      console.log("Network data:", networkData);
    }
  }, [networkData]);

  const handleMapOnClick = useCallback((info: any) => {
    if (info.object?.institutions?.length) {
      setSelectedInstitutionId(info.object.institutions[0].institution_id);
    }
  }, []);

  const handleEmptyMapClick = useCallback(() => {
    setSelectedInstitutionId(null);
  }, []);

  /** Hover */

  type CollaborationHoverData =
    | { type: "icon"; group: GeoGroup }
    | { type: "arc"; projects: { project_id: string; total_cost: number | null }[] }
    | { type: "topic-arc"; project_id: string; total_cost: number | null };

  const { hoverState, makeHoverHandler } = useMapHover<CollaborationHoverData>();

  const handleHover = useMemo(
    () =>
      makeHoverHandler((obj: any): CollaborationHoverData | null => {
        if (obj?.institutions) return { type: "icon", group: obj as GeoGroup };
        if (obj?.projects) return { type: "arc", projects: obj.projects };
        if (obj?.project_id) return { type: "topic-arc", project_id: obj.project_id, total_cost: obj.total_cost ?? null };
        return null;
      }),
    [makeHoverHandler],
  );

  /** Layers */

  const groupedData = useMemo(
    () => groupByGeolocation(filteredData),
    [filteredData],
  );

  const sourcePosition = useMemo(() => {
    if (!selectedInstitutionId) return undefined;
    const inst = filteredData.find(
      (d) => d.institution_id === selectedInstitutionId,
    );
    return inst?.geolocation ?? undefined;
  }, [selectedInstitutionId, filteredData]);

  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const layerConfigs: LayerConfig[] = useMemo(
    () => [
      {
        id: "individual-icons",
        title: "Individual",
        description: "Click on an institution to reveal its network",
        previewImage: "/images/settings/mapbox-dark.png",
        createLayers: () => [
          new CollaborationNetworkLayer({
            id: "collaboration-network",
            data: groupedData,
            isDark,
            onClick: handleMapOnClick,
            onHover: handleHover,
            getTopicColor,
            networkData,
            sourcePosition,
          }),
        ],
      },
      {
        id: "topic-network",
        title: "Topic",
        description: "Select a topic to shows its collaboration network",
        previewImage: "/images/settings/mapbox-dark.png",
        createLayers: () => [
          new TopicNetworkLayer({
            id: "topic-network-layer",
            data: connectionFilteredData,
            isDark,
            getTopicColor,
            onHover: handleHover,
          }),
        ],
      },
    ],
    [
      groupedData,
      isDark,
      handleMapOnClick,
      handleHover,
      networkData,
      sourcePosition,
      connectionFilteredData,
      getTopicColor,
    ],
  );

  return (
    <>
      <MapController
        layerConfigs={layerConfigs}
        activeLayerIndex={filterValues.activeLayerIndex}
        onLayerChange={setters.setActiveLayerIndex}
        title={Title}
        search={SearchFilter}
        filters={Filters}
        defaultViewState={INITIAL_VIEW_STATE_TILTED_EU}
        initialViewState={filterValues.viewState}
        onViewStateChange={debouncedSetViewState}
        onResetAll={resetAll}
        loading={isPending || isTopicCollabLoading}
        error={error || topicCollabError}
        onEmptyMapClick={handleEmptyMapClick}
        scenarioName="collaboration"
        scenarioTitle="Collaboration"
        listContent={listContent}
        onFlyToReady={handleFlyToReady}
      />
      {hoverState && (
        <MapTooltip position={hoverState}>
          {hoverState.data.type === "arc" ? (
            <ArcTooltip projects={hoverState.data.projects} />
          ) : hoverState.data.type === "topic-arc" ? (
            <ArcProjectItem project_id={hoverState.data.project_id} total_cost={hoverState.data.total_cost} />
          ) : (
            <GeoGroupTooltip group={hoverState.data.group} />
          )}
        </MapTooltip>
      )}
    </>
  );
}

export default function CollaborationScenario() {
  return (
    <Suspense>
      <CollaborationScenarioContent />
    </Suspense>
  );
}
