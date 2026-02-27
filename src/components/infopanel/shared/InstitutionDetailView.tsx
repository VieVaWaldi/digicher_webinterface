"use client";

import { Box, Chip, Divider, Link, Skeleton, Typography } from "@mui/material";
import ScienceIcon from "@mui/icons-material/Science";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useInstitutionById } from "@/hooks/queries/institution/useInstitutionById";

interface InstitutionDetailViewProps {
  institutionId: string;
  projectsData?: { id: string }[];
  listViewUrl?: string;
}

export function InstitutionDetailView({
  institutionId,
  projectsData,
  listViewUrl,
}: InstitutionDetailViewProps) {
  const { data, isLoading } = useInstitutionById(institutionId);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Skeleton variant="text" width="70%" height={28} />
        <Skeleton variant="text" width="50%" height={18} />
        <Skeleton variant="text" width="40%" height={18} />
        <Skeleton variant="text" width="60%" height={18} />
        <Skeleton variant="text" width="30%" height={18} />
        <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
          <Skeleton variant="rounded" width={80} height={24} />
        </Box>
        <Skeleton variant="text" width="80%" height={18} />
      </Box>
    );
  }

  if (!data) return null;

  const projectCount = projectsData?.length ?? null;
  const hasAddress =
    data.street || data.postbox || data.postalcode || data.city || data.country_code;
  const addressParts = [
    data.street,
    data.postbox,
    [data.postalcode, data.city].filter(Boolean).join(" ") || null,
    data.country_code,
  ].filter(Boolean);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* Name block */}
      <Box>
        <Typography variant="h6" fontWeight={600} lineHeight={1.3}>
          {data.legal_name ?? institutionId}
        </Typography>
        {data.alternative_names && data.alternative_names.length > 0 && (
          <Typography variant="caption" color="text.secondary" display="block">
            {data.alternative_names.slice(0, 2).join(" · ")}
          </Typography>
        )}
        {data.source_system && (
          <Typography variant="caption" color="text.secondary" display="block">
            Source: {data.source_system}
          </Typography>
        )}
      </Box>

      {/* URL and project count */}
      {(data.url || projectCount !== null) && (
        <>
          <Divider />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {data.url && (
              <Link
                href={data.url}
                target="_blank"
                rel="noopener"
                variant="body2"
                underline="hover"
                sx={{ wordBreak: "break-all" }}
              >
                {data.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </Link>
            )}
            {projectCount !== null && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <ScienceIcon sx={{ color: "secondary.main", fontSize: 20, mr: 1 }} />
                {listViewUrl ? (
                  <Link
                    href={listViewUrl}
                    variant="body2"
                    underline="always"
                    sx={{ color: "primary.main" }}
                  >
                    {projectCount} project{projectCount !== 1 ? "s" : ""}
                  </Link>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {projectCount} project{projectCount !== 1 ? "s" : ""}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </>
      )}

      {/* Type and SME chips */}
      {(data.type_title || data.sme) && (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {data.type_title && (
            <Chip label={data.type_title} size="small" variant="outlined" />
          )}
          {data.sme && (
            <Chip label="SME" size="small" color="primary" variant="outlined" />
          )}
        </Box>
      )}

      {/* Address */}
      {hasAddress && (
        <>
          <Divider />
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
            <LocationOnIcon sx={{ fontSize: 16, color: "text.secondary", mt: 0.25 }} />
            <Typography variant="body2" color="text.secondary">
              {addressParts.join(", ")}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}