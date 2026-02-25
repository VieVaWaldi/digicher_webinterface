"use client";

import MapController from "@/components/deckgl/MapController";
import useCountryFilter from "components/filter/useCountryFilter";
import useFrameworkProgrammeFilter from "components/filter/useFrameworkProgrammeFilter";
import { useTopicFilter } from "components/filter/useTopicFilter";
import useTypeAndSmeFilter from "components/filter/useTypeAndSmeFilter";
import usePlayYearFilter from "components/filter/usePlayYearFilter";
import { INITIAL_VIEW_STATE_TILTED_EU } from "@/components/deckgl/viewports";
import { ReactNode, Suspense, useCallback, useMemo, useRef, useState } from "react";
import { ViewState } from "react-map-gl/mapbox";
import { useMapViewInstitution } from "hooks/queries/views/map/useMapViewInstitution";
import { Box, Typography } from "@mui/material";
import { FilterSection, useUnifiedSearchFilter } from "@/components/mui";
import useFilters from "@/hooks/persistence/useFilters";
import { useDebouncedCallback } from "use-debounce";
import { LayerConfig } from "@/components/mui/LayerSwitcher";
import { createColumnLayer } from "@/components/deckgl/layers/ColumnLayer";
import { createHexagonLayer } from "@/components/deckgl/layers/HexagonLayer";
import { createExtrudedCountryLayer } from "@/components/deckgl/layers/ExtrudedCountryLayer";
import { useCountryGeoData } from "@/hooks/queries/useCountryGeoData";
import { useSettings } from "@/context/SettingsContext";
import { ENTITY_OPTIONS } from "@/components/mui/SearchBar";
import { GeoGroup, groupByGeolocation } from "@/app/scenarios/scenario_data";
import { useMapHover } from "@/components/deckgl/hover/useMapHover";
import { MapTooltip } from "@/components/deckgl/hover/MapTooltip";
import { GeoGroupTooltip } from "@/components/deckgl/hover/GeoGroupTooltip";
import { CountryTooltip } from "@/components/deckgl/hover/CountryTooltip";
import { useInstitutionListView } from "@/components/maplistview";
import { getParticipationCost } from "@/utils/institutionUtils";

type FundingHoverData =
  | { type: "geoGroup"; group: GeoGroup }
  | { type: "country"; countryCode: string; funding: number };

