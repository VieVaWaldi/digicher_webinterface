"use client";

import { BasePoint } from "datamodel/scenario_points/types";
import { FC, useState } from "react";
import { RadioGroup, RadioGroupItem } from "shadcn/radio-group";
import { Label } from "shadcn/label";

// Define the domain options
type DomainOption = "all" | "cultural" | "digital";

// Generic fetch hook type that works with any result type
type UseSearchHook<T> = (searchTerm: string) => {
  data: T[] | undefined;
  loading: boolean;
  error: string | null;
};

interface DomainFilterConfig<T> {
  useSearchHook: UseSearchHook<T>;
  idField: keyof T & string;
  idPredicate?: string; // The field name in BasePoint to match against
}

interface DomainFilterResult<T> {
  DomainFilter: FC; // This is the key change - explicit function component type
  filterPredicate: (point: BasePoint) => boolean;
}

export default function useDomainFilterSimple<T>({
  useSearchHook,
  idField,
  idPredicate = idField,
}: DomainFilterConfig<T>): DomainFilterResult<T> {
  // State for the selected domain
  const [selectedDomain, setSelectedDomain] = useState<DomainOption>("all");

  // Create search terms based on the selected domain
  const searchTerm =
    selectedDomain === "all"
      ? ""
      : selectedDomain === "cultural"
        ? "cultural heritage"
        : "digital heritage";

  // Use the provided search hook to get results
  const { data: searchResults } = useSearchHook(searchTerm);

  // Extract IDs from search results
  const resultIds: (string | number)[] =
    searchResults?.map((result) => String(result[idField])) ?? [];

  // Define the DomainFilter as a proper function component
  const DomainFilter: FC = () => (
    <RadioGroup
      defaultValue="all"
      value={selectedDomain}
      onValueChange={(value) => setSelectedDomain(value as DomainOption)}
      className="flex flex-row space-x-4"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="all" id="domain-all" />
        <Label htmlFor="domain-all" className="text-gray-600 md:text-xl">
          All
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="cultural" id="domain-cultural" />
        <Label htmlFor="domain-cultural" className="text-gray-600 md:text-xl">
          Cultural Heritage
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="digital" id="domain-digital" />
        <Label htmlFor="domain-digital" className="text-gray-600 md:text-xl">
          Digital Heritage
        </Label>
      </div>
    </RadioGroup>
  );

  // Create the predicate function for filtering
  const filterPredicate = (point: BasePoint): boolean => {
    // If "All" is selected, include everything
    if (selectedDomain === "all") {
      return true;
    }

    // If no search results or empty search, default to including all
    if (!searchResults || searchResults.length === 0) {
      return false; // Return false when no matches found for specific domains
    }

    // Filter based on the ID match
    // @ts-expect-error - We're accessing a dynamic property
    return resultIds.includes(String(point[idPredicate]));
  };

  return {
    DomainFilter,
    filterPredicate,
  };
}
