import type { JProjectTopicOAType } from "db/schemas/core-junctions";
import { createQueryHook } from "hooks/queries/createQuery";

export const useJProjectTopic = createQueryHook<JProjectTopicOAType[]>(
  ["j_project_topic"],
  "/api/topic/j_project_topic",
);
