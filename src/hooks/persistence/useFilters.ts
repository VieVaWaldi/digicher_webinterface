"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { SearchEntity } from "@/components/filter/useUnifiedSearchFilter";

/** Max total topic selections (fields + subfields + topics) persisted in URL */
export const MAX_URL_TOPICS = 20;

/** URL parameter keys for filter persistence */
const PARAM_KEYS = {
  years: "years",
  countries: "countries",
  types: "types",
  fps: "fps",
  entity: "entity",
  query: "q",
  minorities: "minorities",
  view: "view", // format: "lat,lng,zoom"
  layer: "layer",
  topicFields: "tf",
  topicSubfields: "tsf",
  topicTopics: "tt",
  sel: "sel", // format: "TYPE:ID" e.g. "gi:8.668,40.743", "cn:abc123", "pr:projectId"
} as const;

/** ViewState stored in URL */
export interface UrlViewState {
  latitude: number;
  longitude: number;
  zoom: number;
}

/** Parsed filter values from URL */
export interface FilterValues {
  yearRange: [number, number] | null;
  countries: string[];
  typeAndSme: string[];
  frameworkProgrammes: string[];
  unifiedSearch: {
    entity: SearchEntity;
    query: string;
    minorityGroups: string[];
  };
  viewState: UrlViewState | null;
  activeLayerIndex: number;
  topicFields: string[];
  topicSubfields: string[];
  topicTopics: number[];
  selectionKey: string | null;
}

/** Setters for updating filter values (updates URL) */
export interface FilterSetters {
  setYearRange: (value: [number, number] | null) => void;
  setCountries: (value: string[]) => void;
  setTypeAndSme: (value: string[]) => void;
  setFrameworkProgrammes: (value: string[]) => void;
  setEntity: (value: SearchEntity) => void;
  setQuery: (value: string) => void;
  setMinorityGroups: (value: string[]) => void;
  setViewState: (value: UrlViewState | null) => void;
  setActiveLayerIndex: (value: number) => void;
  setTopicFields: (value: string[]) => void;
  setTopicSubfields: (value: string[]) => void;
  setTopicTopics: (value: number[]) => void;
  setSelectionKey: (value: string | null) => void;
}

export interface UseFiltersResult {
  filters: FilterValues;
  setters: FilterSetters;
  toQueryString: () => string;
  resetAll: () => void;
}

/**
 * Hook for managing filter state via URL query parameters.
 * Enables URL-based filter persistence for sharing/bookmarking filtered views.
 */
