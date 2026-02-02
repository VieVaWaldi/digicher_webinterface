import { useProjectSearchByName } from "hooks/queries/project/useProjectSearchByName";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { Box, TextField, Typography, CircularProgress } from "@mui/material";
import { MultiSelectDropdown, MultiSelectOption } from "components/mui/MultiSelectDropdown";

const minorityGroupOptions: MultiSelectOption[] = [
  { value: "ladin", label: "Ladin" },
  { value: "sami", label: "Sámi" },
  { value: "jewish", label: "Jewish" },
];

const minoritySearchTerms = {
  ladin: "ladin ladino gardenese badiese fascian marebbano ampezzan",
  sami: "sami sámi saami sapmi same joik yoik",
  jewish: "jewish jew jews judaism hebrew yiddish",
};

interface ProjectSearchFilterResult {
  ProjectSearchFilter: ReactNode;
  projectSearchPredicate: (projectId: string) => boolean;
  projectSearchQuery: string;
  MinorityGroupsFilter: ReactNode;
}

export default function useProjectSearchFilter(): ProjectSearchFilterResult {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeQuery, setActiveQuery] = useState<string>("");
  const [selectedMinorityGroups, setSelectedMinorityGroups] = useState<
    string[]
  >([]);

  // Combine text search query with minority group terms
  const fullSearchQuery = useMemo(() => {
    const minorityTerms = selectedMinorityGroups
      .map(
        (group) =>
          minoritySearchTerms[group as keyof typeof minoritySearchTerms],
      )
      .join(" ");

    return [searchQuery, minorityTerms].filter(Boolean).join(" ");
  }, [searchQuery, selectedMinorityGroups]);

  const { data: searchResults = [], isPending } = useProjectSearchByName(
    activeQuery,
    {
      enabled: !!activeQuery,
    },
  );

  const projectIdSet = useMemo(() => {
    if (!activeQuery || searchResults.length === 0) return null;
    return new Set(searchResults.map((result) => result.id));
  }, [activeQuery, searchResults]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        setActiveQuery(fullSearchQuery);
      }
    },
    [fullSearchQuery],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [],
  );

  // Trigger search when minority groups change
  const handleMinorityGroupsChange = useCallback(
    (groups: string[]) => {
      setSelectedMinorityGroups(groups);
      // Auto-trigger search when minority groups change
      const newFullQuery = [
        searchQuery,
        groups
          .map(
            (group) =>
              minoritySearchTerms[group as keyof typeof minoritySearchTerms],
          )
          .join(" "),
      ]
        .filter(Boolean)
        .join(" ");
      setActiveQuery(newFullQuery);
    },
    [searchQuery],
  );

  const predicate = useMemo(
    () => (projectId: string) => {
      if (!activeQuery) return true;
      if (!projectIdSet) return false;
      return projectIdSet.has(projectId);
    },
    [activeQuery, projectIdSet],
  );

  const MinorityGroupsFilter = (
    <MultiSelectDropdown
      options={minorityGroupOptions}
      value={selectedMinorityGroups}
      onChange={handleMinorityGroupsChange}
      placeholder="Select ethnic groups"
      maxChips={3}
    />
  );

  const filter = useMemo(
    () => (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          fullWidth
          placeholder="Search titles & objectives (press Enter)..."
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 1,
              "& fieldset": {
                borderColor: "divider",
              },
              "&:hover fieldset": {
                borderColor: "text.secondary",
              },
              "&.Mui-focused fieldset": {
                borderColor: "primary.main",
                borderWidth: 1,
              },
            },
          }}
        />
        <Typography variant="caption" color="text.secondary">
          Words separated by spaces are searched with OR logic
        </Typography>

        {activeQuery && (
          <Typography variant="body2" color="text.secondary">
            {searchResults.length > 0 ? (
              `Found ${searchResults.length} project(s)`
            ) : isPending ? (
              <CircularProgress size={16} />
            ) : (
              "No projects found"
            )}
          </Typography>
        )}
      </Box>
    ),
    [
      searchQuery,
      activeQuery,
      searchResults,
      handleInputChange,
      handleKeyPress,
      isPending,
    ],
  );

  return {
    ProjectSearchFilter: filter,
    projectSearchPredicate: predicate,
    projectSearchQuery: fullSearchQuery,
    MinorityGroupsFilter,
  };
}
