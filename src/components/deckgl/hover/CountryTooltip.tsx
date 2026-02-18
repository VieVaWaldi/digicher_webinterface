import { Typography } from "@mui/material";

const EUR = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

interface CountryTooltipProps {
  countryCode: string;
  funding: number;
}

export function CountryTooltip({ countryCode, funding }: CountryTooltipProps) {
  return (
    <>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 600, mb: 0.5, textAlign: "center" }}
      >
        {countryCode}
      </Typography>
      <Typography variant="body2">{EUR.format(funding)}</Typography>
    </>
  );
}