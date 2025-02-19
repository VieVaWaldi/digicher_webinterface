import { useFetch } from "core/hooks/useFetch";
import { FundingProjectPoint } from "datamodel/scenario_points/types";

export function useFundingProjectPoints() {
  return useFetch<FundingProjectPoint[]>(
    "/api/scenario_points/funding_project_points",
  );
}
