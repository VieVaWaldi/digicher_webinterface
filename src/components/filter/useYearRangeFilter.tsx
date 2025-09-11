import { ReactNode, useMemo } from "react";
import { DualRangeSlider } from "shadcn/dual-range-slider";
import { H6 } from "shadcn/typography";

interface YearRangeFilterProps {
  years: number[];
  handleYearsChange: (newYears: number[]) => void;
  minStartDate: number;
  maxEndDate: number;
}

interface YearRangeFilterResult {
  YearRangeFilter: ReactNode;
  yearRangePredicate: (startDate: string, endDate: string) => boolean;
}

export default function useYearRangeFilter({
  years,
  handleYearsChange,
  minStartDate,
  maxEndDate,
}: YearRangeFilterProps): YearRangeFilterResult {
  // Pre-compute the year range once
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
        onValueChange={handleYearsChange}
        min={minStartDate}
        max={maxEndDate}
        step={1}
      />
    </div>
  );

  return {
    YearRangeFilter: filter,
    yearRangePredicate: predicate,
  };
}
