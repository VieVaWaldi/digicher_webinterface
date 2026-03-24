"use client";

import { Box, Chip, Divider, Link, Skeleton, Typography } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useOrganizationV3ById } from "@/hooks/queries/v3/useOrganizationV3ById";

interface OrganizationPanelV3Props {
  organizationId: string;
}

export function OrganizationPanelV3({ organizationId }: OrganizationPanelV3Props) {
  const { data, isLoading } = useOrganizationV3ById(organizationId);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Skeleton variant="text" width="70%" height={28} />
        <Skeleton variant="text" width="50%" height={18} />
        <Skeleton variant="text" width="40%" height={18} />
        <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
          <Skeleton variant="rounded" width={80} height={24} />
        </Box>
      </Box>
    );
  }

  if (!data) return null;

  const primaryLocation = data.rorLocations?.[0];
  const city = primaryLocation?.geonames_details?.name ?? null;
  const country = primaryLocation?.geonames_details?.country_name ?? null;
  const subdivision = primaryLocation?.geonames_details?.country_subdivision_name ?? null;

  const locationParts = [city, subdivision, country].filter(Boolean);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* Name */}
      <Box>
        <Typography variant="h6" fontWeight={600} lineHeight={1.3}>
          {data.legalName ?? organizationId}
        </Typography>
        {data.legalShortName && data.legalShortName !== data.legalName && (
          <Typography variant="caption" color="text.secondary">
            {data.legalShortName}
          </Typography>
        )}
      </Box>

      {/* Types */}
      {data.rorTypes && data.rorTypes.length > 0 && (
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          {data.rorTypes.map((t) => (
            <Chip key={t} label={t} size="small" variant="outlined" />
          ))}
        </Box>
      )}

      <Divider />

      {/* Location */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
        {locationParts.length > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <LocationOnIcon sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography variant="body2">{locationParts.join(", ")}</Typography>
          </Box>
        )}
        {data.countryCode && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
              Country code
            </Typography>
            <Typography variant="body2">{data.countryCode}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
