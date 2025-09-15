"use client";

import { ReactNode, useMemo, useState } from "react";
import { MultiSelect } from "shadcn/multi-select";
import { H6 } from "shadcn/typography";

const frameworkProgrammeOptions = [
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

interface FrameworkProgrammeFilterResult {
  FrameworkProgrammeFilter: ReactNode;
  frameworkProgrammePredicate: (
    frameworkProgrammes: string[] | null,
  ) => boolean;
}

export default function useFrameworkProgrammeFilter(): FrameworkProgrammeFilterResult {
  const [selectedFrameworkProgrammes, setSelectedFrameworkProgrammes] =
    useState<string[]>([]);

  const selectedFrameworkSet = useMemo(() => {
    return new Set(selectedFrameworkProgrammes);
  }, [selectedFrameworkProgrammes]);

  const FrameworkProgrammeFilter = (
    <div>
      <H6 className="text-center">Framework Programme</H6>
      <MultiSelect
        options={frameworkProgrammeOptions}
        onValueChange={setSelectedFrameworkProgrammes}
        defaultValue={selectedFrameworkProgrammes}
        placeholder="Select framework programmes"
        variant="inverted"
        animation={2}
        maxCount={3}
        className="mt-2"
      />
    </div>
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

  return { FrameworkProgrammeFilter, frameworkProgrammePredicate };
}
