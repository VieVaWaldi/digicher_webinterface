import { Box, Typography } from "@mui/material";
import { ArcProjectItem } from "./ArcProjectItem";
import { InstitutionName } from "./InstitutionName";

const MAX_SHOWN = 3;

interface ArcTooltipProps {
  projects: { project_id: string; total_cost: number | null }[];
  sourceInstitutionId?: string;
  partnerInstitutionId?: string;
}

export function ArcTooltip({ projects, sourceInstitutionId, partnerInstitutionId }: ArcTooltipProps) {
  const sorted = [...projects].sort(
    (a, b) => (b.total_cost ?? 0) - (a.total_cost ?? 0),
  );
  const shown = sorted.slice(0, MAX_SHOWN);
  const remaining = sorted.length - shown.length;

  return (
    <>
      {(sourceInstitutionId || partnerInstitutionId) && (
        <Box sx={{ mb: 0.75, pb: 0.75, borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
          {sourceInstitutionId && (
            <Typography variant="body2">
              From <InstitutionName id={sourceInstitutionId} />
            </Typography>
          )}
          {partnerInstitutionId && (
            <Typography variant="body2">
              To <InstitutionName id={partnerInstitutionId} />
            </Typography>
          )}
        </Box>
      )}
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
