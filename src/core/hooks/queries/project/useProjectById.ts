import { useFetch } from "core/hooks/useFetch";
import { Project } from "datamodel/project/types";

export function useProjectById(id: string) {
  return useFetch<Project>("/api/project/project_by_id", {
    enabled: id >= "",
    params: { project_id: id },
  });
}
