import { MapViewCollaborationsType } from "db/schemas/core-map-view";
import { createQueryHook } from "hooks/queries/createQuery";

export const useMapViewCollaborations = createQueryHook<
  MapViewCollaborationsType[]
>(["collaborations"], "/api/views/map/collaboration");
