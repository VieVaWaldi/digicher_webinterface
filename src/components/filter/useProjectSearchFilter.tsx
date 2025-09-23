import { useProjectSearchByName } from "hooks/queries/project/useProjectSearchByName";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { Input } from "shadcn/input";
import { MultiSelect } from "shadcn/multi-select";
import { Spinner } from "shadcn/spinner";
import { H6 } from "shadcn/typography";

const minorityGroupOptions = [
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
      if (newFullQuery) {
        setActiveQuery(newFullQuery);
      }
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

  const filter = useMemo(
    () => (
      <div className="space-y-4">
        <div>
          <H6 className="text-center">Minority Groups</H6>
          <MultiSelect
            options={minorityGroupOptions}
            onValueChange={handleMinorityGroupsChange}
            defaultValue={selectedMinorityGroups}
            placeholder="Select minority groups"
            variant="inverted"
            animation={2}
            maxCount={3}
            className="mt-2"
          />
        </div>

        <div>
          <H6 className="text-center">Text Search</H6>
          <Input
            type="text"
            placeholder="Search titles & objectives (press Enter)..."
            value={searchQuery}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="mt-2"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Words separated by spaces are searched with OR logic
          </p>
        </div>

        {activeQuery && (
          <p className="mt-1 text-sm text-muted-foreground">
            {searchResults.length > 0 ? (
              `Found ${searchResults.length} project(s)`
            ) : isPending ? (
              <Spinner className="mt-2" />
            ) : (
              "No projects found"
            )}
          </p>
        )}
      </div>
    ),
    [
      searchQuery,
      activeQuery,
      searchResults,
      selectedMinorityGroups,
      handleInputChange,
      handleKeyPress,
      handleMinorityGroupsChange,
      isPending,
    ],
  );

  return {
    ProjectSearchFilter: filter,
    projectSearchPredicate: predicate,
    projectSearchQuery: fullSearchQuery,
  };
}
