import { useMemo, useState } from "react";

import { Spinner } from "shadcn/spinner";
import { Topic } from "datamodel/topic/types";
import { MultiSelect } from "shadcn/multi-select";
import { BasePoint } from "datamodel/scenario_points/types";
import { useTopics } from "core/hooks/queries/topic/useTopics";
import { H4 } from "shadcn/typography";

interface TopicFilterResult {
  TopicFilter: React.FC;
  topicPredicate: (point: BasePoint) => boolean;
}

export default function useTopicFilter(): TopicFilterResult {
  const [topics0Filter, setTopics0Filter] = useState<string[]>([]);
  const [topics1Filter, setTopics1Filter] = useState<string[]>([]);
  const [topics2Filter, setTopics2Filter] = useState<string[]>([]);

  const { data: topics, loading } = useTopics();

  function filterTopics(
    data: Topic[] | undefined,
    level: number,
    isLevel2: boolean = false,
  ) {
    return (
      data
        ?.filter((topic) =>
          isLevel2 ? topic.level >= level : topic.level === level,
        )
        .map((topic) => ({
          value: topic.id.toString(),
          label: topic.name,
          icon: undefined,
        })) ?? []
    );
  }

  const topicsLevel0 = useMemo(() => filterTopics(topics, 0), [topics]);
  const topicsLevel1 = useMemo(() => filterTopics(topics, 1), [topics]);
  const topicsLevel2 = useMemo(() => filterTopics(topics, 2, true), [topics]);

  const TopicFilter: React.FC = () => {
    if (loading) {
      return (
        <div className="flex h-12 items-center justify-center">
          <Spinner />
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        <H4 className="ml-2">Topic</H4>
        <MultiSelect
          options={topicsLevel0}
          value={topics0Filter}
          defaultValue={topics0Filter}
          onValueChange={setTopics0Filter}
          placeholder="Select Main Topic"
          variant="inverted"
          maxCount={4}
        />
        <MultiSelect
          options={topicsLevel1}
          value={topics1Filter}
          defaultValue={topics1Filter}
          onValueChange={setTopics1Filter}
          placeholder="Select Secondary Topic"
          variant="default"
          maxCount={4}
        />
        <MultiSelect
          options={topicsLevel2}
          value={topics2Filter}
          defaultValue={topics2Filter}
          onValueChange={setTopics2Filter}
          placeholder="Select Tertiary Topics"
          variant="default"
          maxCount={4}
        />
      </div>
    );
  };

  const topicPredicate = (point: BasePoint) => {
    function topicFilter(data: string[]): boolean {
      return (
        data.length === 0 ||
        (point.topics?.some((topic) => data.includes(topic.id.toString())) ??
          false)
      );
    }
    return (
      topicFilter(topics0Filter) &&
      topicFilter(topics1Filter) &&
      topicFilter(topics2Filter)
    );
  };

  return { TopicFilter, topicPredicate };
}
