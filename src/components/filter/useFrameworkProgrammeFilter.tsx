"use client";

import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { MultiSelectDropdown, MultiSelectOption } from "components/mui/MultiSelectDropdown";

const frameworkProgrammeOptions: MultiSelectOption[] = [
  { value: "PRE_FWP", label: "Pre-Framework (before 1984)" },
  { value: "FP1", label: "FP1 (1984-1987)" },
  { value: "FP2", label: "FP2 (1987-1991)" },
  { value: "FP3", label: "FP3 (1990-1994)" },
  { value: "FP4", label: "FP4 (1994-1998)" },
  { value: "FP5", label: "FP5 (1998-2002)" },
  { value: "FP6", label: "FP6 (2002-2006)" },
  { value: "FP7", label: "FP7 (2007-2013)" },
  { value: "H2020", label: "Horizon 2020 (2014-2020)" },
  { value: "HORIZON", label: "Horizon Europe (2021-2027)" },
  // Special programmes and related initiatives
  { value: "ECSC", label: "ECSC (Coal & Steel Community)" },
  { value: "EAEC_FWP", label: "EAEC Framework Programme" },
  { value: "CIP", label: "CIP (Competitiveness & Innovation)" },
  { value: "IC", label: "International Cooperation" },
  { value: "IC-COST", label: "IC-COST" },
  { value: "JRC", label: "JRC (Joint Research Centre)" },
  { value: "ENV", label: "Environment Programme" },
  { value: "ENG", label: "Engineering Programme" },
  { value: "ET", label: "Emerging Technologies" },
  { value: "IS", label: "Information Society" },
  { value: "HS", label: "Health & Safety" },
];

interface FrameworkProgrammeFilterOptions {
  /** Controlled initial value from URL params */
  initialValue?: string[];
  /** Callback when value changes (for URL sync) */
  onChange?: (value: string[]) => void;
}

interface FrameworkProgrammeFilterResult {
  FrameworkProgrammeFilter: ReactNode;
  frameworkProgrammePredicate: (
    frameworkProgrammes: string[] | null,
  ) => boolean;
  selectedFrameworkProgrammes: string[];
}

export default function useFrameworkProgrammeFilter(
  options: FrameworkProgrammeFilterOptions = {}
): FrameworkProgrammeFilterResult {
  const { initialValue, onChange } = options;
  const [selectedFrameworkProgrammes, setSelectedFrameworkProgrammes] =
    useState<string[]>(initialValue ?? []);

  // Sync state when initialValue changes (browser nav)
  useEffect(() => {
    if (initialValue !== undefined) {
      setSelectedFrameworkProgrammes(initialValue);
    }
  }, [initialValue]);

  const handleChange = useCallback(
    (value: string[]) => {
      setSelectedFrameworkProgrammes(value);
      onChange?.(value);
    },
    [onChange]
  );

  const selectedFrameworkSet = useMemo(() => {
    return new Set(selectedFrameworkProgrammes);
  }, [selectedFrameworkProgrammes]);

  const FrameworkProgrammeFilter = (
    <MultiSelectDropdown
      options={frameworkProgrammeOptions}
      value={selectedFrameworkProgrammes}
      onChange={handleChange}
      placeholder="Select framework programmes"
      maxChips={2}
    />
  );

  const frameworkProgrammePredicate = useMemo(
    () =>
      (frameworkProgrammes: string[] | null): boolean => {
        if (selectedFrameworkSet.size === 0) {
          return true;
        }

        if (!frameworkProgrammes || frameworkProgrammes.length === 0) {
          return (
            selectedFrameworkSet.has("null") || selectedFrameworkSet.size === 0
          );
        }

        // Check if any of the project's framework programmes match our selection
        return frameworkProgrammes.some((fp) => selectedFrameworkSet.has(fp));
      },
    [selectedFrameworkSet],
  );

  return {
    FrameworkProgrammeFilter,
    frameworkProgrammePredicate,
    selectedFrameworkProgrammes,
  };
}
