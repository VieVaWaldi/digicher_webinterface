
import { InstitutionPoint } from "datamodel/institution/types";
import { useTopics } from "../queries/topics/useTopics";
import { useInstitutionsTopics } from "../queries/institution/useInstitutionsTopics";
import { useEffect } from "react";

export function useTransformInstitutionTopics(
  institutionPoints?: InstitutionPoint[],
) {
  /**
   * A custom hook that takes a dataset of institutions with an attaches the topics to those institutions.
   */
  const {
    data: topics,
    error: errorTopics,
    loading: loadingTopics,
  } = useTopics();
  const {
    data: institutionTopics,
    error: errorInstitutionTopics,
    loading: loadingInstitutionTopics,
  } = useInstitutionsTopics();

//   console.log()

  useEffect(() => {
    if (!institutionPoints || !topics || !institutionTopics) return;
    // do the transformation
  }, [institutionPoints, topics, institutionTopics]);
}
