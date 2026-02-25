import { MapViewInstitutionType } from "db/schemas/core-map-view";

/**
 * Returns the total funding received by an institution across its (filtered) projects.
 * Uses participation_cost rather than total_cost, which is the project-wide budget
 * shared across all participants.
 */
export function getParticipationCost(inst: MapViewInstitutionType): number {
  return (inst.projects ?? []).reduce(
    (sum, proj) => sum + (proj.participation_cost ?? 0),
    0,
  );
}