import { InstitutionFundingProgrammes } from "datamodel/junctions/types";
import { useFetch } from "../../useFetch";

export function useInstitutionFundingProgrammes() {
  return useFetch<InstitutionFundingProgrammes[]>(
    "/api/junction/institution_fundingprogramme",
  );
}
