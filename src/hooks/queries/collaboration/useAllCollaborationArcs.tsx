import type { MatInstitutionCollaborationsType } from "db/schemas/core-mats";
import { createQueryHook } from "hooks/queries/createQuery";

export const useAllCollaborationArcs = createQueryHook<
  MatInstitutionCollaborationsType[]
>(["all-collaboration-arcs"], "/api/collaboration/all-arcs");
