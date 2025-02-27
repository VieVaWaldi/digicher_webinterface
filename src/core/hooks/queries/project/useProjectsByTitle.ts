import { useFetch } from "core/hooks/useFetch";
import { ProjectSearchResult } from "datamodel/project/types";

export function useProjectsByTitle(title: string) {
  return useFetch<ProjectSearchResult[]>("/api/project/projects_by_title", {
    enabled: title != null && title.length != 0,
    params: { title: title },
  });
}
