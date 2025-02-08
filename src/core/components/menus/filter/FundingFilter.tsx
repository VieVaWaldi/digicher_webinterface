import { useFundingProgrammes } from "core/hooks/queries/fundingprogramme/useFundingProgrammes";
import { useMemo } from "react";
import { MultiSelect } from "shadcn/multi-select";
import { Spinner } from "shadcn/spinner";

interface FundingFilterProps {
  setFrameworksFilter: (value: string[]) => void;
  setCodeFilter: (value: string[]) => void;
}

export default function FundingFilter({
  setFrameworksFilter,
  setCodeFilter,
}: FundingFilterProps) {
  const { data: funding, loading, error } = useFundingProgrammes();

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

  if (loading) {
    return (
      <div className="flex h-24 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 md:flex-row">
      <MultiSelect
        options={frameworkOptions}
        onValueChange={setFrameworksFilter}
        placeholder="Select Framework"
        variant="inverted"
        maxCount={6}
      />
      <MultiSelect
        options={codeOptions}
        onValueChange={setCodeFilter}
        placeholder="Select Code"
        variant="default"
        maxCount={6}
      />
    </div>
  );
}
