import { useFetch } from "core/hooks/useFetch";
import { InstitutionCollaborators } from "datamodel/scenario_points/types";

export function useInstitutionCollaboratorsById(id: number) {
  return useFetch<InstitutionCollaborators>(
    "/api/scenario_points/collaboration_institutions_by_id",
    {
      enabled: id >= 0,
      params: { institution_id: id },
    },
  );
}