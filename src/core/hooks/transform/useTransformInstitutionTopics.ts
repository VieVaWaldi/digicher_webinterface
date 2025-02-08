import { InstitutionPoint } from "datamodel/institution/types";
import { useTopics } from "../queries/topic/useTopics";
import { useInstitutionsTopics } from "../queries/junction/useInstitutionsTopics";
import { useMemo } from "react";
import {
  InstitutionFundingProgrammes,
  InstitutionTopics,
} from "datamodel/junctions/types";
import { Topic } from "datamodel/topic/types";
import { useFundingProgrammes } from "../queries/fundingprogramme/useFundingProgrammes";
import { FundingProgramme } from "datamodel/fundingprogrammes/types";
import { useInstitutionFundingProgrammes } from "../queries/junction/useInstitutionsFundingProgrammes";

function findTopicIds(data: InstitutionTopics[], id: number): number[] {
  const institution = data.find(
    (institution) => institution.institution_id === id,
  );
  return institution?.topic_ids ?? [];
}

function reduceTopics(ids: number[], topics: Topic[]): Topic[] {
  return topics.filter((topic) => ids.includes(topic.id));
}

function findFundingProgrammeIds(
  data: InstitutionFundingProgrammes[],
  id: number,
): number[] {
  const institution = data.find(
    (institution) => institution.institution_id === id,
  );
  return institution?.funding_ids ?? [];
}

function reduceFundingProgrammes(
  ids: number[],
  funding: FundingProgramme[],
): FundingProgramme[] {
  return funding.filter((funding) => ids.includes(funding.id));
}

export default function useTransformInstitution(
  institutionPoints: InstitutionPoint[] | undefined,
) /**
 * This stitches topics and funding programmes given the junction tables to the institutions
 * so we can save a shit town of bandwidth. We do both in the same place for simpler state management.
 */ {
  const { data: topics, loading, error } = useTopics();
  const { data: junctionsTopics } = useInstitutionsTopics();

  const { data: funding } = useFundingProgrammes();
  const { data: junctionsFunding } = useInstitutionFundingProgrammes();

  const transformedPoints = useMemo(() => {
    if (
      !institutionPoints ||
      !topics ||
      !junctionsTopics ||
      !funding ||
      !junctionsFunding
    )
      return undefined;

    return institutionPoints.map((item) => ({
      ...item,
      topics: reduceTopics(findTopicIds(junctionsTopics, item.id), topics),
      funding_programmes: reduceFundingProgrammes(
        findFundingProgrammeIds(junctionsFunding, item.id),
        funding,
      ),
    }));
  }, [institutionPoints, topics, junctionsTopics, funding, junctionsFunding]);

  return {
    data: transformedPoints,
    loading,
    error,
  };
}
