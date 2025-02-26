import { useMemo, useState } from "react";

import { H4 } from "shadcn/typography";
import { Spinner } from "shadcn/spinner";
import { MultiSelect } from "shadcn/multi-select";
import { BasePoint } from "datamodel/scenario_points/types";
import { useFundingProgrammes } from "core/hooks/queries/fundingprogramme/useFundingProgrammes";

interface FundingProgrammeFilterResult {
  FundingProgrammeFilter: React.FC;
  fundingProgrammePredicate: (point: BasePoint) => boolean;
}

export default function useFundingProgrammeFilter(): FundingProgrammeFilterResult {
  const [frameworksFilter, setFrameworksFilter] = useState<string[]>([]);
  const [codeFilter, setCodeFilter] = useState<string[]>([]);

  const { data: funding, loading } = useFundingProgrammes();

  const frameworkOptions = useMemo(
    () =>
      Array.from(new Set(funding?.map((p) => p.framework_programme) ?? [])).map(
        (framework) => ({
          value: framework,
          label: framework,
          icon: undefined,
        }),
      ),
    [funding],
  );

  const codeOptions = useMemo(
    () =>
      Array.from(new Set(funding?.map((p) => p.code) ?? [])).map((code) => ({
        value: code,
        label: code,
        icon: undefined,
      })),
    [funding],
  );

  const FundingProgrammeFilter = () => {
    if (loading) {
      return (
        <div className="flex h-12 items-center justify-center">
          <Spinner />
        </div>
      );
    } else {
      return (
        <div className="flex flex-col gap-2">
          <H4 className="ml-2">Funding Programmes</H4>
          <MultiSelect
            options={frameworkOptions}
            value={frameworksFilter}
            defaultValue={frameworksFilter}
            onValueChange={setFrameworksFilter}
            placeholder="Select Framework"
            variant="inverted"
            maxCount={4}
          />
          <MultiSelect
            options={codeOptions}
            value={codeFilter}
            defaultValue={codeFilter}
            onValueChange={setCodeFilter}
            placeholder="Select Code"
            variant="default"
            maxCount={4}
          />
        </div>
      );
    }
  };

  const fundingProgrammePredicate = (point: BasePoint) => {
    const passesFrameworkFilter =
      frameworksFilter.length === 0 ||
      (point.funding_programmes?.some((funding) =>
        frameworksFilter.includes(funding.framework_programme),
      ) ??
        false);
    const passesCodeFilter =
      codeFilter.length === 0 ||
      (point.funding_programmes?.some((funding) =>
        codeFilter.includes(funding.code),
      ) ??
        false);
    return passesFrameworkFilter && passesCodeFilter;
  };

  return { FundingProgrammeFilter, fundingProgrammePredicate };
}
