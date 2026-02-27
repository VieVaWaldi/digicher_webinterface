"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export type ListEntity = "projects" | "works" | "institutions";

export interface ListFilters {
  entity: ListEntity;
  q: string;
  page: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  // projects
  minYear?: number;
  maxYear?: number;
  fps: string[];
  institution?: string;
  collaboratorId?: string;
  projectId?: string;
  topicIds: string[];
  subfieldIds: string[];
  fieldIds: string[];
  // works
  workType?: string;
  // institutions
  countries: string[];
  instTypes: string[];
  sme?: boolean;
}

function parseFilters(params: URLSearchParams): ListFilters {
  const entity = (params.get("entity") as ListEntity) || "projects";
  const defaultSortBy = entity === "institutions" ? "name" : "relevance";
  const defaultSortOrder: "asc" | "desc" = entity === "institutions" ? "asc" : "desc";
  return {
    entity,
    q: params.get("q") || "",
    page: parseInt(params.get("page") || "0"),
    sortBy: params.get("sort") || defaultSortBy,
    sortOrder: (params.get("sortOrder") as "asc" | "desc") || defaultSortOrder,
    minYear: params.get("minYear") ? parseInt(params.get("minYear")!) : undefined,
    maxYear: params.get("maxYear") ? parseInt(params.get("maxYear")!) : undefined,
    fps: params.get("fps")?.split(",").filter(Boolean) ?? [],
    institution: params.get("institution") || undefined,
    collaboratorId: params.get("collaboratorId") || undefined,
    projectId: params.get("projectId") || undefined,
    topicIds: params.get("topicIds")?.split(",").filter(Boolean) ?? [],
    subfieldIds: params.get("subfieldIds")?.split(",").filter(Boolean) ?? [],
    fieldIds: params.get("fieldIds")?.split(",").filter(Boolean) ?? [],
    workType: params.get("type") || undefined,
    countries: params.get("countries")?.split(",").filter(Boolean) ?? [],
    instTypes: params.get("instTypes")?.split(",").filter(Boolean) ?? [],
    sme: params.get("sme") === "true" ? true : undefined,
  };
}

function buildQueryString(filters: ListFilters): string {
  const p = new URLSearchParams();
  p.set("entity", filters.entity);
  if (filters.q) p.set("q", filters.q);
  if (filters.page) p.set("page", filters.page.toString());
  const defaultSortBy = filters.entity === "institutions" ? "name" : "relevance";
  const defaultSortOrder = filters.entity === "institutions" ? "asc" : "desc";
  if (filters.sortBy !== defaultSortBy) p.set("sort", filters.sortBy);
  if (filters.sortOrder !== defaultSortOrder) p.set("sortOrder", filters.sortOrder);
  if (filters.minYear) p.set("minYear", filters.minYear.toString());
  if (filters.maxYear) p.set("maxYear", filters.maxYear.toString());
  if (filters.fps.length) p.set("fps", filters.fps.join(","));
  if (filters.institution) p.set("institution", filters.institution);
  if (filters.collaboratorId) p.set("collaboratorId", filters.collaboratorId);
  if (filters.projectId) p.set("projectId", filters.projectId);
  if (filters.topicIds.length) p.set("topicIds", filters.topicIds.join(","));
  if (filters.subfieldIds.length) p.set("subfieldIds", filters.subfieldIds.join(","));
  if (filters.fieldIds.length) p.set("fieldIds", filters.fieldIds.join(","));
  if (filters.workType) p.set("type", filters.workType);
  if (filters.countries.length) p.set("countries", filters.countries.join(","));
  if (filters.instTypes.length) p.set("instTypes", filters.instTypes.join(","));
  if (filters.sme) p.set("sme", "true");
  return p.toString();
}

