import { useFetch } from "core/hooks/useFetch";
import { InstitutionCollaborationWeights } from "datamodel/scenario_points/types";

export function useCollaborationWeightPoints() {
  return useFetch<InstitutionCollaborationWeights[]>(
    "/api/scenario_points/collaboration_weight_points",
  );
}
