import { useFetch } from "core/hooks/useFetch";
import { ProjectSearchResult } from "datamodel/project/types";

export function useProjectsByKeywords(keywords: string) {
  return useFetch<ProjectSearchResult[]>("/api/project/projects_by_keywords", {
    enabled: keywords != null && keywords.length != 0,
    params: { keywords: keywords },
  });
}
