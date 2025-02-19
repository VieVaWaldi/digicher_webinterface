import { useFetch } from "core/hooks/useFetch";
import { ProjectTopics } from "datamodel/project/types";

export function useProjectsTopics() {
  return useFetch<ProjectTopics[]>("/api/project/projects_topics");
}
