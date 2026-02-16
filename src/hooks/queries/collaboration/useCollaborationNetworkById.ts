import { MapViewCollaborationNetworkType } from "db/schemas/core-map-view";
import { useQuery } from "@tanstack/react-query";
import { createApiFetcher } from "@/hooks/queries/createQuery";

export function useCollaborationNetworkById(id: string | null) {
  return useQuery<MapViewCollaborationNetworkType[]>({
    queryKey: ["views-collaboration_network_by_id", id],
    queryFn: createApiFetcher<MapViewCollaborationNetworkType[]>(
      `/api/collaborations/collaboration_network_by_id?id=${id}`,
    ),
    enabled: !!id,
  });
}