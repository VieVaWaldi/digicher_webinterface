import { ProjectCoordinatorPoint } from "datamodel/project/types";
import { useFetch } from "../../useFetch";

export function useProjectCoordinators(year: number) {
  return useFetch<ProjectCoordinatorPoint[]>(
    "/api/project/project_coordinators",
    {
      enabled: true,
      params: { year: year },
    },
  );
}
