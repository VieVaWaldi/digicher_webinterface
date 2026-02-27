"use client";

import { Box, Chip, Divider, Link, Skeleton, Typography } from "@mui/material";
import { useState } from "react";
import { useResearchoutputbyId } from "@/hooks/queries/researchoutput/useResearchOutputById";

interface WorkPanelProps {
  workId: string;
}

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-GB", { year: "numeric", month: "short" });
}

export function WorkPanel({ workId }: WorkPanelProps) {
  const { data, isLoading } = useResearchoutputbyId(workId);
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
        <Skeleton variant="text" width="40%" height={18} />
        <Skeleton variant="rounded" width="100%" height={80} />
      </Box>
    );
  }

  if (!data) {
    return (
      <Typography variant="body2" color="text.secondary">
        Work not found.
      </Typography>
    );
  }

  const abstractText =
    data.abstract && !expanded && data.abstract.length > 400
      ? data.abstract.slice(0, 400) + "…"
      : data.abstract;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* Title */}
      <Typography variant="h6" fontWeight={600} lineHeight={1.3}>
        {data.title ?? workId}
      </Typography>

      {/* Type + OA chips */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {data.type && (
          <Chip label={data.type} size="small" variant="outlined" />
        )}
        {data.open_access_color && (
          <Chip
            label={`Open Access (${data.open_access_color})`}
            size="small"
            color="success"
            variant="outlined"
          />
        )}
        {data.is_in_diamond_journal && (
          <Chip label="Diamond OA" size="small" color="info" variant="outlined" />
        )}
      </Box>

      <Divider />

      {/* Publication metadata */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
        {data.publication_date && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
              Published
            </Typography>
            <Typography variant="body2">{formatDate(data.publication_date)}</Typography>
          </Box>
        )}
        {data.journal_name && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
              Journal
            </Typography>
            <Typography variant="body2">{data.journal_name}</Typography>
          </Box>
        )}
        {(data.issn_printed || data.issn_online || data.issn) && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
              ISSN
            </Typography>
            <Typography variant="body2">
              {data.issn_printed ?? data.issn_online ?? data.issn}
            </Typography>
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
        {data.language_label && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
              Language
            </Typography>
            <Typography variant="body2">{data.language_label}</Typography>
          </Box>
        )}
      </Box>

      {/* DOI */}
      {data.doi && (
        <Link
          href={`https://doi.org/${data.doi}`}
          target="_blank"
          rel="noopener"
          variant="body2"
          underline="hover"
        >
          DOI: {data.doi}
        </Link>
      )}

      <Divider />

      {/* Metrics */}
      {(data.citation_count != null || data.influence != null || data.popularity != null) && (
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          {data.citation_count != null && data.citation_count > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Citations
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {data.citation_count}
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
          {data.popularity != null && data.popularity > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Popularity
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {data.popularity.toFixed(2)}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Abstract */}
      {data.abstract && (
        <>
          <Divider />
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Abstract
            </Typography>
            <Typography variant="body2">{abstractText}</Typography>
            {data.abstract.length > 400 && (
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
