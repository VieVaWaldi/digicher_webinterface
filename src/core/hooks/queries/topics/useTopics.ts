import { useFetch } from "core/hooks/useFetch";
import { Topic } from "datamodel/topic/types";

export function useTopics() {
  return useFetch<Topic[]>("/api/topics");
}
