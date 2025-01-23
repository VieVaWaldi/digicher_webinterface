import { InstitutionCollaborators } from "datamodel/institution/types";
import { useFetch } from "../useFetch";

export function useInstitutionCollaboratorsById(id: number) {
  return useFetch<InstitutionCollaborators>(
    "/api/institution_collaborators_by_id",
    {
      enabled: id >= 0,
      params: { institution_id: id },
    }
  );
}