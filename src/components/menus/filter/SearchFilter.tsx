import { useState, useMemo } from "react";
import { Input } from "shadcn/input";
import { H4 } from "shadcn/typography";

interface UseSimpleSearchProps<T> {
  useSearchHook: (query: string) => {
    data?: T[];
    loading: boolean;
    error?: string | null;
  };
  idField: keyof T;
  idPredicate: string;
  searchLabel?: string;
  placeholderText?: string;
}

export default function useSimpleSearch<T>({
  useSearchHook,
  idField,
  idPredicate,
  searchLabel = "Search",
  placeholderText = "Enter search terms...",
}: UseSimpleSearchProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");

  // Get search results from the hook
  const { data: searchResults } = useSearchHook(searchQuery);

  // Create a set of matching IDs for efficient lookup
  const matchingIds = useMemo(() => {
    if (!searchQuery.trim() || !searchResults) {
      return null; // No filter applied when query is empty
    }

    return new Set(searchResults.map((item) => item[idField]));
  }, [searchResults, searchQuery, idField]);

  // Predicate function to filter items
  const searchPredicate = (item: any): boolean => {
    if (!matchingIds) {
      return true; // No filter applied
    }

    return matchingIds.has(item[idPredicate]);
  };

  return {
    searchPredicate,
    searchQuery,
    setSearchQuery,
    searchLabel,
    placeholderText,
  };
}
