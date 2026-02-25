import { Typography } from "@mui/material";
import { GeoGroup } from "@/app/scenarios/scenario_data";
import { InstitutionName } from "./InstitutionName";
import { getParticipationCost } from "@/utils/institutionUtils";

const MAX_SHOWN = 3;

const EUR = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

interface GeoGroupTooltipProps {
  group: GeoGroup;
  showFunding?: boolean;
}

export function GeoGroupTooltip({ group, showFunding }: GeoGroupTooltipProps) {
  const { institutions } = group;
  const sorted = [...institutions].sort(
    (a, b) => getParticipationCost(b) - getParticipationCost(a),
  );
  const shown = sorted.slice(0, MAX_SHOWN);
  const remaining = sorted.length - shown.length;

  const totalFunding = institutions.reduce(
    (sum, i) => sum + getParticipationCost(i),
    0,
  );

  return (
    <>
      {shown.map((inst) => (
        <Typography key={inst.institution_id} variant="body2">
          <InstitutionName id={inst.institution_id} />
        </Typography>
      ))}
      {remaining > 0 && (
        <Typography variant="body2" sx={{ color: "grey.400" }}>
          +{remaining} more
        </Typography>
      )}
      {showFunding && (
        <Typography
          variant="body2"
          sx={{
            mt: 0.5,
            pt: 0.5,
            borderTop: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          {EUR.format(totalFunding)}
        </Typography>
      )}
    </>
  );
}