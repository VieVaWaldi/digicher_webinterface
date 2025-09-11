import type { TopicOAType } from "db/schemas/core";
import { createQueryHook } from "hooks/queries/createQuery";

export const useTopicOA = createQueryHook<TopicOAType[]>(
  ["topic"],
  "/api/topic/topics",
);
