import { useFetch } from "core/hooks/useFetch";
import { ProjectCoordinatorPoint } from "datamodel/scenario_points/types";

export function useProjectsCoordinatorPoints() {
  return useFetch<ProjectCoordinatorPoint[]>(
    "/api/scenario_points/project_coordinator_points",
  );
}
