import { useProjectYearRange } from "hooks/queries/project/useProjectYearRange";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { DualSlider } from "components/mui/DualSlider";

interface YearRangeFilterOptions {
  defaultMinYear?: number;
  defaultMaxYear?: number;
}

interface YearRangeFilterResult {
  YearRangeFilter: ReactNode;
  yearRangePredicate: (startDate: string, endDate: string) => boolean;
  minYear: number;
  maxYear: number;
}

export default function useYearRangeFilter(
  options: YearRangeFilterOptions = {},
): YearRangeFilterResult {
  const { defaultMinYear, defaultMaxYear } = options;

  const { data: { minStartDate = 1985, maxEndDate = 2035 } = {} } =
    useProjectYearRange();

  const [years, setYears] = useState<[number, number]>(() => [
    defaultMinYear ?? minStartDate,
    defaultMaxYear ?? maxEndDate,
  ]);

  const [minYear, maxYear] = useMemo(() => [years[0], years[1]], [years]);

  const handleYearsChange = useCallback((value: [number, number]) => {
    setYears(value);
  }, []);

  const predicate = useMemo(
    () => (startDate: string, endDate: string) => {
      if (!startDate || !endDate) return false;
      const projectStartYear = parseInt(startDate.substring(0, 4), 10);
      const projectEndYear = parseInt(endDate.substring(0, 4), 10);
      return maxYear >= projectStartYear && minYear <= projectEndYear;
    },
    [minYear, maxYear],
  );

  const filter = (
    <DualSlider
      min={minStartDate}
      max={maxEndDate}
      value={years}
      onChange={handleYearsChange}
      step={1}
      fromLabel="From"
      toLabel="To"
    />
  );

  return {
    YearRangeFilter: filter,
    yearRangePredicate: predicate,
    minYear,
    maxYear,
  };
}
