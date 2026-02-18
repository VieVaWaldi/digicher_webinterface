import { Box, Skeleton, Typography } from "@mui/material";
import { useProjectbyId } from "@/hooks/queries/project/useProjectById";
import { useTopicByProjectId } from "@/hooks/queries/topic/useTopicByProjectId";
import { topicIdToColor } from "@/components/filter/useTopicFilter";
import ScienceIcon from "@mui/icons-material/Science";

const EUR = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

interface ArcProjectItemProps {
  project_id: string;
  total_cost: number | null;
}

export function ArcProjectItem({
  project_id,
  total_cost,
}: ArcProjectItemProps) {
  const { data: project, isPending: isProjectPending } = useProjectbyId(
    project_id,
    { staleTime: Infinity },
  );
  const { data: topic, isPending: isTopicPending } = useTopicByProjectId(
    project_id,
    { staleTime: Infinity },
  );

  const [r, g, b] = topic ? topicIdToColor(topic.id) : [120, 120, 120, 140];

  return (
    <Typography variant="body2" component="div" sx={{ mb: 0.5 }}>
      <Typography variant="subtitle2" component="div">
        <ScienceIcon sx={{ color: "secondary.main", fontSize: 20, mr: 1 }} />
        {isProjectPending ? (
          <Skeleton variant="text" width={160} sx={{ bgcolor: "grey.700" }} />
        ) : (
          (project?.title ?? project_id)
        )}
      </Typography>
      {total_cost != null && (
        <Typography variant="body2">
          <span style={{ fontWeight: 600 }}>{EUR.format(total_cost)}</span> from{" "}
          <span style={{ fontWeight: 600 }}>{project?.start_date}</span> to{" "}
          <span style={{ fontWeight: 600 }}>{project?.end_date}</span>
        </Typography>
      )}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            flexShrink: 0,
            bgcolor: isTopicPending ? "grey.600" : `rgb(${r}, ${g}, ${b})`,
          }}
        />
        <Typography variant="body2" sx={{ color: "grey.600" }}>
          Topic:{" "}
          {isTopicPending ? (
            <Skeleton variant="text" width={120} sx={{ bgcolor: "grey.700" }} />
          ) : (
            (topic?.topic_name ?? "—")
          )}
        </Typography>
      </Box>
    </Typography>
  );
}