function FundingScenarioContent() {
  const { data, isPending, error } = useMapViewInstitution();
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<
    string | null
  >(null);

  /** Filters */

  const { filters: filterValues, setters, resetAll } = useFilters();

  const debouncedSetYearRange = useDebouncedCallback(setters.setYearRange, 300);
  const debouncedSetViewState = useDebouncedCallback(setters.setViewState, 500);

  const [zoom, setZoom] = useState<number>(
    filterValues.viewState?.zoom ?? INITIAL_VIEW_STATE_TILTED_EU.zoom,
  );
  const handleViewStateChange = useCallback(
    (vs: ViewState) => {
      const snapped = Math.round((vs.zoom ?? 0) * 2) / 2;
      setZoom((prev) => (prev !== snapped ? snapped : prev));
      debouncedSetViewState(vs);
    },
    [debouncedSetViewState],
  );
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
  const { TopicFilter, topicPredicate } = useTopicFilter({
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
    projectSearchPredicate,
    frameworkProgrammePredicate,
    yearRangePredicate,
    countryPredicate,
    typeAndSmePredicate,
    topicPredicate,
  ]);

  /** Calculations */

  const maxTotalCost = useMemo(() => {
    return filteredData.reduce((max, i) => Math.max(max, getParticipationCost(i)), 0);
  }, [filteredData]);

  const totalFunding = useMemo(() => {
    return filteredData.reduce((sum, i) => sum + getParticipationCost(i), 0);
  }, [filteredData]);

  /** UI Components */

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
        {Math.round(totalFunding).toLocaleString()}€
      </Box>{" "}
      funded
    </Typography>
  );

  const Filters: ReactNode = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
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

  const flyToRef = useRef<((geo: number[]) => void) | null>(null);
  const handleFlyTo = useCallback((geo: number[]) => flyToRef.current?.(geo), []);
  const handleFlyToReady = useCallback((fn: (geo: number[]) => void) => {
    flyToRef.current = fn;
  }, []);

  const listContent = useInstitutionListView(filteredData, {
    onFlyTo: handleFlyTo,
    onRowClick: (item) => {
      console.log("Row clicked:", item);
    },
  });

  /** Event Handlers */

  const handleMapOnClick = useCallback((info: any) => {
    if (info.object.points) {
      // ToDo: Is not in grouped format, but flat institution array
      const institutions = info.object.points.flatMap(
        (p: any) => p.institutions,
      );
      console.log(institutions);
    }
    if (info.object.count && !info.object.points) {
      setSelectedInstitutionId(info.object.institution_id);
      console.log(info.object);
    }
  }, []);

  /** Hover */

  const { hoverState, makeHoverHandler } = useMapHover<FundingHoverData>();

  const handleColumnHover = useMemo(
    () =>
      makeHoverHandler((obj: any): FundingHoverData | null => {
        if (!obj?.institutions) return null;
        return { type: "geoGroup", group: obj as GeoGroup };
      }),
    [makeHoverHandler],
  );

  const handleHexHover = useMemo(
    () =>
      makeHoverHandler((obj: any): FundingHoverData | null => {
        if (!obj?.points) return null;
        const institutions = (obj.points as GeoGroup[]).flatMap(
          (p) => p.institutions,
        );
        const geolocation = (obj.points as GeoGroup[])[0]?.geolocation ?? [0, 0];
        return {
          type: "geoGroup",
          group: { geolocation, institutions, count: institutions.length },
        };
      }),
    [makeHoverHandler],
  );

  const handleCountryHover = useMemo(
    () =>
      makeHoverHandler((obj: any): FundingHoverData | null => {
        if (!obj?.countryCode) return null;
        return {
          type: "country",
          countryCode: obj.countryCode,
          funding: obj.funding ?? 0,
        };
      }),
    [makeHoverHandler],
  );

  /** Layer */

  const { isGlobe } = useSettings();
  const { data: countryGeoData } = useCountryGeoData();

  const groupedData = useMemo(
    () => groupByGeolocation(filteredData),
    [filteredData],
  );

  const layerConfigs: LayerConfig[] = useMemo(
    () => [
      {
        id: "hexagon",
        title: "Binned",
        description: "Aggregated hexagonal bins showing funding density",
        previewImage: "/images/settings/mapbox-dark.png",
        createLayers: () => [
          createHexagonLayer({
            data: groupedData,
            isGlobe,
            zoom,
            onClick: handleMapOnClick,
            onHover: handleHexHover,
          }),
        ],
      },
      {
        id: "column",
        title: "Individual",
        description: "All individual institutions funding",
        previewImage: "/images/settings/mapbox-dark.png",
        createLayers: () => [
          createColumnLayer({
            data: groupedData,
            maxTotalCost,
            isGlobe,
            zoom,
            onClick: handleMapOnClick,
            onHover: handleColumnHover,
          }),
        ],
      },
      {
        id: "extruded-countries",
        title: "Countries",
        description: "Aggregated funding for each country",
        previewImage: "/images/settings/mapbox-dark.png",
        createLayers: () => [
          createExtrudedCountryLayer({
            data: filteredData,
            countryGeoData,
            isGlobe,
            onClick: handleMapOnClick,
            onHover: handleCountryHover,
          }),
        ],
      },
    ],
    [
      filteredData,
      maxTotalCost,
      isGlobe,
      zoom,
      handleMapOnClick,
      handleColumnHover,
      handleHexHover,
      handleCountryHover,
      countryGeoData,
      groupedData,
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
        defaultViewState={INITIAL_VIEW_STATE_TILTED_EU}
        initialViewState={filterValues.viewState}
        onViewStateChange={handleViewStateChange}
        onResetAll={resetAll}
        loading={isPending}
        error={error}
        scenarioName="funding-tracker"
        scenarioTitle="Funding Tracker"
        filters={Filters}
        listContent={listContent}
        onFlyToReady={handleFlyToReady}
      />
      {hoverState && (
        <MapTooltip position={hoverState}>
          {hoverState.data.type === "country" ? (
            <CountryTooltip
              countryCode={hoverState.data.countryCode}
              funding={hoverState.data.funding}
            />
          ) : (
            <GeoGroupTooltip group={hoverState.data.group} showFunding />
          )}
        </MapTooltip>
      )}
    </>
  );
}

export default function FundingScenario() {
  return (
    <Suspense>
      <FundingScenarioContent />
    </Suspense>
  );
}