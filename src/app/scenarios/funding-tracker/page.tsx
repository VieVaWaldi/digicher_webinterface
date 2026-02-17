"use client";

import MapController from "@/components/deckgl/MapController";
import useCountryFilter from "components/filter/useCountryFilter";
import useFrameworkProgrammeFilter from "components/filter/useFrameworkProgrammeFilter";
import { useTopicFilter } from "components/filter/useTopicFilter";
import useTypeAndSmeFilter from "components/filter/useTypeAndSmeFilter";
import useYearRangeFilter from "components/filter/useYearRangeFilter";
import { PickingInfo } from "deck.gl";
import { INITIAL_VIEW_STATE_TILTED_EU } from "@/components/deckgl/viewports";
import { ReactNode, Suspense, useCallback, useMemo, useState } from "react";
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
import { groupByGeolocation } from "@/app/scenarios/scenario_data";

function FundingScenarioContent() {
  const { data, isPending, error } = useMapViewInstitution();
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<
    string | null
  >(null);
  /** Hover State */
  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    funding: number;
    object: any;
  } | null>(null);

  /** Filters */

  const { filters: filterValues, setters, resetAll } = useFilters();

  const debouncedSetYearRange = useDebouncedCallback(setters.setYearRange, 300);
  const debouncedSetViewState = useDebouncedCallback(setters.setViewState, 500);
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
    projectSearchPredicate,
    frameworkProgrammePredicate,
    yearRangePredicate,
    countryPredicate,
    typeAndSmePredicate,
    topicPredicate,
  ]);

  /** Calculations */

  const maxTotalCost = useMemo(() => {
    return filteredData.reduce((max, p) => {
      const cost = p.total_cost || 0;
      return Math.max(max, cost);
    }, 0);
  }, [filteredData]);

  const totalFunding = useMemo(() => {
    return filteredData.reduce((sum, p) => sum + (p.total_cost || 0), 0);
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
      institutions and{" "}
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

  /** Event Handlers */

  const handleMapOnClick = useCallback((info: PickingInfo) => {
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

  const handleHover = useCallback((info: PickingInfo) => {
    if (info.object) {
      setHoverInfo({
        x: info.x,
        y: info.y,
        funding: info.object.total_cost || 0,
        object: info.object,
      });
    } else {
      setHoverInfo(null);
    }
  }, []);

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
        title: "Hexagon",
        description: "Aggregated hexagonal bins showing funding density.",
        previewImage: "/images/settings/mapbox-dark.png",
        createLayers: () => [
          createHexagonLayer({
            data: groupedData,
            isGlobe,
            onClick: handleMapOnClick,
            onHover: handleHover,
          }),
        ],
      },
      {
        id: "column",
        title: "Column",
        description: "3D columns showing funding amounts as height.",
        previewImage: "/images/settings/mapbox-dark.png",
        createLayers: () => [
          createColumnLayer({
            data: groupedData,
            maxTotalCost,
            isGlobe,
            onClick: handleMapOnClick,
            onHover: handleHover,
          }),
        ],
      },
      {
        id: "extruded-countries",
        title: "Countries",
        description:
          "Extruded country shapes showing aggregated funding per country.",
        previewImage: "/images/settings/mapbox-dark.png",
        createLayers: () => [
          createExtrudedCountryLayer({
            data: filteredData,
            countryGeoData,
            isGlobe,
            onClick: handleMapOnClick,
            onHover: handleHover,
          }),
        ],
      },
    ],
    [
      filteredData,
      maxTotalCost,
      isGlobe,
      handleMapOnClick,
      handleHover,
      countryGeoData,
    ],
  );

  /** Hover Tooltip */
  const hoverTooltip = hoverInfo && (
    <div
      style={{
        position: "absolute",
        pointerEvents: "none",
        left: hoverInfo.x,
        top: hoverInfo.y,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: "#fff",
        padding: "8px",
        borderRadius: "4px",
        transform: "translate(-50%, -100%)",
        marginTop: "-15px",
        zIndex: 1000,
      }}
    >
      <div>
        Total Cost:{" "}
        {new Intl.NumberFormat("de-DE", {
          style: "currency",
          currency: "EUR",
        }).format(hoverInfo.funding)}
      </div>
    </div>
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
        onViewStateChange={debouncedSetViewState}
        onResetAll={resetAll}
        loading={isPending}
        error={error}
        scenarioName="funding-tracker"
        scenarioTitle="Funding Tracker"
        filters={Filters}
      />
      {hoverTooltip}
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
