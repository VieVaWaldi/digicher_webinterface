import { MapViewCollaborationByTopicType } from "db/schemas/core-map-view";
import { useQuery } from "@tanstack/react-query";
import { createApiFetcher } from "@/hooks/queries/createQuery";

interface CollaborationByTopicParams {
  topicIds?: string[];
  subfieldIds?: string[];
  fieldIds?: string[];
  all?: boolean;
}

function buildUrl(params: CollaborationByTopicParams): string {
  const searchParams = new URLSearchParams();

  if (params.all) {
    searchParams.set("all", "true");
  } else {
    if (params.topicIds?.length)
      searchParams.set("topic_id", params.topicIds.join(","));
    if (params.subfieldIds?.length)
      searchParams.set("subfield_id", params.subfieldIds.join(","));
    if (params.fieldIds?.length)
      searchParams.set("field_id", params.fieldIds.join(","));
  }

  return `/api/views/map/collaboration_by_topic?${searchParams.toString()}`;
}

export function useMapViewCollaborationByTopic(
  params: CollaborationByTopicParams,
) {
  const hasSelection =
    params.all ||
    !!params.topicIds?.length ||
    !!params.subfieldIds?.length ||
    !!params.fieldIds?.length;

  return useQuery<MapViewCollaborationByTopicType[]>({
    queryKey: [
      "views-collaboration_by_topic",
      params.all ? "all" : null,
      params.topicIds,
      params.subfieldIds,
      params.fieldIds,
    ],
    queryFn: createApiFetcher<MapViewCollaborationByTopicType[]>(
      buildUrl(params),
    ),
    enabled: hasSelection,
  });
}