"use client";

import { Box, Chip, Divider, Link, Skeleton, Typography } from "@mui/material";
import { useState } from "react";
import { useWorkV3ById } from "@/hooks/queries/v3/useWorkV3ById";

function formatDate(date: string | null | undefined): string {
  if (!date) return "N/A";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-GB", { year: "numeric", month: "short" });
}

interface WorkPanelV3Props {
  workId: string;
}

export function WorkPanelV3({ workId }: WorkPanelV3Props) {
  const { data, isLoading } = useWorkV3ById(workId);
  const [expanded, setExpanded] = useState(false);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Skeleton variant="text" width="80%" height={28} />
        <Box sx={{ display: "flex", gap: 1 }}>
          <Skeleton variant="rounded" width={60} height={22} />
          <Skeleton variant="rounded" width={50} height={22} />
        </Box>
        <Skeleton variant="text" width="50%" height={18} />
        <Skeleton variant="text" width="60%" height={18} />
        <Skeleton variant="rounded" width="100%" height={80} />
      </Box>
    );
  }

  if (!data) {
    return <Typography variant="body2" color="text.secondary">Work not found.</Typography>;
  }

  const doi = data.pids?.find((p) => p.scheme === "doi")?.value ?? null;
  const workType = data.instances?.[0]?.type ?? null;
  const journalName = data.container?.name ?? null;
  const issn = data.container?.issnPrinted ?? data.container?.issnOnline ?? null;

  // Use first description as abstract
  const abstract = data.descriptions?.[0] ?? null;
  const abstractText =
    abstract && !expanded && abstract.length > 400
      ? abstract.slice(0, 400) + "…"
      : abstract;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* Title */}
      <Typography variant="h6" fontWeight={600} lineHeight={1.3}>
        {data.title ?? workId}
      </Typography>

      {/* Type + OA chips */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {workType && (
          <Chip label={workType} size="small" variant="outlined" />
        )}
        {data.openAccessColor && (
          <Chip
            label={`Open Access (${data.openAccessColor})`}
            size="small"
            color="success"
            variant="outlined"
          />
        )}
      </Box>

      <Divider />

      {/* Publication metadata */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
        {data.publicationDate && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
              Published
            </Typography>
            <Typography variant="body2">{formatDate(data.publicationDate)}</Typography>
          </Box>
        )}
        {journalName && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
              Journal
            </Typography>
            <Typography variant="body2">{journalName}</Typography>
          </Box>
        )}
        {issn && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
              ISSN
            </Typography>
            <Typography variant="body2">{issn}</Typography>
          </Box>
        )}
        {data.publisher && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
              Publisher
            </Typography>
            <Typography variant="body2">{data.publisher}</Typography>
          </Box>
        )}
        {data.language?.label && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
              Language
            </Typography>
            <Typography variant="body2">{data.language.label}</Typography>
          </Box>
        )}
      </Box>

      {/* DOI */}
      {doi && (
        <Link
          href={`https://doi.org/${doi}`}
          target="_blank"
          rel="noopener"
          variant="body2"
          underline="hover"
        >
          DOI: {doi}
        </Link>
      )}

      <Divider />

      {/* Metrics */}
      {(data.citationCount != null || data.influence != null) && (
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          {data.citationCount != null && data.citationCount > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Citations
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {data.citationCount}
              </Typography>
            </Box>
          )}
          {data.influence != null && data.influence > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Influence
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {data.influence.toFixed(2)}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Abstract / description */}
      {abstract && (
        <>
          <Divider />
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Abstract
            </Typography>
            <Typography variant="body2">{abstractText}</Typography>
            {abstract.length > 400 && (
              <Typography
                variant="caption"
                color="primary"
                sx={{ cursor: "pointer", mt: 0.5, display: "block" }}
                onClick={() => setExpanded((e) => !e)}
              >
                {expanded ? "Show less" : "Show more"}
              </Typography>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
