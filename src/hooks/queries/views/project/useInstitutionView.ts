import type { InstitutionViewType } from "db/schemas/core-mats";
import { createQueryHook } from "hooks/queries/createQuery";

export const useInstitutionView = createQueryHook<InstitutionViewType[]>(
  ["views-institution"],
  "/api/views/institution",
);
