import { useFetch } from "core/hooks/useFetch";
import { FundingInstitutionPoint } from "datamodel/scenario_points/types";

export function useFundingInstitutionPoints() {
  return useFetch<FundingInstitutionPoint[]>(
    "/api/scenario_points/funding_institution_points",
  );
}
