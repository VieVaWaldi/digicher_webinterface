"use client";

import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { MultiSelectDropdown, MultiSelectOption } from "components/mui/MultiSelectDropdown";

const institutionOptions: MultiSelectOption[] = [
  {
    value: "Higher or Secondary Education Establishments",
    label: "Higher or Secondary Education",
  },
  { value: "Other", label: "Other" },
  {
    value:
      "Private for-profit entities (excluding Higher or Secondary Education Establishments)",
    label: "Private for-profit entities",
  },
  {
    value:
      "Public bodies (excluding Research Organisations and Secondary or Higher Education Establishments)",
    label: "Public bodies",
  },
  { value: "Research Organisations", label: "Research Organisations" },
  { value: "SME", label: "SME" },
  { value: "Non-SME", label: "Non-SME" },
  { value: "null", label: "Unspecified" },
];

interface TypeAndSmeFilterOptions {
  /** Controlled initial value from URL params */
  initialValue?: string[];
  /** Callback when value changes (for URL sync) */
  onChange?: (value: string[]) => void;
}

interface TypeAndSmeFilterResult {
  TypeAndSmeFilter: ReactNode;
  typeAndSmePredicate: (type: string | null, sme: boolean | null) => boolean;
}

export default function useTypeAndSmeFilter(
  options: TypeAndSmeFilterOptions = {}
): TypeAndSmeFilterResult {
  const { initialValue, onChange } = options;
  const [selectedInstitutions, setSelectedInstitutions] = useState<string[]>(
    initialValue ?? []
  );

  // Sync state when initialValue changes (browser nav)
  useEffect(() => {
    if (initialValue !== undefined) {
      setSelectedInstitutions(initialValue);
    }
  }, [initialValue]);

  const handleChange = useCallback(
    (value: string[]) => {
      setSelectedInstitutions(value);
      onChange?.(value);
    },
    [onChange]
  );

  const selectedInstitutionSet = useMemo(() => {
    return new Set(selectedInstitutions);
  }, [selectedInstitutions]);

  const TypeAndSmeFilter = (
    <MultiSelectDropdown
      options={institutionOptions}
      value={selectedInstitutions}
      onChange={handleChange}
      placeholder="Select institution types"
      maxChips={2}
    />
  );

  const typeAndSmePredicate = useMemo(
    () =>
      (type: string | null, sme: boolean | null): boolean => {
        if (selectedInstitutionSet.size === 0) {
          return true;
        }

        for (const selected of selectedInstitutionSet) {
          if (selected === "null" && type === null && sme === null) {
            return true;
          }

          if (selected === "SME" && sme === true) {
            return true;
          }

          if (selected === "Non-SME" && sme === false) {
            return true;
          }

          if (type === selected) {
            return true;
          }
        }

        return false;
      },
    [selectedInstitutionSet],
  );

  return { TypeAndSmeFilter, typeAndSmePredicate };
}
