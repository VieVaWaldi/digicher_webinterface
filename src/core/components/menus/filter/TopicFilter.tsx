import { useTopics } from "core/hooks/queries/topic/useTopics";
import { Topic } from "datamodel/topic/types";
import { useMemo } from "react";
import { MultiSelect } from "shadcn/multi-select";
import { Spinner } from "shadcn/spinner";

interface TopicFilterProps {
  setTopics0Filter: (value: string[]) => void;
  setTopics1Filter: (value: string[]) => void;
  setTopics2Filter: (value: string[]) => void;
}

export default function TopicFilter({
  setTopics0Filter,
  setTopics1Filter,
  setTopics2Filter,
}: TopicFilterProps) {
  const { data: topics, loading, error } = useTopics();

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

  if (loading) {
    return (
      <div className="flex h-24 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 md:flex-row">
      <MultiSelect
        options={topicsLevel0}
        onValueChange={setTopics0Filter}
        placeholder="Select Main Topic"
        variant="inverted"
        maxCount={6}
      />
      <MultiSelect
        options={topicsLevel1}
        onValueChange={setTopics1Filter}
        placeholder="Select Secondary Topic"
        variant="default"
        maxCount={6}
      />
      <MultiSelect
        options={topicsLevel2}
        onValueChange={setTopics2Filter}
        placeholder="Select Tertiary Topics"
        variant="default"
        maxCount={6}
      />
    </div>
  );
}
