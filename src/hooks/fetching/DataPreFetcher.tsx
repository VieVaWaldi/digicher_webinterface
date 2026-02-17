import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const useDataPreFetcher = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const prefetchData = async () => {
      const queries = [
        { key: ["views-institution"], url: "/api/views/map/institution" },
        { key: ["j_project_topic"], url: "/api/topic/j_project_topic" },
        { key: ["topic"], url: "/api/topic/topics" },
      ];

      await Promise.all(
        queries.map((q) =>
          queryClient.prefetchQuery({
            queryKey: q.key,
            queryFn: () => fetch(q.url).then((res) => res.json()),
          }),
        ),
      );
    };

    prefetchData().catch((err) => {
      console.error("Prefetch failed", err);
    });
  }, [queryClient]);
};
