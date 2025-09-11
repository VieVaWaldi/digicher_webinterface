import type { MatInstitutionsCollaborationWeightsType } from "db/schemas/core-mats";
import { createQueryHook } from "hooks/queries/createQuery";

export const useCollaborationView = createQueryHook<
  MatInstitutionsCollaborationWeightsType[]
>(
  ["collaboration-institution_collaborators"],
  "/api/collaboration/institution_collaborators",
);
