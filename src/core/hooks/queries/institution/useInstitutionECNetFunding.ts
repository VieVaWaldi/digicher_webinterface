import { InstitutionECNetFunding } from "datamodel/institution/types";
import { useFetch } from "../../useFetch";

export function useInstitutionECNetFundings() {
  return useFetch<InstitutionECNetFunding[]>(
    "/api/institution/institution_ecnet_funding",
  );
}
