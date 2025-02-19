import { useFetch } from "core/hooks/useFetch";
import { ProjectFundingProgrammes } from "datamodel/project/types";

export function useProjectsFundingProgrammes() {
  return useFetch<ProjectFundingProgrammes[]>(
    "/api/project/projects_fundingprogrammes",
  );
}
