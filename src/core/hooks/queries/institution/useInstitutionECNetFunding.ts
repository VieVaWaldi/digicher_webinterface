import { useFetch } from "core/hooks/useFetch";
import { InstitutionFundingPoint } from "datamodel/institution/types";

export function useInstitutionFundingsPoints() {
  return useFetch<InstitutionFundingPoint[]>(
    "/api/institution/institution_funding",
  );
}
