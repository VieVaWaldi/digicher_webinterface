import { Project } from "datamodel/project/types";
import { useFetch } from "../../useFetch";

export function useProjectById(id: number) {
  return useFetch<Project>("/api/project/project_by_id", {
    enabled: id >= 0,
    params: { project_id: id },
  });
}
