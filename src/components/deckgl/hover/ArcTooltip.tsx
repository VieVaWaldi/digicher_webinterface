import { Typography } from "@mui/material";
import { ArcProjectItem } from "./ArcProjectItem";

const MAX_SHOWN = 3;

interface ArcTooltipProps {
  projects: { project_id: string; total_cost: number | null }[];
}

export function ArcTooltip({ projects }: ArcTooltipProps) {
  const sorted = [...projects].sort(
    (a, b) => (b.total_cost ?? 0) - (a.total_cost ?? 0),
  );
  const shown = sorted.slice(0, MAX_SHOWN);
  const remaining = sorted.length - shown.length;

  return (
    <>
      {shown.map((p) => (
        <ArcProjectItem key={p.project_id} project_id={p.project_id} total_cost={p.total_cost} />
      ))}
      {remaining > 0 && (
        <Typography variant="body2" sx={{ color: "grey.400" }}>
          +{remaining} more
        </Typography>
      )}
    </>
  );
}
