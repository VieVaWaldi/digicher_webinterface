import { MapViewInstitutionType } from "db/schemas/core-map-view";
import { createQueryHook } from "hooks/queries/createQuery";

export const useMapViewInstitution = createQueryHook<MapViewInstitutionType[]>(
  ["views-institution"],
  "/api/views/map/institution",
);
