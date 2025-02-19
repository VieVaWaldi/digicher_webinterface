import { useFetch } from "core/hooks/useFetch";
import { FundingProgramme } from "datamodel/fundingprogramme/types";

export function useFundingProgrammes() {
  return useFetch<FundingProgramme[]>("/api/fundingprogramme");
}
