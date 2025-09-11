import { createQueryHook } from "hooks/queries/createQuery";

export type ProjectYearRange = {
  minStartDate: number;
  maxEndDate: number;
};

export const useProjectYearRange = createQueryHook<ProjectYearRange>(
  ["project-year-range"],
  "/api/project/year-range",
  {
    placeholderData: {
      minStartDate: 1985,
      maxEndDate: 2035,
    },
  },
);
