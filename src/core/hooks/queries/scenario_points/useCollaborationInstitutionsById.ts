import { useFetch } from "core/hooks/useFetch";
import { InstitutionCollaborators } from "datamodel/scenario_points/types";

export function useCollaborationInstitutionsById(id: string) {
  return useFetch<InstitutionCollaborators[]>(
    "/api/scenario_points/collaboration_institutions_by_id",
    {
      enabled: id != "",
      params: { institution_id: id },
    },
  );
}