export function useFilters(): UseFiltersResult {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  /** Parse filter values from URL search params */
  const filters = useMemo<FilterValues>(() => {
    // Parse years: "2015-2025" -> [2015, 2025]
    const yearsParam = searchParams.get(PARAM_KEYS.years);
    let yearRange: [number, number] | null = null;
    if (yearsParam) {
      const [min, max] = yearsParam.split("-").map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        yearRange = [min, max];
      }
    }

    // Parse comma-separated arrays
    const parseArray = (param: string | null): string[] => {
      if (!param) return [];
      return param.split(",").map(decodeURIComponent).filter(Boolean);
    };

    const countries = parseArray(searchParams.get(PARAM_KEYS.countries));
    const typeAndSme = parseArray(searchParams.get(PARAM_KEYS.types));
    const frameworkProgrammes = parseArray(searchParams.get(PARAM_KEYS.fps));
    const minorityGroups = parseArray(searchParams.get(PARAM_KEYS.minorities));

    // Parse entity (default: "projects")
    const entityParam = searchParams.get(PARAM_KEYS.entity);
    const entity: SearchEntity =
      entityParam === "institutions" || entityParam === "works"
        ? entityParam
        : "projects";

    // Parse query
    const query = searchParams.get(PARAM_KEYS.query) || "";

    // Parse viewState: "lat,lng,zoom"
    const viewParam = searchParams.get(PARAM_KEYS.view);
    let viewState: UrlViewState | null = null;
    if (viewParam) {
      const parts = viewParam.split(",").map(Number);
      if (parts.length >= 3 && parts.every((n) => !isNaN(n))) {
        viewState = {
          latitude: parts[0],
          longitude: parts[1],
          zoom: parts[2],
        };
      }
    }

    // Parse layer index (default: 0)
    const layerParam = searchParams.get(PARAM_KEYS.layer);
    const activeLayerIndex =
      layerParam !== null && !isNaN(Number(layerParam))
        ? Number(layerParam)
        : 0;

    // Parse topic selections
    const topicFields = parseArray(searchParams.get(PARAM_KEYS.topicFields));
    const topicSubfields = parseArray(
      searchParams.get(PARAM_KEYS.topicSubfields),
    );
    const topicTopics = parseArray(searchParams.get(PARAM_KEYS.topicTopics))
      .map(Number)
      .filter((n) => !isNaN(n));

    // Parse selection key
    const selectionKey = searchParams.get(PARAM_KEYS.sel) || null;

    return {
      yearRange,
      countries,
      typeAndSme,
      frameworkProgrammes,
      unifiedSearch: {
        entity,
        query,
        minorityGroups,
      },
      viewState,
      activeLayerIndex,
      topicFields,
      topicSubfields,
      topicTopics,
      selectionKey,
    };
  }, [searchParams]);

  /** Build a new URLSearchParams from current filters with one value changed */
  const buildParams = useCallback(
    (updates: Partial<Record<keyof typeof PARAM_KEYS, string | null>>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        const paramKey = PARAM_KEYS[key as keyof typeof PARAM_KEYS];
        if (value === null || value === "") {
          params.delete(paramKey);
        } else {
          params.set(paramKey, value);
        }
      }

      return params;
    },
    [searchParams],
  );

  /** Update URL with new params */
  const updateUrl = useCallback(
    (params: URLSearchParams) => {
      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [router, pathname],
  );

  /** Create setters that update URL */
  const setters = useMemo<FilterSetters>(() => {
    const setYearRange = (value: [number, number] | null) => {
      const params = buildParams({
        years: value ? `${value[0]}-${value[1]}` : null,
      });
      updateUrl(params);
    };

    const setCountries = (value: string[]) => {
      const params = buildParams({
        countries:
          value.length > 0 ? value.map(encodeURIComponent).join(",") : null,
      });
      updateUrl(params);
    };

    const setTypeAndSme = (value: string[]) => {
      const params = buildParams({
        types:
          value.length > 0 ? value.map(encodeURIComponent).join(",") : null,
      });
      updateUrl(params);
    };

    const setFrameworkProgrammes = (value: string[]) => {
      const params = buildParams({
        fps: value.length > 0 ? value.map(encodeURIComponent).join(",") : null,
      });
      updateUrl(params);
    };

    const setEntity = (value: SearchEntity) => {
      const params = buildParams({
        entity: value !== "projects" ? value : null,
        query: null, // Need to overwrite query like changing entities in SearchBar does to prevent RaceCondition
      });
      updateUrl(params);
    };

    const setQuery = (value: string) => {
      const params = buildParams({
        query: value || null,
      });
      updateUrl(params);
    };

    const setMinorityGroups = (value: string[]) => {
      const params = buildParams({
        minorities:
          value.length > 0 ? value.map(encodeURIComponent).join(",") : null,
      });
      updateUrl(params);
    };

    const setViewState = (value: UrlViewState | null) => {
      let viewString: string | null = null;
      if (value) {
        viewString = [value.latitude, value.longitude, value.zoom]
          .map((n) => n.toFixed(4))
          .join(",");
      }
      const params = buildParams({ view: viewString });
      updateUrl(params);
    };

    const setActiveLayerIndex = (value: number) => {
      const params = buildParams({
        layer: value !== 0 ? String(value) : null,
      });
      updateUrl(params);
    };

    const setTopicFields = (value: string[]) => {
      const params = buildParams({
        topicFields:
          value.length > 0
            ? value.slice(0, MAX_URL_TOPICS).join(",")
            : null,
      });
      updateUrl(params);
    };

    const setTopicSubfields = (value: string[]) => {
      const params = buildParams({
        topicSubfields:
          value.length > 0
            ? value.slice(0, MAX_URL_TOPICS).join(",")
            : null,
      });
      updateUrl(params);
    };

    const setTopicTopics = (value: number[]) => {
      const params = buildParams({
        topicTopics:
          value.length > 0
            ? value.slice(0, MAX_URL_TOPICS).map(String).join(",")
            : null,
      });
      updateUrl(params);
    };

    const setSelectionKey = (value: string | null) => {
      const params = buildParams({ sel: value });
      updateUrl(params);
    };

    return {
      setYearRange,
      setCountries,
      setTypeAndSme,
      setFrameworkProgrammes,
      setEntity,
      setQuery,
      setMinorityGroups,
      setViewState,
      setActiveLayerIndex,
      setTopicFields,
      setTopicSubfields,
      setTopicTopics,
      setSelectionKey,
    };
  }, [buildParams, updateUrl]);

  /** Reset all filters by clearing all URL parameters */
  const resetAll = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  /** Generate query string from current filters (for navigation) */
  const toQueryString = useCallback((): string => {
    const params = new URLSearchParams();

    if (filters.yearRange) {
      params.set(
        PARAM_KEYS.years,
        `${filters.yearRange[0]}-${filters.yearRange[1]}`,
      );
    }

    if (filters.countries.length > 0) {
      params.set(
        PARAM_KEYS.countries,
        filters.countries.map(encodeURIComponent).join(","),
      );
    }

    if (filters.typeAndSme.length > 0) {
      params.set(
        PARAM_KEYS.types,
        filters.typeAndSme.map(encodeURIComponent).join(","),
      );
    }

    if (filters.frameworkProgrammes.length > 0) {
      params.set(
        PARAM_KEYS.fps,
        filters.frameworkProgrammes.map(encodeURIComponent).join(","),
      );
    }

    if (filters.unifiedSearch.entity !== "projects") {
      params.set(PARAM_KEYS.entity, filters.unifiedSearch.entity);
    }

    if (filters.unifiedSearch.query) {
      params.set(PARAM_KEYS.query, filters.unifiedSearch.query);
    }

    if (filters.unifiedSearch.minorityGroups.length > 0) {
      params.set(
        PARAM_KEYS.minorities,
        filters.unifiedSearch.minorityGroups.map(encodeURIComponent).join(","),
      );
    }

    if (filters.viewState) {
      const v = filters.viewState;
      params.set(
        PARAM_KEYS.view,
        [v.latitude, v.longitude, v.zoom].map((n) => n.toFixed(4)).join(","),
      );
    }

    // Note: layer is intentionally excluded — it's scenario-specific
    // and should reset when navigating between scenarios.

    // Topic selections with shared cap (topics > subfields > fields priority)
    let budget = MAX_URL_TOPICS;
    const tt = filters.topicTopics.slice(0, budget);
    budget -= tt.length;
    const tsf = filters.topicSubfields.slice(0, budget);
    budget -= tsf.length;
    const tf = filters.topicFields.slice(0, budget);

    if (tt.length > 0) {
      params.set(PARAM_KEYS.topicTopics, tt.map(String).join(","));
    }
    if (tsf.length > 0) {
      params.set(PARAM_KEYS.topicSubfields, tsf.join(","));
    }
    if (tf.length > 0) {
      params.set(PARAM_KEYS.topicFields, tf.join(","));
    }

    return params.toString();
  }, [filters]);

  return {
    filters,
    setters,
    toQueryString,
    resetAll,
  };
}

export default useFilters;
