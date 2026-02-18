"use client";

import MapController from "@/components/deckgl/MapController";
import useCountryFilter from "components/filter/useCountryFilter";
import useFrameworkProgrammeFilter from "components/filter/useFrameworkProgrammeFilter";
import { useTopicFilter } from "components/filter/useTopicFilter";
import useTypeAndSmeFilter from "components/filter/useTypeAndSmeFilter";
import useYearRangeFilter from "components/filter/useYearRangeFilter";
import { FilterSection, useUnifiedSearchFilter } from "components/mui";
import { useMapViewInstitution } from "hooks/queries/views/map/useMapViewInstitution";
import { ReactNode, Suspense, useCallback, useMemo, useState } from "react";
import { INITIAL_VIEW_STATE_EU } from "@/components/deckgl/viewports";
import { Box, Typography, useTheme } from "@mui/material";
import { useFilters } from "@/hooks/persistence/useFilters";
import { useDebouncedCallback } from "use-debounce";
import { GroupedIconLayer } from "@/components/deckgl/layers/GroupedIconLayer";
import { createIconLayer } from "@/components/deckgl/layers/IconLayer";
import { LayerConfig } from "@/components/mui/LayerSwitcher";
import { ENTITY_OPTIONS } from "@/components/mui/SearchBar";
import { GeoGroup, groupByGeolocation } from "@/app/scenarios/scenario_data";
import { useMapHover } from "@/components/deckgl/hover/useMapHover";
import { MapTooltip } from "@/components/deckgl/hover/MapTooltip";
import { GeoGroupTooltip } from "@/components/deckgl/hover/GeoGroupTooltip";

function BaseScenarioContent() {
  const { data, isPending, error } = useMapViewInstitution();
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<
    string | null
  >(null);

  /** Filters */

  const { filters: filterValues, setters, resetAll } = useFilters();

  const debouncedSetYearRange = useDebouncedCallback(setters.setYearRange, 300);
  const debouncedSetViewState = useDebouncedCallback(setters.setViewState, 300);
  const { YearRangeFilter, yearRangePredicate } = useYearRangeFilter({
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
    countryPredicate,
    typeAndSmePredicate,
    topicPredicate,
    projectSearchPredicate,
    frameworkProgrammePredicate,
    yearRangePredicate,
  ]);

  /** UI Components */

  const totalProjects = useMemo(() => {
    const seen = new Set<string>();
    for (const p of filteredData)
      for (const proj of p.projects) seen.add(proj.id);
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

  /** Event Handlers */

  const handleMapOnClick = useCallback((info: any) => {
    if (info.object.count) {
      setSelectedInstitutionId(info.object.institution_id);
      console.log(info.object);
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

  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const layerConfigs: LayerConfig[] = useMemo(
    () => [
      {
        id: "grouped-icons",
        title: "Grouped",
        description:
          "Institutions clustered by distance",
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
      {
        id: "individual-icons",
        title: "Individual",
        description: "All individual institutions",
        previewImage: "/images/settings/mapbox-dark.png",
        createLayers: () => [
          createIconLayer({
            id: "icon-institution-view",
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
        defaultViewState={INITIAL_VIEW_STATE_EU}
        initialViewState={filterValues.viewState}
        onViewStateChange={debouncedSetViewState}
        onResetAll={resetAll}
        loading={isPending}
        error={error}
        scenarioName={"Base"}
        scenarioTitle={"Base"}
      />
      {hoverState && (
        <MapTooltip position={hoverState}>
          <GeoGroupTooltip group={hoverState.data} />
        </MapTooltip>
      )}
    </>
  );
}

export default function BaseScenario() {
  return (
    <Suspense>
      <BaseScenarioContent />
    </Suspense>
  );
}