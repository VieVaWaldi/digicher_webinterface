import { InstitutionTopics } from "datamodel/institution/types";
import { useFetch } from "../useFetch";

export function useInstitutionTopics() {
  return useFetch<InstitutionTopics[]>("/api/institution_topics");
}