export function useListFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFiltersState] = useState<ListFilters>(() =>
    parseFilters(searchParams),
  );

  // Track current filters in a ref so setFilters can read them without
  // going through the setState updater (calling router.push inside a
  // setState updater causes the "Cannot update while rendering" error).
  const filtersRef = useRef<ListFilters>(filters);
  filtersRef.current = filters;

  // Sync state when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const parsed = parseFilters(searchParams);
    setFiltersState(parsed);
    filtersRef.current = parsed;
  }, [searchParams]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushToUrl = useCallback(
    (newFilters: ListFilters, immediate = false) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      const update = () => {
        const qs = buildQueryString(newFilters);
        router.push(`/list?${qs}`, { scroll: false });
      };
      if (immediate) {
        update();
      } else {
        debounceRef.current = setTimeout(update, 400);
      }
    },
    [router],
  );

  const setFilters = useCallback(
    (updater: Partial<ListFilters> | ((prev: ListFilters) => ListFilters), immediate = false) => {
      const prev = filtersRef.current;
      const next =
        typeof updater === "function"
          ? updater(prev)
          : { ...prev, ...updater };
      filtersRef.current = next;
      setFiltersState(next);
      pushToUrl(next, immediate);
    },
    [pushToUrl],
  );

  const setEntity = useCallback(
    (entity: ListEntity) => {
      setFilters({ entity, page: 0, q: "" }, true);
    },
    [setFilters],
  );

  const setQ = useCallback(
    (q: string) => {
      setFilters({ q, page: 0 });
    },
    [setFilters],
  );

  const setPage = useCallback(
    (page: number) => {
      setFilters({ page }, true);
    },
    [setFilters],
  );

  const setSort = useCallback(
    (sortBy: string, sortOrder: "asc" | "desc") => {
      setFilters({ sortBy, sortOrder, page: 0 }, true);
    },
    [setFilters],
  );

  const setMinYear = useCallback(
    (minYear: number | undefined) => {
      setFilters({ minYear, page: 0 });
    },
    [setFilters],
  );

  const setMaxYear = useCallback(
    (maxYear: number | undefined) => {
      setFilters({ maxYear, page: 0 });
    },
    [setFilters],
  );

  const setFps = useCallback(
    (fps: string[]) => {
      setFilters({ fps, page: 0 }, true);
    },
    [setFilters],
  );

  const clearInstitution = useCallback(() => {
    setFilters({ institution: undefined, page: 0 }, true);
  }, [setFilters]);

  const clearCollaboratorId = useCallback(() => {
    setFilters({ collaboratorId: undefined, page: 0 }, true);
  }, [setFilters]);

  const clearProjectId = useCallback(() => {
    setFilters({ projectId: undefined, page: 0 }, true);
  }, [setFilters]);

  const setTopicIds = useCallback(
    (topicIds: string[]) => {
      setFilters({ topicIds, page: 0 }, true);
    },
    [setFilters],
  );

  const setSubfieldIds = useCallback(
    (subfieldIds: string[]) => {
      setFilters({ subfieldIds, page: 0 }, true);
    },
    [setFilters],
  );

  const setFieldIds = useCallback(
    (fieldIds: string[]) => {
      setFilters({ fieldIds, page: 0 }, true);
    },
    [setFilters],
  );

  const clearTopicFilters = useCallback(() => {
    setFilters({ topicIds: [], subfieldIds: [], fieldIds: [], page: 0 }, true);
  }, [setFilters]);

  const setWorkType = useCallback(
    (workType: string | undefined) => {
      setFilters({ workType, page: 0 }, true);
    },
    [setFilters],
  );

  const setCountries = useCallback(
    (countries: string[]) => {
      setFilters({ countries, page: 0 }, true);
    },
    [setFilters],
  );

  const setInstTypes = useCallback(
    (instTypes: string[]) => {
      setFilters({ instTypes, page: 0 }, true);
    },
    [setFilters],
  );

  const setSme = useCallback(
    (sme: boolean | undefined) => {
      setFilters({ sme, page: 0 }, true);
    },
    [setFilters],
  );

  return {
    filters,
    setEntity,
    setQ,
    setPage,
    setSort,
    setMinYear,
    setMaxYear,
    setFps,
    clearInstitution,
    clearCollaboratorId,
    clearProjectId,
    setTopicIds,
    setSubfieldIds,
    setFieldIds,
    clearTopicFilters,
    setWorkType,
    setCountries,
    setInstTypes,
    setSme,
  };
}
