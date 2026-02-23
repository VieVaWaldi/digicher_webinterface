import { ReactNode, useCallback, useMemo, useState } from "react";
import { Slider } from "components/mui/Slider";

interface MinProjectBudgetFilterOptions {
  maxBudget: number;
}

interface MinProjectBudgetFilterResult {
  MinProjectBudgetFilter: ReactNode;
  budgetPredicate: (totalCost: number | null | undefined) => boolean;
  minBudget: number;
}

const HELP_TEXT =
  "Hides all project arcs whose total budget is below the selected threshold. " +
  "When the filter is above 0, arcs without budget data are also hidden.";

export default function useMinProjectBudgetFilter({
  maxBudget,
}: MinProjectBudgetFilterOptions): MinProjectBudgetFilterResult {
  const [minBudget, setMinBudget] = useState(0);

  /** Keep slider value in range when data changes. */
  const effectiveMin = Math.min(minBudget, maxBudget);

  /** Step sized to give ~100 increments across the range. */
  const step = useMemo(() => {
    if (maxBudget <= 1) return 1;
    return Math.max(1, Math.pow(10, Math.floor(Math.log10(maxBudget)) - 1));
  }, [maxBudget]);

  const budgetPredicate = useCallback(
    (totalCost: number | null | undefined): boolean => {
      if (effectiveMin <= 0) return true;
      if (totalCost === null || totalCost === undefined) return false;
      return totalCost >= effectiveMin;
    },
    [effectiveMin],
  );

  const handleChange = useCallback((value: number) => {
    setMinBudget(value);
  }, []);

  const MinProjectBudgetFilter: ReactNode = (
    <Slider
      min={0}
      max={maxBudget}
      value={effectiveMin}
      onChange={handleChange}
      step={step}
      label="Min. project budget (€)"
      helpText={HELP_TEXT}
      textFieldWidth={160}
    />
  );

  return {
    MinProjectBudgetFilter,
    budgetPredicate,
    minBudget: effectiveMin,
  };
}