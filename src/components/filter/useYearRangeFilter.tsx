import { useProjectYearRange } from "hooks/queries/project/useProjectYearRange";
import { ReactNode, useMemo, useState } from "react";
import { DualRangeSlider } from "shadcn/dual-range-slider";
import { H6 } from "shadcn/typography";

interface YearRangeFilterResult {
  YearRangeFilter: ReactNode;
  yearRangePredicate: (startDate: string, endDate: string) => boolean;
  minYear: number;
  maxYear: number;
}

export default function useYearRangeFilter(): YearRangeFilterResult {
  const { data: { minStartDate = 1985, maxEndDate = 2035 } = {} } =
    useProjectYearRange();
  const [years, setYears] = useState<number[]>(() => [
    minStartDate,
    maxEndDate,
  ]);
  const [minYear, maxYear] = useMemo(() => [years[0], years[1]], [years]);

  const predicate = useMemo(
    () => (startDate: string, endDate: string) => {
      if (!startDate || !endDate) return false;

      // Extract years directly from ISO strings (faster than new Date())
      const projectStartYear = parseInt(startDate.substring(0, 4), 10);
      const projectEndYear = parseInt(endDate.substring(0, 4), 10);

      return maxYear >= projectStartYear && minYear <= projectEndYear;
    },
    [minYear, maxYear],
  );

  const filter = (
    <div>
      <H6 className="text-center">Time Range</H6>
      <DualRangeSlider
        className="mt-8"
        label={(value: number | undefined) => value}
        value={years}
        onValueChange={setYears}
        min={minStartDate}
        max={maxEndDate}
        step={1}
      />
    </div>
  );

  return {
    YearRangeFilter: filter,
    yearRangePredicate: predicate,
    minYear,
    maxYear,
  };
}
