import { FundingProgramme } from "datamodel/fundingprogrammes/types";
import { useFetch } from "../../useFetch";

export function useFundingProgrammes() {
  return useFetch<FundingProgramme[]>("/api/fundingprogramme");
}
