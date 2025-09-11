import { ReactNode, useState, useCallback, useMemo } from "react";
import { Input } from "shadcn/input";
import { H6 } from "shadcn/typography";
import { useInstitutionSearchByName } from "hooks/queries/institution/useInstitutionSearchByName";
import { Spinner } from "shadcn/spinner";

interface InstitutionSearchFilterResult {
  InstitutionSearchFilter: ReactNode;
  institutionSearchPredicate: (institutionId: string) => boolean;
}

export default function useInstitutionSearchFilter(): InstitutionSearchFilterResult {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeQuery, setActiveQuery] = useState<string>("");

  const { data: searchResults = [], isPending } = useInstitutionSearchByName(
    activeQuery,
    {
      enabled: !!activeQuery,
    },
  );

  const institutionIdSet = useMemo(() => {
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
    () => (institutionId: string) => {
      if (!activeQuery) return true;
      if (!institutionIdSet) return false;
      return institutionIdSet.has(institutionId);
    },
    [activeQuery, institutionIdSet],
  );

  const filter = useMemo(
    () => (
      <div>
        <H6 className="text-center">Institution Search</H6>
        <Input
          type="text"
          placeholder="Search by name (press Enter)..."
          value={searchQuery}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="mt-2"
        />
        {activeQuery && (
          <p className="mt-1 text-sm text-muted-foreground">
            {searchResults.length > 0 ? (
              `Found ${searchResults.length} institution(s)`
            ) : isPending ? (
              <Spinner className="mt-2" />
            ) : (
              "No institutions found"
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
    InstitutionSearchFilter: filter,
    institutionSearchPredicate: predicate,
  };
}
