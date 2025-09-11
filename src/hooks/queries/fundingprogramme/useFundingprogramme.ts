import type { FundingprogrammeType } from "db/schemas/core-mats";
import { createQueryHook } from "hooks/queries/createQuery";

export const useProjectView = createQueryHook<FundingprogrammeType[]>(
  ["fundingprogramme"],
  "/api/fundingprogramme",
);
