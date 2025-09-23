import { MapViewProjectType } from "db/schemas/core-map-view";
import { createQueryHook } from "hooks/queries/createQuery";

export const useMapViewProject = createQueryHook<MapViewProjectType[]>(
  ["views-project"],
  "/api/views/map/project",
);
