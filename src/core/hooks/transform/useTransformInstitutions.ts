import { useMemo } from "react";

import { Topic } from "datamodel/topic/types";
import { BasePoint } from "datamodel/scenario_points/types";
import { FundingProgramme } from "datamodel/fundingprogramme/types";
import { InstitutionFundingProgrammes, InstitutionTopics } from "datamodel/institution/types";

import { useTopics } from "../queries/topic/useTopics";
import { useInstitutionsTopics } from "../queries/institution/useInstitutionsTopics";
import { useFundingProgrammes } from "../queries/fundingprogramme/useFundingProgrammes";
import { useInstitutionFundingProgrammes } from "../queries/institution/useInstitutionsFundingProgrammes";

function createTopicsLookup(
  data: InstitutionTopics[],
): Record<number, number[]> {
  return data.reduce(
    (acc, item) => {
      acc[item.institution_id] = item.topic_ids;
      return acc;
    },
    {} as Record<number, number[]>,
  );
}

function createTopicsMap(topics: Topic[]): Record<number, Topic> {
  return topics.reduce(
    (acc, topic) => {
      acc[topic.id] = topic;
      return acc;
    },
    {} as Record<number, Topic>,
  );
}

function createFundingLookup(
  data: InstitutionFundingProgrammes[],
): Record<number, number[]> {
  return data.reduce(
    (acc, item) => {
      acc[item.institution_id] = item.funding_ids;
      return acc;
    },
    {} as Record<number, number[]>,
  );
}

function createFundingMap(
  funding: FundingProgramme[],
): Record<number, FundingProgramme> {
  return funding.reduce(
    (acc, programme) => {
      acc[programme.id] = programme;
      return acc;
    },
    {} as Record<number, FundingProgramme>,
  );
}

function getTopicsForInstitution(
  institutionId: number,
  topicsLookup: Record<number, number[]>,
  topicsMap: Record<number, Topic>,
): Topic[] {
  const topicIds = topicsLookup[institutionId] || [];
  return topicIds.map((id) => topicsMap[id]).filter(Boolean);
}

function getFundingForInstitution(
  institutionId: number,
  fundingLookup: Record<number, number[]>,
  fundingMap: Record<number, FundingProgramme>,
): FundingProgramme[] {
  const fundingIds = fundingLookup[institutionId] || [];
  return fundingIds.map((id) => fundingMap[id]).filter(Boolean);
}

export default function useTransformInstitutions<T extends BasePoint>(
  institutionPoints: T[] | undefined,
) {
  const { data: topics } = useTopics();
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

    const topicsLookup = createTopicsLookup(junctionsTopics);
    const topicsMap = createTopicsMap(topics);
    const fundingLookup = createFundingLookup(junctionsFunding);
    const fundingMap = createFundingMap(funding);

    return institutionPoints.map(
      (item) =>
        ({
          ...item,
          topics: getTopicsForInstitution(
            item.institution_id,
            topicsLookup,
            topicsMap,
          ),
          funding_programmes: getFundingForInstitution(
            item.institution_id,
            fundingLookup,
            fundingMap,
          ),
        }) as T,
    );
  }, [institutionPoints, topics, junctionsTopics, funding, junctionsFunding]);

  return {
    data: transformedPoints,
  };
}
