"use client";

import MapController from "@/components/deckgl/MapController";
import { FilterSection } from "components/mui";
import { useMapViewInstitution } from "hooks/queries/views/map/useMapViewInstitution";
import {
  ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useScenarioFilters } from "@/hooks/scenarios/useScenarioFilters";
import { useFilteredMapViewInstitutions } from "@/hooks/scenarios/useFilteredMapViewInstitutions";
import { INITIAL_VIEW_STATE_EU } from "@/components/deckgl/viewports";
import { Box, Typography, useTheme } from "@mui/material";
import { useFilters } from "@/hooks/persistence/useFilters";
import { useDebouncedCallback } from "use-debounce";
import { GroupedIconLayer } from "@/components/deckgl/layers/GroupedIconLayer";
import { LayerConfig } from "@/components/mui/LayerSwitcher";
import { GeoGroup, groupByGeolocation } from "@/app/scenarios/scenario_data";
import { useMapHover } from "@/components/deckgl/hover/useMapHover";
import { MapTooltip } from "@/components/deckgl/hover/MapTooltip";
import { GeoGroupTooltip } from "@/components/deckgl/hover/GeoGroupTooltip";
import { useInstitutionListView } from "@/components/maplistview";
import { SelectedItem } from "@/components/infopanel";

function ExploreScenarioContent() {
  const { data, isPending, error } = useMapViewInstitution();
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);

  /** Filters */

  const { filters: filterValues, setters, resetAll, toQueryString, toListQueryString } = useFilters();

  const debouncedSetViewState = useDebouncedCallback(setters.setViewState, 300);

  const handleInstitutionSelect = useCallback(
    (id: string, geolocation: number[]) => {
      setSelectedItem({ type: "grouped-institution", geolocation, institutionIds: [id] });
      setInfoPanelOpen(true);
    },
    [],
  );

  const {
    YearRangeFilter,
    CountryFilter,
    TypeAndSmeFilter,
    SearchFilter,
    MinorityGroupsFilter,
    FrameworkProgrammeFilter,
    TopicFilter,
    yearRangePredicate,
    countryPredicate,
    typeAndSmePredicate,
    institutionSearchPredicate,
    projectSearchPredicate,
    frameworkProgrammePredicate,
    topicPredicate,
    selectedCountries,
  } = useScenarioFilters(filterValues, setters, { onInstitutionSelect: handleInstitutionSelect });

  /** Apply Filters */

  const { filteredData, isFilterPending } = useFilteredMapViewInstitutions(
    data,
    {
      selectedCountries,
      institutionSearchPredicate,
      typeAndSmePredicate,
      topicPredicate,
      projectSearchPredicate,
      frameworkProgrammePredicate,
      yearRangePredicate,
    },
  );

  /** UI Components */

  const totalProjects = useMemo(() => {
    const seen = new Set<string>();
    for (const p of filteredData)
      for (const proj of p.projects ?? []) seen.add(proj.id);
    return seen.size;
  }, [filteredData]);

  const Title: ReactNode = (
    <Typography
      variant="h5"
      color="text.secondary"
      sx={{ textAlign: "center", mt: 1 }}
    >
      Displaying{" "}
      <Box component="span" sx={{ color: "secondary.main", fontWeight: 500 }}>
        {filteredData?.length.toLocaleString()}
      </Box>{" "}
      institutions &{" "}
      <Box component="span" sx={{ color: "secondary.main", fontWeight: 500 }}>
        {totalProjects.toLocaleString()}
      </Box>{" "}
      projects
    </Typography>
  );

  const Filters: ReactNode = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <FilterSection showDivider={false}>{Title}</FilterSection>
      <FilterSection showDivider={false}>{SearchFilter}</FilterSection>

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

  /** List View */

  /** ToDo: Currently unused but can be reused later for real MapListView */
  const flyToRef = useRef<((geo: number[]) => void) | null>(null);
  const handleFlyTo = useCallback(
    (geo: number[]) => flyToRef.current?.(geo),
    [],
  );
  const handleFlyToReady = useCallback((fn: (geo: number[]) => void) => {
    flyToRef.current = fn;
  }, []);

  /** ToDo: Remove this for a normal paginated list view table? */
  // const listContent = useInstitutionListView(filteredData, {
  //   onFlyTo: handleFlyTo,
  //   onRowClick: (item) => {
  //     setSelectedItem({
  //       type: "grouped-institution",
  //       geolocation: item.geolocation,
  //       institutionIds: [item.id],
  //     });
  //     setInfoPanelOpen(true);
  //   },
  // });

  /** Event Handlers */

  const handleMapOnClick = useCallback((info: any) => {
    if (info.object?.institutions) {
      const group = info.object as GeoGroup;
      setSelectedItem({
        type: "grouped-institution",
        geolocation: group.geolocation,
        institutionIds: group.institutions.map((i) => i.institution_id),
      });
      setInfoPanelOpen(true);
    }
  }, []);

  /** Hover */

  const { hoverState, makeHoverHandler } = useMapHover<GeoGroup>();

  const handleIconHover = useMemo(
    () =>
      makeHoverHandler((obj: any): GeoGroup | null => {
        if (!obj?.institutions) return null;
        return obj as GeoGroup;
      }),
    [makeHoverHandler],
  );

  /** Layer */

  const groupedData = useMemo(
    () => groupByGeolocation(filteredData),
    [filteredData],
  );

  /** Derive live GeoGroup from current filteredData for the selected item */
  const selectedGeoGroup = useMemo((): GeoGroup | null => {
    if (!selectedItem || selectedItem.type !== "grouped-institution")
      return null;
    const instMap = new Map(filteredData.map((i) => [i.institution_id, i]));
    const institutions = selectedItem.institutionIds.map(
      (id) =>
        instMap.get(id) ?? {
          institution_id: id,
          geolocation: selectedItem.geolocation,
          country_code: null,
          type: null,
          sme: null,
          projects: null,
        },
    );
    return {
      geolocation: selectedItem.geolocation,
      institutions,
      count: institutions.length,
    };
  }, [selectedItem, filteredData]);

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
      setters.setSelectionKey(`gi:${selectedItem.geolocation.join(",")}`);
    } else if (
      selectedItem.type === "project" &&
      selectedItem.projects.length > 0
    ) {
      setters.setSelectionKey(`pr:${selectedItem.projects[0].project_id}`);
    }
  }, [selectedItem]); // eslint-disable-line react-hooks/exhaustive-deps

  /** URL initialization: restore selectedItem from URL sel param */
  const panelInitializedRef = useRef(false);
  useEffect(() => {
    if (
      panelInitializedRef.current ||
      !filterValues.selectionKey ||
      !groupedData.length
    )
      return;
    panelInitializedRef.current = true;
    const colonIdx = filterValues.selectionKey.indexOf(":");
    const type = filterValues.selectionKey.slice(0, colonIdx);
    const id = filterValues.selectionKey.slice(colonIdx + 1);
    if (type === "gi") {
      const group = groupedData.find((g) => g.geolocation.join(",") === id);
      if (group) {
        setSelectedItem({
          type: "grouped-institution",
          geolocation: group.geolocation,
          institutionIds: group.institutions.map((i) => i.institution_id),
        });
        setInfoPanelOpen(true);
      }
    } else if (type === "pr") {
      setSelectedItem({ type: "project", projects: [{ project_id: id }] });
      setInfoPanelOpen(true);
    }
  }, [filterValues.selectionKey, groupedData]); // eslint-disable-line react-hooks/exhaustive-deps

  const layerConfigs: LayerConfig[] = useMemo(
    () => [
      {
        id: "grouped-icons",
        title: "Grouped",
        description: "Institutions clustered by distance",
        previewImage: "/images/settings/mapbox-dark.png",
        createLayers: () => [
          new GroupedIconLayer({
            id: "grouped-institution-view",
            data: groupedData,
            isDark,
            onClick: handleMapOnClick,
            onHover: handleIconHover,
          }),
        ],
      },
    ],
    [groupedData, isDark, handleMapOnClick, handleIconHover],
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
        topicFilter={TopicFilter}
        defaultViewState={INITIAL_VIEW_STATE_EU}
        initialViewState={filterValues.viewState}
        onViewStateChange={debouncedSetViewState}
        onResetAll={resetAll}
        loading={isPending}
        isFilterPending={isFilterPending}
        error={error}
        scenarioName={"Overview"}
        scenarioTitle={"Overview"}
        onFlyToReady={handleFlyToReady}
        selectedItem={selectedItem}
        selectedGeoGroup={selectedGeoGroup}
        infoPanelOpen={infoPanelOpen}
        onInfoPanelClose={() => setInfoPanelOpen(false)}
        onInfoPanelOpen={() => setInfoPanelOpen(true)}
        mapFilters={filterValues}
        toQueryString={toQueryString}
        toListQueryString={toListQueryString}
      />
      {hoverState && (
        <MapTooltip position={hoverState}>
          <GeoGroupTooltip group={hoverState.data} />
        </MapTooltip>
      )}
    </>
  );
}

export default function ExploreScenario() {
  return (
    <Suspense>
      <ExploreScenarioContent />
    </Suspense>
  );
}
