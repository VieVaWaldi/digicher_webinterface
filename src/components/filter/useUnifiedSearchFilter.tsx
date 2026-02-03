"use client";

import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import { EntityOption, SearchBar } from "../mui/SearchBar";
import { MultiSelectDropdown, MultiSelectOption } from "../mui/MultiSelectDropdown";
import { useInstitutionSearchByName } from "@/hooks/queries/institution/useInstitutionSearchByName";
import { useProjectSearchByName } from "@/hooks/queries/project/useProjectSearchByName";

{
  /* TYPE CONFIG */
}

export type SearchEntity = "institutions" | "projects" | "works";

export interface UnifiedSearchFilterOptions {
  /** Entity options to display in the dropdown. */
  entityOptions: EntityOption[];
  /** Default selected entity. Defaults to "projects". */
  defaultEntity?: SearchEntity;
  /** Whether to show minority groups filter. */
  showMinorityGroups?: boolean;
  /** Controlled initial entity from URL params */
  initialEntity?: SearchEntity;
  /** Controlled initial query from URL params */
  initialQuery?: string;
  /** Controlled initial minority groups from URL params */
  initialMinorityGroups?: string[];
  /** Callback when entity changes (for URL sync) */
  onEntityChange?: (value: SearchEntity) => void;
  /** Callback when query changes (for URL sync) */
  onQueryChange?: (value: string) => void;
  /** Callback when minority groups change (for URL sync) */
  onMinorityGroupsChange?: (value: string[]) => void;
}

export interface UnifiedSearchFilterResult {
  /** The SearchBar UI component with entity selector */
  SearchFilter: ReactNode;
  /** Predicate for filtering institutions by ID */
  institutionSearchPredicate: (institutionId: string) => boolean;
  /** Predicate for filtering projects by ID */
  projectSearchPredicate: (projectId: string) => boolean;
  /** Predicate for filtering works by ID (placeholder) */
  worksSearchPredicate: (workId: string) => boolean;
  /** The currently selected search entity */
  selectedEntity: SearchEntity;
  /** The current search query */
  searchQuery: string;
  /** The minority groups filter UI (filters projects regardless of selected entity) */
  MinorityGroupsFilter: ReactNode;
}

{
  /* MINORITY GROUPS CONFIG */
}

const MINORITY_GROUP_OPTIONS: MultiSelectOption[] = [
  { value: "ladin", label: "Ladin" },
  { value: "sami", label: "Sámi" },
  { value: "jewish", label: "Jewish" },
];

const MINORITY_SEARCH_TERMS: Record<string, string> = {
  ladin: "ladin ladino gardenese badiese fascian marebbano ampezzan",
  sami: "sami sámi saami sapmi same joik yoik",
  jewish: "jewish jew jews judaism hebrew yiddish",
};

{
  /* HOOK */
}

