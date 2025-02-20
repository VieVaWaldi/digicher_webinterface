import { useMemo } from "react";

import { Topic } from "datamodel/topic/types";
import { BasePoint } from "datamodel/scenario_points/types";
import { FundingProgramme } from "datamodel/fundingprogramme/types";
import { ProjectFundingProgrammes, ProjectTopics } from "datamodel/project/types";

import { useTopics } from "../queries/topic/useTopics";
import { useProjectsTopics } from "../queries/project/useProjectsTopics";
import { useFundingProgrammes } from "../queries/fundingprogramme/useFundingProgrammes";
import { useProjectsFundingProgrammes } from "../queries/project/useProjectsFundingProgrammes";

function createTopicsLookup(data: ProjectTopics[]): Record<number, number[]> {
  return data.reduce(
    (acc, item) => {
      acc[item.project_id] = item.topic_ids;
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
  data: ProjectFundingProgrammes[],
): Record<number, number[]> {
  return data.reduce(
    (acc, item) => {
      acc[item.project_id] = item.funding_ids;
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

function getTopicsForProject(
  projectId: number | undefined,
  topicsLookup: Record<number, number[]>,
  topicsMap: Record<number, Topic>,
): Topic[] {
  if (!projectId) return [];
  const topicIds = topicsLookup[projectId] || [];
  return topicIds.map((id) => topicsMap[id]).filter(Boolean);
}

function getFundingForProject(
  projectId: number | undefined,
  fundingLookup: Record<number, number[]>,
  fundingMap: Record<number, FundingProgramme>,
): FundingProgramme[] {
  if (!projectId) return [];
  const fundingIds = fundingLookup[projectId] || [];
  return fundingIds.map((id) => fundingMap[id]).filter(Boolean);
}

export default function useTransformProjects<T extends BasePoint>(
  dataPoints: T[] | undefined,
) {
  const { data: topics } = useTopics();
  const { data: junctionsTopics } = useProjectsTopics();
  const { data: funding } = useFundingProgrammes();
  const { data: junctionsFunding } = useProjectsFundingProgrammes();

  const transformedPoints = useMemo(() => {
    if (
      !dataPoints ||
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

    return dataPoints.map(
      (item) =>
        ({
          ...item,
          topics: getTopicsForProject(item.project_id, topicsLookup, topicsMap),
          funding_programmes: getFundingForProject(
            item.project_id,
            fundingLookup,
            fundingMap,
          ),
        }) as T,
    );
  }, [dataPoints, topics, junctionsTopics, funding, junctionsFunding]);

  return {
    data: transformedPoints,
  };
}
