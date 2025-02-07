import { InstitutionTopics } from "datamodel/institution/types";
import { useFetch } from "../../useFetch";

export function useInstitutionsTopics() {
  return useFetch<InstitutionTopics[]>("/api/institution/institutions_topics");
}
