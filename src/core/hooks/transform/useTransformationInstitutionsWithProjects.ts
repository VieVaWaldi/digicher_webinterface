import { useMemo } from "react";

import { Topic } from "datamodel/topic/types";
import { FundingProgramme } from "datamodel/fundingprogramme/types";
import {
  ProjectFundingProgrammes,
  ProjectTopics,
} from "datamodel/project/types";
import {
  FundingInstitutionPoint,
  InstitutionProjectsFunding,
} from "datamodel/scenario_points/types";

import { useTopics } from "../queries/topic/useTopics";
import { useProjectsTopics } from "../queries/project/useProjectsTopics";
import { useFundingProgrammes } from "../queries/fundingprogramme/useFundingProgrammes";
import { useProjectsFundingProgrammes } from "../queries/project/useProjectsFundingProgrammes";

function createTopicsLookup(data: ProjectTopics[]): Record<string, number[]> {
  return data.reduce(
    (acc, item) => {
      acc[item.project_id] = item.topic_ids;
      return acc;
    },
    {} as Record<string, number[]>,
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
): Record<string, number[]> {
  return data.reduce(
    (acc, item) => {
      acc[item.project_id] = item.funding_ids;
      return acc;
    },
    {} as Record<string, number[]>,
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
  projectId: string,
  topicsLookup: Record<string, number[]>,
  topicsMap: Record<number, Topic>,
): Topic[] {
  const topicIds = topicsLookup[projectId] || [];
  return topicIds.map((id) => topicsMap[id]).filter(Boolean);
}

function getFundingForProject(
  projectId: string,
  fundingLookup: Record<string, number[]>,
  fundingMap: Record<number, FundingProgramme>,
): FundingProgramme[] {
  const fundingIds = fundingLookup[projectId] || [];
  return fundingIds.map((id) => fundingMap[id]).filter(Boolean);
}

export default function useTransformInstitutionsWithProjects(
  institutionPoints: FundingInstitutionPoint[] | undefined,
) {
  const { data: topics } = useTopics();
  const { data: junctionsTopics } = useProjectsTopics();
  const { data: funding } = useFundingProgrammes();
  const { data: junctionsFunding } = useProjectsFundingProgrammes();

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

    return institutionPoints.map((institution) => {
      const enhancedProjects = institution.projects_funding.map((project) => {
        if (!project.project_id) {
          throw Error("shouldnt happen but makes typescript happy");
        }
        return {
          ...project,
          institution_id: institution.institution_id,
          // country_code: institution.country_code,
          // geolocation: institution.geolocation,

          topics: getTopicsForProject(
            project.project_id,
            topicsLookup,
            topicsMap,
          ),
          funding_programmes: getFundingForProject(
            project.project_id,
            fundingLookup,
            fundingMap,
          ),
        } as InstitutionProjectsFunding;
      });

      return {
        ...institution,
        projects_funding: enhancedProjects,
      } as FundingInstitutionPoint;
    });
  }, [institutionPoints, topics, junctionsTopics, funding, junctionsFunding]);

  return {
    data: transformedPoints,
  };
}
