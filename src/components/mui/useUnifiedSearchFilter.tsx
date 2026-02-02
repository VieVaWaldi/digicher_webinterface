"use client";

import { ReactNode, useCallback, useMemo, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { SearchBar, EntityOption } from "./SearchBar";
import { MultiSelectDropdown, MultiSelectOption } from "./MultiSelectDropdown";
import { useInstitutionSearchByName } from "hooks/queries/institution/useInstitutionSearchByName";
import { useProjectSearchByName } from "hooks/queries/project/useProjectSearchByName";

// =============================================================================
// TYPES
// =============================================================================

export type SearchEntity = "institutions" | "projects" | "works";

export interface UnifiedSearchFilterOptions {
  /** Entity options to display in the dropdown. */
  entityOptions: EntityOption[];
  /** Default selected entity. Defaults to "projects". */
  defaultEntity?: SearchEntity;
  /** Whether to show minority groups filter (only applies to projects). */
  showMinorityGroups?: boolean;
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
  /** The minority groups filter UI (only rendered when entity is "projects") */
  MinorityGroupsFilter: ReactNode;
}

// =============================================================================
// MINORITY GROUPS CONFIG
// =============================================================================

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

// =============================================================================
// HOOK
// =============================================================================

export default function useUnifiedSearchFilter(
  options: UnifiedSearchFilterOptions
): UnifiedSearchFilterResult {
  const {
    entityOptions,
    defaultEntity = "projects",
    showMinorityGroups = true,
  } = options;

  // ---------------------------------------------------------------------------
  // SHARED STATE
  // ---------------------------------------------------------------------------

  const [searchEntity, setSearchEntity] = useState<SearchEntity>(defaultEntity);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeQuery, setActiveQuery] = useState<string>("");
  const [selectedMinorityGroups, setSelectedMinorityGroups] = useState<string[]>([]);

  // ---------------------------------------------------------------------------
  // INSTITUTION SEARCH
  // ---------------------------------------------------------------------------

  const isInstitutionSearch = searchEntity === "institutions";

  const { data: institutionResults = [], isPending: isInstitutionPending } =
    useInstitutionSearchByName(activeQuery, {
      enabled: isInstitutionSearch && !!activeQuery,
    });

  const institutionIdSet = useMemo(() => {
    if (!isInstitutionSearch || !activeQuery || institutionResults.length === 0) {
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
    [isInstitutionSearch, activeQuery, institutionIdSet]
  );

  // ---------------------------------------------------------------------------
  // PROJECT SEARCH (with minority groups support)
  // ---------------------------------------------------------------------------

  const isProjectSearch = searchEntity === "projects";

  // Combine text search query with minority group terms for projects
  const fullProjectQuery = useMemo(() => {
    if (!isProjectSearch) return "";

    const minorityTerms = selectedMinorityGroups
      .map((group) => MINORITY_SEARCH_TERMS[group] || "")
      .filter(Boolean)
      .join(" ");

    return [searchQuery, minorityTerms].filter(Boolean).join(" ");
  }, [isProjectSearch, searchQuery, selectedMinorityGroups]);

  const { data: projectResults = [], isPending: isProjectPending } =
    useProjectSearchByName(activeQuery, {
      enabled: isProjectSearch && !!activeQuery,
    });

  const projectIdSet = useMemo(() => {
    if (!isProjectSearch || !activeQuery || projectResults.length === 0) {
      return null;
    }
    return new Set(projectResults.map((result) => result.id));
  }, [isProjectSearch, activeQuery, projectResults]);

  const projectSearchPredicate = useCallback(
    (projectId: string): boolean => {
      if (!isProjectSearch) return true;
      if (!activeQuery) return true;
      if (!projectIdSet) return false;
      return projectIdSet.has(projectId);
    },
    [isProjectSearch, activeQuery, projectIdSet]
  );

  // ---------------------------------------------------------------------------
  // WORKS SEARCH (placeholder)
  // ---------------------------------------------------------------------------

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
    [isWorksSearch]
  );

  // ---------------------------------------------------------------------------
  // EVENT HANDLERS
  // ---------------------------------------------------------------------------

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
    },
    [isProjectSearch, fullProjectQuery, searchQuery]
  );

  const handleEntityChange = useCallback((value: string) => {
    setSearchEntity(value as SearchEntity);
    // Reset search when changing entity
    setActiveQuery("");
  }, []);

  const handleMinorityGroupsChange = useCallback(
    (groups: string[]) => {
      setSelectedMinorityGroups(groups);

      // Auto-trigger search when minority groups change (projects only)
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
    },
    [isProjectSearch, searchQuery]
  );

  // ---------------------------------------------------------------------------
  // COMPUTED VALUES
  // ---------------------------------------------------------------------------

  const isPending = isInstitutionSearch
    ? isInstitutionPending
    : isProjectSearch
      ? isProjectPending
      : false;

  const resultCount = isInstitutionSearch
    ? institutionResults.length
    : isProjectSearch
      ? projectResults.length
      : 0;

  const entityLabel = isInstitutionSearch
    ? "institution"
    : isProjectSearch
      ? "project"
      : "work";

  // ---------------------------------------------------------------------------
  // UI COMPONENTS
  // ---------------------------------------------------------------------------

  const SearchFilter: ReactNode = useMemo(
    () => (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <SearchBar
          placeholder={`Search ${entityLabel}s (press Enter)...`}
          onSearch={handleSearchInput}
          onSearchStart={handleSearchStart}
          entityOptions={entityOptions}
          selectedEntity={searchEntity}
          onEntityChange={handleEntityChange}
        />

        {/*{isProjectSearch && (*/}
        {/*  <Typography variant="caption" color="text.secondary">*/}
        {/*    Words separated by spaces are searched with OR logic*/}
        {/*  </Typography>*/}
        {/*)}*/}

        {/*{activeQuery && (*/}
        {/*  <Typography variant="body2" color="text.secondary">*/}
        {/*    {isPending ? (*/}
        {/*      <CircularProgress size={16} />*/}
        {/*    ) : resultCount > 0 ? (*/}
        {/*      `Found ${resultCount} ${entityLabel}(s)`*/}
        {/*    ) : isWorksSearch ? (*/}
        {/*      "Works search not yet implemented"*/}
        {/*    ) : (*/}
        {/*      `No ${entityLabel}s found`*/}
        {/*    )}*/}
        {/*  </Typography>*/}
        {/*)}*/}
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
      activeQuery,
      isPending,
      resultCount,
      isWorksSearch,
    ]
  );

  const MinorityGroupsFilter: ReactNode = useMemo(
    () =>
      showMinorityGroups && isProjectSearch ? (
        <MultiSelectDropdown
          options={MINORITY_GROUP_OPTIONS}
          value={selectedMinorityGroups}
          onChange={handleMinorityGroupsChange}
          placeholder="Select ethnic groups"
          maxChips={3}
        />
      ) : null,
    [
      showMinorityGroups,
      isProjectSearch,
      selectedMinorityGroups,
      handleMinorityGroupsChange,
    ]
  );

  // ---------------------------------------------------------------------------
  // RETURN
  // ---------------------------------------------------------------------------

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