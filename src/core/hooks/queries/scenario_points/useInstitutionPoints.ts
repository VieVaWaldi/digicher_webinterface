import { useFetch } from "core/hooks/useFetch";
import { InstitutionPoint } from "datamodel/scenario_points/types";

export function useInstitutionPoints() {
  return useFetch<InstitutionPoint[]>(
    "/api/scenario_points/institution_points",
  );
}
