import { useFetch } from "core/hooks/useFetch";
import { Project } from "datamodel/project/types";

export function useProjectsByIds(ids: string[]) {
  let param_ids: string = "";
  ids.map((id) => (param_ids += `${id},`));
  if (param_ids.slice(-1) === ",") {
    param_ids = param_ids.slice(0, -1);
  }
  return useFetch<Project[]>("/api/project/projects_by_ids", {
    enabled: param_ids.length != 0,
    params: { project_ids: param_ids },
  });
}
