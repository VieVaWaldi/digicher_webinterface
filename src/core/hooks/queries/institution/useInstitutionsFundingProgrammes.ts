import { useFetch } from "core/hooks/useFetch";
import { InstitutionFundingProgrammes } from "datamodel/institution/types";

export function useInstitutionFundingProgrammes() {
  return useFetch<InstitutionFundingProgrammes[]>(
    "/api/institution/institutions_fundingprogrammes",
  );
}
