import { InstitutionPoint } from "datamodel/institution/types";
import { useFetch } from "../../useFetch";

export function useInstitutionPoints() {
  return useFetch<InstitutionPoint[]>("/api/institution/institution_points");
}
