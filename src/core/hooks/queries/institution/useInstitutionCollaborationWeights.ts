import { InstitutionCollaborationWeights } from "datamodel/institution/types";
import { useFetch } from "../../useFetch";

export function useInstitutionCollaborationWeights() {
  return useFetch<InstitutionCollaborationWeights[]>(
    "/api/institution/institution_collaboration_weights",
  );
}
