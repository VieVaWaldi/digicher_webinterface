import { useFetch } from "core/hooks/useFetch";
import { InstitutionTopics } from "datamodel/institution/types";

export function useInstitutionsTopics() {
  return useFetch<InstitutionTopics[]>("/api/institution/institutions_topics");
}