export default function useUnifiedSearchFilter(
  options: UnifiedSearchFilterOptions,
): UnifiedSearchFilterResult {
  const {
    entityOptions,
    defaultEntity = "projects",
    showMinorityGroups = true,
    initialEntity,
    initialQuery,
    initialMinorityGroups,
    onEntityChange,
    onQueryChange,
    onMinorityGroupsChange,
  } = options;

  {
    /*SHARED STATE */
  }

  const [searchEntity, setSearchEntity] = useState<SearchEntity>(
    initialEntity ?? defaultEntity
  );
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery ?? "");
  const [activeQuery, setActiveQuery] = useState<string>(initialQuery ?? "");
  const [selectedMinorityGroups, setSelectedMinorityGroups] = useState<
    string[]
  >(initialMinorityGroups ?? []);

  // Sync state when initial values change (browser nav)
  useEffect(() => {
    if (initialEntity !== undefined) {
      setSearchEntity(initialEntity);
    }
  }, [initialEntity]);

  useEffect(() => {
    if (initialQuery !== undefined) {
      setSearchQuery(initialQuery);
      setActiveQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (initialMinorityGroups !== undefined) {
      setSelectedMinorityGroups(initialMinorityGroups);
    }
  }, [initialMinorityGroups]);

  {
    /* INSTITUTION SEARCH */
  }

  const isInstitutionSearch = searchEntity === "institutions";

  const { data: institutionResults = [], isPending: isInstitutionPending } =
    useInstitutionSearchByName(activeQuery, {
      enabled: isInstitutionSearch && !!activeQuery,
    });

  const institutionIdSet = useMemo(() => {
    if (
      !isInstitutionSearch ||
      !activeQuery ||
      institutionResults.length === 0
    ) {
      return null;
    }
    return new Set(institutionResults.map((result) => result.id));
  }, [isInstitutionSearch, activeQuery, institutionResults]);

  const institutionSearchPredicate = useCallback(
    (institutionId: string): boolean => {
      if (!isInstitutionSearch) return true;
      if (!activeQuery) return true;
      if (!institutionIdSet) return false;
      return institutionIdSet.has(institutionId);
    },
    [isInstitutionSearch, activeQuery, institutionIdSet],
  );

  {
    /* PROJECT SEARCH (with minority groups support) */
  }

  const isProjectSearch = searchEntity === "projects";

  // Minority terms query (works independently of selected entity)
  const minorityTermsQuery = useMemo(() => {
    return selectedMinorityGroups
      .map((group) => MINORITY_SEARCH_TERMS[group] || "")
      .filter(Boolean)
      .join(" ");
  }, [selectedMinorityGroups]);

  // Full project query combines text search (when project selected) with minority terms
  const fullProjectQuery = useMemo(() => {
    if (isProjectSearch) {
      return [searchQuery, minorityTermsQuery].filter(Boolean).join(" ");
    }
    return minorityTermsQuery;
  }, [isProjectSearch, searchQuery, minorityTermsQuery]);

  // Determine if project filter is active (either project search or minority filter)
  const hasActiveProjectFilter =
    (isProjectSearch && !!activeQuery) || selectedMinorityGroups.length > 0;

  // The query to use for project search
  const projectFilterQuery = isProjectSearch ? activeQuery : minorityTermsQuery;

  const { data: projectResults = [], isPending: isProjectPending } =
    useProjectSearchByName(projectFilterQuery, {
      enabled: hasActiveProjectFilter && !!projectFilterQuery,
    });

  const projectIdSet = useMemo(() => {
    if (
      !hasActiveProjectFilter ||
      !projectFilterQuery ||
      projectResults.length === 0
    ) {
      return null;
    }
    return new Set(projectResults.map((result) => result.id));
  }, [hasActiveProjectFilter, projectFilterQuery, projectResults]);

  const projectSearchPredicate = useCallback(
    (projectId: string): boolean => {
      if (!hasActiveProjectFilter) return true;
      if (!projectFilterQuery) return true;
      if (!projectIdSet) return false;
      return projectIdSet.has(projectId);
    },
    [hasActiveProjectFilter, projectFilterQuery, projectIdSet],
  );

  {
    /* WORKS SEARCH (placeholder) */
  }

  const isWorksSearch = searchEntity === "works";

  // TODO: Implement works search when the hook is available
  // const { data: worksResults = [], isPending: isWorksPending } =
  //   useWorksSearchByName(activeQuery, {
  //     enabled: isWorksSearch && !!activeQuery,
  //   });

  const worksSearchPredicate = useCallback(
    (_workId: string): boolean => {
      if (!isWorksSearch) return true;
      // TODO: Implement when works search is available
      return true;
    },
    [isWorksSearch],
  );

  {
    /* EVENT HANDLERS */
  }

  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleSearchStart = useCallback(
    (key: string) => {
      if (key !== "Enter") return;

      if (isProjectSearch) {
        // Use full query with minority terms for projects
        setActiveQuery(fullProjectQuery);
      } else {
        setActiveQuery(searchQuery);
      }
      // Notify URL sync on search
      onQueryChange?.(searchQuery);
    },
    [isProjectSearch, fullProjectQuery, searchQuery, onQueryChange],
  );

  const handleSearchClear = useCallback(() => {
    setSearchQuery("");
    setActiveQuery("");
    onQueryChange?.("");
  }, [onQueryChange]);

  const handleEntityChange = useCallback(
    (value: string) => {
      setSearchEntity(value as SearchEntity);
      // Reset search when changing entity
      setActiveQuery("");
      setSearchQuery("");
      onQueryChange?.("");
      onEntityChange?.(value as SearchEntity);
    },
    [onEntityChange, onQueryChange]
  );

  const handleMinorityGroupsChange = useCallback(
    (groups: string[]) => {
      setSelectedMinorityGroups(groups);
      onMinorityGroupsChange?.(groups);

      // Auto-trigger search when minority groups change
      // When project search: update activeQuery with full query (text + minority terms)
      // When other entity: minority filter works independently via projectFilterQuery
      if (isProjectSearch) {
        const minorityTerms = groups
          .map((group) => MINORITY_SEARCH_TERMS[group] || "")
          .filter(Boolean)
          .join(" ");

        const newFullQuery = [searchQuery, minorityTerms]
          .filter(Boolean)
          .join(" ");

        setActiveQuery(newFullQuery);
      }
      // When not project search, minorityTermsQuery updates automatically via useMemo
    },
    [isProjectSearch, searchQuery, onMinorityGroupsChange],
  );

  {
    /* COMPUTED VALUES */
  }

  // const isPending = isInstitutionSearch
  //   ? isInstitutionPending
  //   : isProjectSearch
  //     ? isProjectPending
  //     : false;
  //
  // const resultCount = isInstitutionSearch
  //   ? institutionResults.length
  //   : isProjectSearch
  //     ? projectResults.length
  //     : 0;

  const entityLabel = isInstitutionSearch
    ? "institution"
    : isProjectSearch
      ? "project"
      : "work";

  {
    /* UI COMPONENTS */
  }

  const SearchFilter: ReactNode = useMemo(
    () => (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <SearchBar
          value={searchQuery}
          placeholder={`Search ...`}
          onSearch={handleSearchInput}
          onSearchStart={handleSearchStart}
          onClear={handleSearchClear}
          entityOptions={entityOptions}
          selectedEntity={searchEntity}
          onEntityChange={handleEntityChange}
        />
        {/*  <Typography variant="caption" color="text.secondary">*/}
        {/*    Words separated by spaces are searched with OR logic*/}
        {/*  </Typography>*/}
      </Box>
    ),
    [
      entityLabel,
      handleSearchInput,
      handleSearchStart,
      entityOptions,
      searchEntity,
      handleEntityChange,
      isProjectSearch,
      isWorksSearch,
    ],
  );

  const MinorityGroupsFilter: ReactNode = useMemo(
    () =>
      showMinorityGroups ? (
        <MultiSelectDropdown
          options={MINORITY_GROUP_OPTIONS}
          value={selectedMinorityGroups}
          onChange={handleMinorityGroupsChange}
          placeholder="Select ethnic groups"
          maxChips={3}
        />
      ) : null,
    [showMinorityGroups, selectedMinorityGroups, handleMinorityGroupsChange],
  );

  return {
    SearchFilter,
    institutionSearchPredicate,
    projectSearchPredicate,
    worksSearchPredicate,
    selectedEntity: searchEntity,
    searchQuery: isProjectSearch ? fullProjectQuery : searchQuery,
    MinorityGroupsFilter,
  };
}
