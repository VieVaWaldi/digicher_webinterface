import { useProjectSearchByName } from "hooks/queries/project/useProjectSearchByName";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { Input } from "shadcn/input";
import { Spinner } from "shadcn/spinner";
import { H6 } from "shadcn/typography";

interface ProjectSearchFilterResult {
  ProjectSearchFilter: ReactNode;
  projectSearchPredicate: (projectId: string) => boolean;
}

export default function useProjectSearchFilter(): ProjectSearchFilterResult {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeQuery, setActiveQuery] = useState<string>("");

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
        setActiveQuery(searchQuery);
      }
    },
    [searchQuery],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [],
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
      <div>
        <H6 className="text-center">Project Text Search</H6>
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
      handleInputChange,
      handleKeyPress,
      isPending,
    ],
  );

  return {
    ProjectSearchFilter: filter,
    projectSearchPredicate: predicate,
  };
}
