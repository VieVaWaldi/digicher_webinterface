"use client";

import { ReactNode, useMemo } from "react";
import { useDebouncedCallback } from "use-debounce";
import useCountryFilter from "components/filter/useCountryFilter";
import useFrameworkProgrammeFilter from "components/filter/useFrameworkProgrammeFilter";
import { useTopicFilter } from "components/filter/useTopicFilter";
import useTypeAndSmeFilter from "components/filter/useTypeAndSmeFilter";
import usePlayYearFilter from "components/filter/usePlayYearFilter";
import { useUnifiedSearchFilter } from "components/mui";
import { ENTITY_OPTIONS_MAP } from "components/mui/SearchBar";
import { FilterValues, FilterSetters } from "hooks/persistence/useFilters";

export interface ScenarioFiltersResult {
  // Filter UI components
  YearRangeFilter: ReactNode;
  CountryFilter: ReactNode;
  TypeAndSmeFilter: ReactNode;
  SearchFilter: ReactNode;
  MinorityGroupsFilter: ReactNode;
  FrameworkProgrammeFilter: ReactNode;
  TopicFilter: ReactNode;

  // Predicates
  yearRangePredicate: (start: string, end: string) => boolean;
  countryPredicate: (countryCode: string | null) => boolean;
  typeAndSmePredicate: (type: string | null, sme: boolean | null) => boolean;
  institutionSearchPredicate: (institutionId: string) => boolean;
  projectSearchPredicate: (projectId: string) => boolean;
  frameworkProgrammePredicate: (frameworkProgrammes: string[] | null) => boolean;
  topicPredicate: (projectId: string) => boolean;

  // Raw values
  selectedCountries: string[];
  getTopicColor: (projectId: string) => [number, number, number, number];
  selectedFields: string[];
  selectedSubfields: string[];
  selectedTopics: number[];
}

/**
 * Shared filter setup hook for all map scenario pages.
 * Instantiates all filter hooks with URL-persisted state and returns
 * both the UI components and predicates needed for filtering.
 */
export function useScenarioFilters(
  filterValues: FilterValues,
  setters: FilterSetters,
): ScenarioFiltersResult {
  const debouncedSetYearRange = useDebouncedCallback(setters.setYearRange, 300);

  // Stabilize filter param references so that URL changes unrelated to filters
  // (viewState from panning, selectionKey) don't cascade into filter hook
  // useEffect re-syncs, which would cause a spurious isFilterPending flash.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stable = useMemo(() => filterValues, [
    filterValues.yearRange?.join("-"),
    filterValues.countries.join(","),
    filterValues.typeAndSme.join(","),
    filterValues.frameworkProgrammes.join(","),
    filterValues.topicFields.join(","),
    filterValues.topicSubfields.join(","),
    filterValues.topicTopics.join(","),
    filterValues.unifiedSearch.entity,
    filterValues.unifiedSearch.query,
    filterValues.unifiedSearch.minorityGroups.join(","),
  ]);

  const { YearRangeFilter, yearRangePredicate } = usePlayYearFilter({
    initialValue: stable.yearRange,
    onChange: debouncedSetYearRange,
  });

  const { CountryFilter, countryPredicate, selectedCountries } = useCountryFilter({
    initialValue: stable.countries,
    onChange: setters.setCountries,
  });

  const { TypeAndSmeFilter, typeAndSmePredicate } = useTypeAndSmeFilter({
    initialValue: stable.typeAndSme,
    onChange: setters.setTypeAndSme,
  });

  const {
    SearchFilter,
    institutionSearchPredicate,
    projectSearchPredicate,
    MinorityGroupsFilter,
  } = useUnifiedSearchFilter({
    entityOptions: ENTITY_OPTIONS_MAP,
    defaultEntity: "projects",
    initialEntity: stable.unifiedSearch.entity,
    initialQuery: stable.unifiedSearch.query,
    initialMinorityGroups: stable.unifiedSearch.minorityGroups,
    onEntityChange: setters.setEntity,
    onQueryChange: setters.setQuery,
    onMinorityGroupsChange: setters.setMinorityGroups,
  });

  const { FrameworkProgrammeFilter, frameworkProgrammePredicate } =
    useFrameworkProgrammeFilter({
      initialValue: stable.frameworkProgrammes,
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
    initialFields: stable.topicFields,
    initialSubfields: stable.topicSubfields,
    initialTopics: stable.topicTopics,
    onFieldsChange: setters.setTopicFields,
    onSubfieldsChange: setters.setTopicSubfields,
    onTopicsChange: setters.setTopicTopics,
  });

  return {
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
    getTopicColor,
    selectedFields,
    selectedSubfields,
    selectedTopics,
  };
}