import { InstitutionTopics } from "datamodel/junctions/types";
import { useFetch } from "../../useFetch";

export function useInstitutionsTopics() {
  return useFetch<InstitutionTopics[]>("/api/junction/institutions_topics");
}
