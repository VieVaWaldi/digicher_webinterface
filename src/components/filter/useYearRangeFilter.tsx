import { useProjectYearRange } from "hooks/queries/project/useProjectYearRange";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { DualSlider } from "components/mui/DualSlider";

interface YearRangeFilterOptions {
  defaultMinYear?: number;
  defaultMaxYear?: number;
  /** Controlled initial value from URL params */
  initialValue?: [number, number] | null;
  /** Callback when value changes (for URL sync) */
  onChange?: (value: [number, number]) => void;
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
  const { defaultMinYear, defaultMaxYear, initialValue, onChange } = options;
  const { data: { minStartDate = 1985, maxEndDate = 2035 } = {} } =
    useProjectYearRange();

  const [years, setYears] = useState<[number, number]>(() => {
    // Priority: initialValue (URL) > defaultMinYear/defaultMaxYear > data defaults
    if (initialValue) return initialValue;
    return [defaultMinYear ?? minStartDate, defaultMaxYear ?? maxEndDate];
  });
  const [minYear, maxYear] = useMemo(() => [years[0], years[1]], [years]);

  // Sync state when initialValue changes (browser nav)
  useEffect(() => {
    if (initialValue) {
      setYears(initialValue);
    }
  }, [initialValue]);

  const handleYearsChange = useCallback(
    (value: [number, number]) => {
      setYears(value);
      onChange?.(value);
    },
    [onChange]
  );

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
