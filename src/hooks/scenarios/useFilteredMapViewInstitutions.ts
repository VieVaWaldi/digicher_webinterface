import { useEffect, useMemo, useState, useTransition } from "react";
import { MapViewInstitutionType } from "db/schemas/core-map-view";

export interface InstitutionFilterPredicates {
  /** Raw selected country codes — used for index-based candidate reduction */
  selectedCountries: string[];
  institutionSearchPredicate: (institutionId: string) => boolean;
  typeAndSmePredicate: (type: string | null, sme: boolean | null) => boolean;
  topicPredicate: (projectId: string) => boolean;
  projectSearchPredicate: (projectId: string) => boolean;
  frameworkProgrammePredicate: (frameworkProgrammes: string[] | null) => boolean;
  yearRangePredicate: (start: string, end: string) => boolean;
}

export interface FilteredMapViewInstitutionsResult {
  filteredData: MapViewInstitutionType[];
  /** True while the map is catching up to the latest filter change */
  isFilterPending: boolean;
}

/**
 * Shared filtering hook for all map scenario pages.
 *
 * Builds a country → institutions index on data load so that when a country
 * filter is active, only matching institutions are scanned instead of all rows.
 *
 * Uses useTransition so filter UI (sliders, chips) updates instantly while
 * the expensive downstream re-renders (layer rebuilds, groupByGeolocation)
 * happen as a low-priority background update. isFilterPending can be passed
 * to MapController's loading prop to show a subtle indicator while the map
 * catches up.
 */
export function useFilteredMapViewInstitutions(
  data: MapViewInstitutionType[] | undefined,
  predicates: InstitutionFilterPredicates,
): FilteredMapViewInstitutionsResult {
  const {
    selectedCountries,
    institutionSearchPredicate,
    typeAndSmePredicate,
    topicPredicate,
    projectSearchPredicate,
    frameworkProgrammePredicate,
    yearRangePredicate,
  } = predicates;

  // Build country → institutions index once when raw data loads.
  const countryIndex = useMemo(() => {
    if (!data?.length) return null;
    const index = new Map<string, MapViewInstitutionType[]>();
    for (const inst of data) {
      const key = inst.country_code ?? "__null__";
      let bucket = index.get(key);
      if (!bucket) {
        bucket = [];
        index.set(key, bucket);
      }
      bucket.push(inst);
    }
    return index;
  }, [data]);

  // Compute the filtered result synchronously (predicate calls are fast).
  // This value is then applied to state via a transition so downstream
  // re-renders (layers, groupByGeolocation) don't block the filter UI.
  const computedFiltered = useMemo(() => {
    if (!data?.length || !countryIndex) return [];

    let candidates: MapViewInstitutionType[];
    if (selectedCountries.length > 0) {
      candidates = selectedCountries.flatMap(
        (code) => countryIndex.get(code) ?? [],
      );
    } else {
      candidates = data;
    }

    return candidates.flatMap((p) => {
      if (!institutionSearchPredicate(p.institution_id)) return [];
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
    countryIndex,
    selectedCountries,
    institutionSearchPredicate,
    typeAndSmePredicate,
    topicPredicate,
    projectSearchPredicate,
    frameworkProgrammePredicate,
    yearRangePredicate,
  ]);

  const [isPending, startTransition] = useTransition();
  const [filteredData, setFilteredData] = useState<MapViewInstitutionType[]>(computedFiltered);

  useEffect(() => {
    startTransition(() => {
      setFilteredData(computedFiltered);
    });
  }, [computedFiltered]);

  return { filteredData, isFilterPending: isPending };
}
