import SyncAltIcon from "@mui/icons-material/SyncAlt";
import { Box, Button } from "@mui/material";
import { DualSlider } from "components/mui/DualSlider";
import { SingleSlider } from "components/mui/SingleSlider";
import { useProjectYearRange } from "hooks/queries/project/useProjectYearRange";
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

type SliderMode = "range" | "year";

interface PlayYearFilterOptions {
  defaultMinYear?: number;
  defaultMaxYear?: number;
  /** Controlled initial value from URL params (null means reset to defaults) */
  initialValue?: [number, number] | null;
  /** Callback when value changes (for URL sync) — only fires in range mode */
  onChange?: (value: [number, number]) => void;
  /** Which slider to show by default. Defaults to "range". */
  defaultMode?: SliderMode;
  /** Milliseconds between auto-play steps. Defaults to 1000. */
  playIntervalMs?: number;
}

interface PlayYearFilterResult {
  YearRangeFilter: ReactNode;
  yearRangePredicate: (startDate: string, endDate: string) => boolean;
  minYear: number;
  maxYear: number;
}

export default function usePlayYearFilter(
  options: PlayYearFilterOptions = {},
): PlayYearFilterResult {
  const {
    defaultMinYear,
    defaultMaxYear,
    initialValue,
    onChange,
    defaultMode = "range",
    playIntervalMs = 1000,
  } = options;

  const { data: { minStartDate = 1985, maxEndDate = 2035 } = {} } =
    useProjectYearRange();

  const [mode, setMode] = useState<SliderMode>(defaultMode);

  const [years, setYears] = useState<[number, number]>(() => {
    if (initialValue) return initialValue;
    return [defaultMinYear ?? minStartDate, defaultMaxYear ?? maxEndDate];
  });

  const [singleYear, setSingleYear] = useState<number>(
    () => initialValue?.[1] ?? defaultMaxYear ?? maxEndDate,
  );

  // Keep a ref to years so toggleMode can read the latest without a dep
  const yearsRef = useRef(years);
  yearsRef.current = years;

  const [minYear, maxYear] = useMemo(
    () =>
      mode === "range" ? [years[0], years[1]] : [singleYear, singleYear],
    [mode, years, singleYear],
  );

  // Sync range state when initialValue changes (browser nav or reset)
  useEffect(() => {
    if (initialValue) {
      setYears(initialValue);
    } else if (initialValue === null) {
      setYears([defaultMinYear ?? minStartDate, defaultMaxYear ?? maxEndDate]);
    }
  }, [initialValue, defaultMinYear, defaultMaxYear, minStartDate, maxEndDate]);

  const handleYearsChange = useCallback(
    (value: [number, number]) => {
      setYears(value);
      onChange?.(value);
    },
    [onChange],
  );

  const handleSingleYearChange = useCallback((value: number) => {
    setSingleYear(value);
    // Single year mode is ephemeral — no URL sync
  }, []);

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      if (prev === "range") {
        // Seed single year from current end of range for continuity
        setSingleYear(yearsRef.current[1]);
        return "year";
      }
      return "range";
    });
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
    <Box>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
        <Button
          variant="text"
          size="small"
          startIcon={<SyncAltIcon />}
          onClick={toggleMode}
        >
          {mode === "range" ? "Single Year" : "Year Range"}
        </Button>
      </Box>
      {mode === "range" ? (
        <DualSlider
          min={minStartDate}
          max={maxEndDate}
          value={years}
          onChange={handleYearsChange}
          step={1}
          fromLabel="From"
          toLabel="To"
          playIntervalMs={playIntervalMs}
        />
      ) : (
        <SingleSlider
          min={minStartDate}
          max={maxEndDate}
          value={singleYear}
          onChange={handleSingleYearChange}
          step={1}
          label="Year"
          playIntervalMs={playIntervalMs}
        />
      )}
    </Box>
  );

  return {
    YearRangeFilter: filter,
    yearRangePredicate: predicate,
    minYear,
    maxYear,
  };
}
