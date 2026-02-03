"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import { SearchEntity } from "@/components/filter/useUnifiedSearchFilter";

/** URL parameter keys for filter persistence */
const PARAM_KEYS = {
  years: "years",
  countries: "countries",
  types: "types",
  fps: "fps",
  entity: "entity",
  query: "q",
  minorities: "minorities",
  view: "view", // format: "lat,lng,zoom" or "lat,lng,zoom,bearing,pitch"
} as const;

/** ViewState stored in URL */
export interface UrlViewState {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
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
}

export interface UseFiltersResult {
  filters: FilterValues;
  setters: FilterSetters;
  toQueryString: () => string;
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

    // Parse viewState: "lat,lng,zoom" or "lat,lng,zoom,bearing,pitch"
    const viewParam = searchParams.get(PARAM_KEYS.view);
    let viewState: UrlViewState | null = null;
    if (viewParam) {
      const parts = viewParam.split(",").map(Number);
      if (parts.length >= 3 && parts.every((n) => !isNaN(n))) {
        viewState = {
          latitude: parts[0],
          longitude: parts[1],
          zoom: parts[2],
          ...(parts[3] !== undefined && { bearing: parts[3] }),
          ...(parts[4] !== undefined && { pitch: parts[4] }),
        };
      }
    }

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
        query: null // Need to overwrite query like changing entities in SearchBar does to prevent RaceCondition
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
        const parts = [value.latitude, value.longitude, value.zoom];
        if (value.bearing !== undefined || value.pitch !== undefined) {
          parts.push(value.bearing ?? 0, value.pitch ?? 0);
        }
        viewString = parts.map((n) => n.toFixed(4)).join(",");
      }
      const params = buildParams({ view: viewString });
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
    };
  }, [buildParams, updateUrl]);

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
      const parts = [v.latitude, v.longitude, v.zoom];
      if (v.bearing !== undefined || v.pitch !== undefined) {
        parts.push(v.bearing ?? 0, v.pitch ?? 0);
      }
      params.set(PARAM_KEYS.view, parts.map((n) => n.toFixed(4)).join(","));
    }

    return params.toString();
  }, [filters]);

  return {
    filters,
    setters,
    toQueryString,
  };
}

export default useFilters;
