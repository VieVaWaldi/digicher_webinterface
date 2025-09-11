import type { ProjectViewType } from "db/schemas/core-mats";
import { createQueryHook } from "hooks/queries/createQuery";

export const useProjectView = createQueryHook<ProjectViewType[]>(
  ["views-project"],
  "/api/views/project",
);
