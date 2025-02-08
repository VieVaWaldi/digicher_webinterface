import { ProjectCoordinatorPoint } from "datamodel/project/types";
import { useFetch } from "../../useFetch";

export function useProjectsCoordinatorPoints() {
  return useFetch<ProjectCoordinatorPoint[]>(
    "/api/project/project_coordinators_points",
  );
}
