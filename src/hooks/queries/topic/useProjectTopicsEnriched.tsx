import { useMemo } from "react";
import { useJProjectTopic } from "./useJProjectTopic";
import { useTopicOA } from "./useTopicOA";

export const useProjectTopicsEnriched = () => {
  const { data: jProjectTopic } = useJProjectTopic();
  const { data: topics } = useTopicOA();

  const enrichedData = useMemo(() => {
    if (!jProjectTopic || !topics) return [];

    const topicMap = new Map(topics.map((topic) => [topic.id, topic]));

    return jProjectTopic.map((junction) => ({
      ...junction,
      topic: topicMap.get(junction.topic_id),
    }));
  }, [jProjectTopic, topics]);

  return enrichedData;
};
