"use client";

import { ReactNode, useMemo, useState } from "react";
import { MultiSelect } from "shadcn/multi-select";
import { H6 } from "shadcn/typography";

const institutionOptions = [
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

interface TypeAndSmeFilterResult {
  TypeAndSmeFilter: ReactNode;
  typeAndSmePredicate: (type: string | null, sme: boolean | null) => boolean;
}

export default function useTypeAndSmeFilter(): TypeAndSmeFilterResult {
  const [selectedInstitutions, setSelectedInstitutions] = useState<string[]>(
    [],
  );

  const selectedInstitutionSet = useMemo(() => {
    return new Set(selectedInstitutions);
  }, [selectedInstitutions]);

  const TypeAndSmeFilter = (
    <div>
      <H6 className="text-center">Institution Type</H6>
      <MultiSelect
        options={institutionOptions}
        value={selectedInstitutions}
        onValueChange={setSelectedInstitutions}
        placeholder="Select institution types"
        variant="default"
        maxCount={3}
        className="mt-2 w-full"
      />
    </div>
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
