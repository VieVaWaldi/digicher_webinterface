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
import useMinProjectBudgetFilter from "@/components/filter/useMinProjectBudgetFilter";
import {
  useInstitutionListView,
  useTopicNetworkListView,
} from "@/components/maplistview";
import { SelectedItem, ProjectPanelData } from "@/components/infopanel";

/** ToDo:
 * If performance becomes an issue, useMapViewInstitution and useMapViewCollaborationByTopic both run and get filtered always
 * Because of the 2 layers we have 2 different primary data sources in here: useMapViewInstitution for layer 1 and useMapViewCollaborationByTopic for layer 2*/
function CollaborationScenarioContent() {
  const { data, isPending, error } = useMapViewInstitution();
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<
    string | null
  >(null);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);

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

  /** Collaboration Network Data */

  const { data: collaborationNetwork } = useCollaborationNetworkById(
    selectedInstitutionId,
  );

  const filteredCollaborationNetwork = useMemo(() => {
    if (!collaborationNetwork?.length) return [];
    return collaborationNetwork.flatMap((p) => {
      if (!institutionSearchPredicate(p.institution_id)) return [];
      if (!institutionSearchPredicate(p.collaborator_id)) return [];
      if (!countryPredicate(p.collaborator_country)) return [];
      if (!typeAndSmePredicate(p.collaborator_type, p.collaborator_sme))
        return [];

      const matchingProjects = p.projects?.filter(
        (proj) =>
          topicPredicate(proj.project_id) &&
          projectSearchPredicate(proj.project_id) &&
          frameworkProgrammePredicate(proj.framework_programmes) &&
          yearRangePredicate(proj.start_date, proj.end_date),
      );
      if (!matchingProjects?.length) return [];

      return [{ ...p, projects: matchingProjects }];
    });
  }, [
    collaborationNetwork,
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
    data: topicCollaborationNetwork,
    isLoading: isTopicCollabLoading,
    error: topicCollabError,
  } = useMapViewCollaborationByTopic({
    topicIds: selectedTopics.map(String),
    subfieldIds: selectedSubfields,
    fieldIds: selectedFields,
  });

  const filteredTopicCollaborationNetwork = useMemo(() => {
    if (!topicCollaborationNetwork?.length) return [];
    return topicCollaborationNetwork.filter(
      (row) =>
        (!row.start_date ||
          !row.end_date ||
          yearRangePredicate(row.start_date, row.end_date)) &&
        projectSearchPredicate(row.project_id) &&
        countryPredicate(row.a_country) &&
        countryPredicate(row.b_country) &&
        frameworkProgrammePredicate(row.framework_programmes),
    );
  }, [
    topicCollaborationNetwork,
    yearRangePredicate,
    projectSearchPredicate,
    countryPredicate,
    frameworkProgrammePredicate,
  ]);

  /** Project Budget Filter – applies to both layers */

  const maxProjectBudget = useMemo(() => {
    const topicCosts = filteredTopicCollaborationNetwork
      .map((r) => r.total_cost)
      .filter((c): c is number => c !== null && c !== undefined);
    const collabCosts = filteredCollaborationNetwork.flatMap((p) =>
      (p.projects ?? [])
        .map((proj) => proj.total_cost)
        .filter((c): c is number => c !== null && c !== undefined),
    );
    const all = [...topicCosts, ...collabCosts];
    if (!all.length) return 1;
    return Math.ceil(all.reduce((max, c) => (c > max ? c : max), 0));
  }, [filteredTopicCollaborationNetwork, filteredCollaborationNetwork]);

  const { MinProjectBudgetFilter, budgetPredicate } = useMinProjectBudgetFilter(
    { maxBudget: maxProjectBudget },
  );

  const budgetFilteredTopicCollaborationNetwork = useMemo(
    () =>
      filteredTopicCollaborationNetwork.filter((row) =>
        budgetPredicate(row.total_cost),
      ),
    [filteredTopicCollaborationNetwork, budgetPredicate],
  );

  const budgetFilteredCollaborationNetwork = useMemo(
    () =>
      filteredCollaborationNetwork.flatMap((p) => {
        const matchingProjects = p.projects?.filter((proj) =>
          budgetPredicate(proj.total_cost),
        );
        if (!matchingProjects?.length) return [];
        return [{ ...p, projects: matchingProjects }];
      }),
    [filteredCollaborationNetwork, budgetPredicate],
  );

  /** Min Connections Filter (Topic layer only)
   * This filter needs to see all the data, so it cant just return a predicate
   * */

  const { MinConnectionsFilter, connectionFilteredData } =
    useMinConnectionsFilter({ data: budgetFilteredTopicCollaborationNetwork });

  /** List View */

  const flyToRef = useRef<((geo: number[]) => void) | null>(null);
  const handleFlyTo = useCallback(
    (geo: number[]) => flyToRef.current?.(geo),
    [],
  );
  const handleFlyToReady = useCallback((fn: (geo: number[]) => void) => {
    flyToRef.current = fn;
  }, []);

  const layer1List = useInstitutionListView(filteredData, {
    onFlyTo: handleFlyTo,
    onRowClick: (item) => {
      const geoGroup: GeoGroup = {
        geolocation: item.geolocation,
        institutions: [
          {
            institution_id: item.id,
            geolocation: item.geolocation,
            country_code: null,
            type: null,
            sme: null,
            projects: null,
          },
        ],
        count: 1,
      };
      setSelectedItem({ type: "grouped-institution", data: geoGroup });
      setInfoPanelOpen(true);
    },
  });
  const layer2List = useTopicNetworkListView(connectionFilteredData, {
    onFlyTo: handleFlyTo,
    onRowClick: (item) => {
      const geoGroup: GeoGroup = {
        geolocation: item.geolocation,
        institutions: [
          {
            institution_id: item.id,
            geolocation: item.geolocation,
            country_code: null,
            type: null,
            sme: null,
            projects: null,
          },
        ],
        count: 1,
      };
      setSelectedItem({ type: "grouped-institution", data: geoGroup });
      setInfoPanelOpen(true);
    },
  });
  const listContent =
    filterValues.activeLayerIndex === 0 ? layer1List : layer2List;

  /** UI Components */

  const totalProjects = useMemo(() => {
    if (!budgetFilteredCollaborationNetwork?.length) return 0;
    const seen = new Set<string>();
    for (const p of budgetFilteredCollaborationNetwork)
      for (const proj of p.projects ?? []) seen.add(proj.project_id);
    return seen.size;
  }, [budgetFilteredCollaborationNetwork]);

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
            {budgetFilteredCollaborationNetwork?.length.toLocaleString()}
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

      <FilterSection title="Network">
        {MinProjectBudgetFilter}
        {filterValues.activeLayerIndex === 1 && MinConnectionsFilter}
      </FilterSection>

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

  /** Update panel network data when filtered network changes */
  useEffect(() => {
    if (!selectedInstitutionId) return;
    setSelectedItem((prev) =>
      prev?.type === "collab-network" &&
      prev.institutionId === selectedInstitutionId
        ? { ...prev, network: filteredCollaborationNetwork }
        : prev,
    );
  }, [selectedInstitutionId, filteredCollaborationNetwork]);

  const handleMapOnClick = useCallback((info: any) => {
    if (info.object?.institutions?.length) {
      // Layer 1 — icon click
      const id = info.object.institutions[0].institution_id as string;
      setSelectedInstitutionId(id);
      setSelectedItem({ type: "collab-network", institutionId: id, network: null });
      setInfoPanelOpen(true);
    } else if (info.object?.projects) {
      // Layer 1 — arc click (MapViewCollaborationNetworkType)
      const projects: ProjectPanelData[] = (info.object.projects as {
        project_id: string;
        total_cost: number | null;
        start_date: string;
        end_date: string;
        framework_programmes: string[] | null;
      }[]).map((p) => ({
        project_id: p.project_id,
        total_cost: p.total_cost,
        start_date: p.start_date,
        end_date: p.end_date,
        framework_programmes: p.framework_programmes,
      }));
      setSelectedItem({ type: "project", projects });
      setInfoPanelOpen(true);
    }
  }, []);

  const handleLayer2Click = useCallback((info: any) => {
    if (info.object?.institutions?.length) {
      // Layer 2 — icon click (GeoGroup-like)
      setSelectedItem({ type: "grouped-institution", data: info.object as GeoGroup });
      setInfoPanelOpen(true);
    } else if (info.object?.project_id) {
      // Layer 2 — arc click (MapViewCollaborationByTopicType)
      const proj = info.object;
      const projects: ProjectPanelData[] = [
        {
          project_id: proj.project_id as string,
          total_cost: proj.total_cost ?? null,
          start_date: proj.start_date ?? null,
          end_date: proj.end_date ?? null,
          framework_programmes: proj.framework_programmes ?? null,
        },
      ];
      setSelectedItem({ type: "project", projects });
      setInfoPanelOpen(true);
    }
  }, []);

  const handleEmptyMapClick = useCallback(() => {
    setSelectedInstitutionId(null);
  }, []);

  /** Hover */

  type CollaborationHoverData =
    | { type: "icon"; group: GeoGroup }
    | {
        type: "arc";
        projects: { project_id: string; total_cost: number | null }[];
      }
    | { type: "topic-arc"; project_id: string; total_cost: number | null };

  const { hoverState, makeHoverHandler } =
    useMapHover<CollaborationHoverData>();

  const handleHover = useMemo(
    () =>
      makeHoverHandler((obj: any): CollaborationHoverData | null => {
        if (obj?.institutions) return { type: "icon", group: obj as GeoGroup };
        if (obj?.projects) return { type: "arc", projects: obj.projects };
        if (obj?.project_id)
          return {
            type: "topic-arc",
            project_id: obj.project_id,
            total_cost: obj.total_cost ?? null,
          };
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
    const inst = data?.find(
      (d) => d.institution_id === selectedInstitutionId,
    );
    return inst?.geolocation ?? undefined;
  }, [selectedInstitutionId, data]);

  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  /** URL persistence: sync selectedItem → URL sel param (skip initial mount) */
  const urlSyncMountedRef = useRef(false);
  useEffect(() => {
    if (!urlSyncMountedRef.current) {
      urlSyncMountedRef.current = true;
      return;
    }
    if (!selectedItem) {
      setters.setSelectionKey(null);
      return;
    }
    if (selectedItem.type === "grouped-institution") {
      setters.setSelectionKey(`gi:${selectedItem.data.geolocation.join(",")}`);
    } else if (selectedItem.type === "collab-network") {
      setters.setSelectionKey(`cn:${selectedItem.institutionId}`);
    } else if (selectedItem.type === "project" && selectedItem.projects.length > 0) {
      setters.setSelectionKey(`pr:${selectedItem.projects[0].project_id}`);
    }
  }, [selectedItem]); // eslint-disable-line react-hooks/exhaustive-deps

  /** URL initialization: restore selectedItem from URL sel param */
  const panelInitializedRef = useRef(false);
  useEffect(() => {
    if (panelInitializedRef.current || !filterValues.selectionKey) return;
    const colonIdx = filterValues.selectionKey.indexOf(":");
    const type = filterValues.selectionKey.slice(0, colonIdx);
    const id = filterValues.selectionKey.slice(colonIdx + 1);
    if (type === "cn") {
      panelInitializedRef.current = true;
      setSelectedInstitutionId(id);
      setSelectedItem({ type: "collab-network", institutionId: id, network: null });
      setInfoPanelOpen(true);
    } else if (type === "gi" && groupedData.length) {
      panelInitializedRef.current = true;
      const group = groupedData.find((g) => g.geolocation.join(",") === id);
      if (group) {
        setSelectedItem({ type: "grouped-institution", data: group });
        setInfoPanelOpen(true);
      }
    } else if (type === "pr") {
      panelInitializedRef.current = true;
      setSelectedItem({ type: "project", projects: [{ project_id: id }] });
      setInfoPanelOpen(true);
    }
  }, [filterValues.selectionKey, groupedData]); // eslint-disable-line react-hooks/exhaustive-deps

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
            networkData: budgetFilteredCollaborationNetwork,
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
            onClick: handleLayer2Click,
          }),
        ],
      },
    ],
    [
      groupedData,
      isDark,
      handleMapOnClick,
      handleHover,
      handleLayer2Click,
      budgetFilteredCollaborationNetwork,
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
        selectedItem={selectedItem}
        infoPanelOpen={infoPanelOpen}
        onInfoPanelClose={() => setInfoPanelOpen(false)}
        onInfoPanelOpen={() => setInfoPanelOpen(true)}
      />
      {hoverState && (
        <MapTooltip position={hoverState}>
          {hoverState.data.type === "arc" ? (
            <ArcTooltip projects={hoverState.data.projects} />
          ) : hoverState.data.type === "topic-arc" ? (
            <ArcProjectItem
              project_id={hoverState.data.project_id}
              total_cost={hoverState.data.total_cost}
            />
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
