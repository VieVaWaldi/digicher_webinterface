"use client";

import MapController from "@/components/deckgl/MapController";
import useCountryFilter from "components/filter/useCountryFilter";
import useFrameworkProgrammeFilter from "components/filter/useFrameworkProgrammeFilter";
import { useTopicFilter } from "components/filter/useTopicFilter";
import useTypeAndSmeFilter from "components/filter/useTypeAndSmeFilter";
import useYearRangeFilter from "components/filter/useYearRangeFilter";
import {
  EntityOption,
  FilterSection,
  useUnifiedSearchFilter,
} from "components/mui";
import { useMapViewInstitution } from "hooks/queries/views/map/useMapViewInstitution";
import { ReactNode, Suspense, useCallback, useMemo, useState } from "react";
import { INITIAL_VIEW_STATE_EU } from "@/components/deckgl/viewports";
import { Box, Typography, useTheme } from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ScienceIcon from "@mui/icons-material/Science";
import { useFilters } from "@/hooks/persistence/useFilters";
import { useDebouncedCallback } from "use-debounce";
import { GroupedIconLayer } from "@/components/deckgl/layers/GroupedIconLayer";
import { createIconLayer } from "@/components/deckgl/layers/IconLayer";

const ENTITY_OPTIONS: EntityOption[] = [
  // {
  //   value: "works",
  //   label: "Works",
  //   icon: <DescriptionIcon fontSize="small" />,
  // },
  {
    value: "projects",
    label: "Projects",
    icon: <ScienceIcon fontSize="small" />,
  },
  {
    value: "institutions",
    label: "Institutions",
    icon: <AccountBalanceIcon fontSize="small" />,
  },
];

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
  const { TopicFilter, topicPredicate } = useTopicFilter();

  /** Apply Filters */

  const filteredData = useMemo(() => {
    if (!data?.length) return [];
    return data.filter((p) => {
      if (!institutionSearchPredicate(p.institution_id)) return false;
      if (!countryPredicate(p.country_code)) return false;
      if (!typeAndSmePredicate(p.type, p.sme)) return false;

      const projects = p.projects;
      if (!projects?.length) return false;

      return projects.some(
        (proj) =>
          topicPredicate(proj.id) &&
          projectSearchPredicate(proj.id) &&
          frameworkProgrammePredicate(proj.framework_programmes) &&
          yearRangePredicate(proj.start, proj.end),
      );
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

  const Filters: ReactNode = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography
        variant="h5"
        color="text.secondary"
        sx={{ textAlign: "center", mt: 1 }}
      >
        Displaying{" "}
        <Box component="span" sx={{ color: "secondary.main", fontWeight: 500 }}>
          {filteredData?.length.toLocaleString()}
        </Box>{" "}
        institutions
      </Typography>

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

  /** Layer */

  const groupedData = useMemo(() => {
    const geoMap = new Map<string, typeof filteredData>();

    filteredData.forEach((inst) => {
      if (!inst.geolocation) return;
      const key = inst.geolocation.join(",");
      if (!geoMap.has(key)) {
        geoMap.set(key, []);
      }
      geoMap.get(key)!.push(inst);
    });

    // Stats (uncomment to analyse)
    // const grouped = Array.from(geoMap.values());
    // const withGeo = grouped.reduce((sum, g) => sum + g.length, 0);
    // console.log({
    //   totalInstitutions: filteredData.length,
    //   withGeolocation: withGeo,
    //   withoutGeolocation: filteredData.length - withGeo,
    //   uniqueLocations: geoMap.size,
    //   duplicatesSaved: withGeo - geoMap.size,
    //   withMultiple: grouped.filter((g) => g.length > 1).length,
    //   maxAtSameLocation: Math.max(...grouped.scenarios((g) => g.length)),
    // });

    return Array.from(geoMap.values()).map((institutions) => ({
      geolocation: institutions[0].geolocation,
      institutions,
      count: institutions.length,
    }));
  }, [filteredData]);

  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // const layer = useMemo(() => {
  //   return new IconLayer({
  //     id: "scatter-institution-view",
  //     data: groupedData,
  //     pickable: true,
  //     getPosition: (d) => d.geolocation,
  //     getIcon: (d) => ({
  //       url: institutionIconUrl(
  //         isDark
  //           ? d.count >= 2
  //             ? palette.dark.secondaryLight
  //             : palette.dark.primaryLight
  //           : d.count >= 2
  //             ? palette.light.secondaryLight
  //             : palette.light.primaryLight,
  //       ),
  //       width: 64,
  //       height: 64,
  //       anchorY: 64,
  //     }),
  //     getSize: (d) => (d.count >= 2 ? 400 : 400),
  //     sizeUnits: "meters",
  //     sizeMinPixels: 12, // clickable when zoomed out
  //     sizeMaxPixels: 40, // building-sized when zoomed in
  //     onClick: handleMapOnClick,
  //     updateTriggers: {
  //       getPosition: groupedData,
  //       getIcon: theme.palette.mode,
  //     },
  //   });
  // }, [groupedData, handleMapOnClick, isDark]);

  const layer = useMemo(() => {
    return new GroupedIconLayer({
      id: "scatter-institution-view",
      data: groupedData,
      isDark,
      onClick: handleMapOnClick,
    });
  }, [groupedData, handleMapOnClick, isDark]);

  // const layer = useMemo(() => {
  //   return createIconLayer({
  //     id: "scatter-institution-view",
  //     data: groupedData,
  //     isDark,
  //     onClick: handleMapOnClick,
  //   });
  // }, [groupedData, handleMapOnClick, isDark]);

  return (
    <MapController
      layers={[layer]}
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
  );
}

export default function BaseScenario() {
  return (
    <Suspense>
      <BaseScenarioContent />
    </Suspense>
  );
}
