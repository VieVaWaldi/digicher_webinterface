"use client";

import { Box, Chip, Divider, Link, Skeleton, Typography } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { useMemo, useState } from "react";
import { ProjectPanelData } from "@/components/infopanel/types";
import { useProjectbyId } from "@/hooks/queries/project/useProjectById";
import { useProjectTopicsEnriched } from "@/hooks/queries/topic/useProjectTopicsEnriched";
import { topicIdToColor } from "@/components/filter/useTopicFilter";

function formatCost(cost: number | null | undefined): string {
  if (cost == null) return "N/A";
  if (cost >= 1_000_000) return `€${(cost / 1_000_000).toFixed(1)}M`;
  if (cost >= 1_000) return `€${(cost / 1_000).toFixed(0)}K`;
  return `€${cost.toFixed(0)}`;
}

function formatDate(date: string | null | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
  });
}

function calcDuration(
  start: string | null | undefined,
  end: string | null | undefined,
): string | null {
  if (!start || !end) return null;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const months = Math.round(ms / (1000 * 60 * 60 * 24 * 30.44));
  if (months < 12) return `${months}mo`;
  const years = (months / 12).toFixed(1).replace(/\.0$/, "");
  return `${years}yr`;
}

interface TopicInfo {
  topic_id: number;
  topic_name: string;
  field_name: string;
}

interface ProjectDetailCardProps {
  project: ProjectPanelData;
  topic?: TopicInfo;
}

function ProjectDetailCard({ project, topic }: ProjectDetailCardProps) {
  const { data, isLoading } = useProjectbyId(project.project_id);
  const [expanded, setExpanded] = useState(false);

  const topicColor = topic ? topicIdToColor(topic.topic_id) : null;

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Skeleton variant="text" width="60%" height={28} />
        <Skeleton variant="text" width="90%" height={20} />
        <Box sx={{ display: "flex", gap: 1 }}>
          <Skeleton variant="rounded" width={70} height={24} />
          <Skeleton variant="rounded" width={90} height={24} />
        </Box>
        <Skeleton variant="text" width="70%" height={18} />
        <Skeleton variant="text" width="80%" height={18} />
        <Skeleton variant="rounded" width="100%" height={72} />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box>
        <Typography variant="body2" color="text.secondary">
          {project.project_id}
        </Typography>
      </Box>
    );
  }

  const start = data.start_date ?? project.start_date;
  const end = data.end_date ?? project.end_date;
  const cost = data.total_cost ?? project.total_cost;
  const duration = calcDuration(start, end);

  const objectiveText =
    data.objective && !expanded && data.objective.length > 400
      ? data.objective.slice(0, 400) + "…"
      : data.objective;

  const keywords = data.keywords
    ? data.keywords
        .split(/[,;]/)
        .map((k) => k.trim())
        .filter(Boolean)
    : [];

  const fps = project.framework_programmes ?? [];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* Title / Acronym */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}>
          {data.acronym && (
            <Typography variant="h6" fontWeight={600} component="span">
              {data.acronym}
            </Typography>
          )}
          {data.title && (
            <Typography
              variant="body1"
              component="span"
              sx={{ color: data.acronym ? "text.secondary" : "text.primary" }}
            >
              {data.title}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
          {data.status && <Chip label={data.status} size="small" variant="outlined" />}
          {data.source_system && (
            <Typography variant="caption" color="text.secondary">
              {data.source_system}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Topic chip */}
      {topic && topicColor && (
        <Box>
          <Chip
            label={topic.topic_name}
            size="small"
            sx={{
              backgroundColor: `rgba(${topicColor[0]},${topicColor[1]},${topicColor[2]},0.15)`,
              color: `rgb(${topicColor[0]},${topicColor[1]},${topicColor[2]})`,
              border: "1px solid",
              borderColor: `rgb(${topicColor[0]},${topicColor[1]},${topicColor[2]})`,
            }}
          />
        </Box>
      )}

      <Divider />

      {/* Dates and cost */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
        {(start || end) && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <CalendarTodayIcon sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography variant="body2">
              {formatDate(start)} – {formatDate(end)}
              {duration && (
                <Typography component="span" variant="caption" color="text.secondary">
                  {" "}({duration})
                </Typography>
              )}
            </Typography>
          </Box>
        )}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
          {cost != null && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <AttachMoneyIcon sx={{ fontSize: 14, color: "text.secondary" }} />
              <Typography variant="body2">{formatCost(cost)}</Typography>
            </Box>
          )}
          {(data.funder_name || data.funder_short_name) && (
            <Typography variant="body2" color="text.secondary">
              {[
                data.funder_name,
                data.funder_short_name && `(${data.funder_short_name})`,
                data.funder_jurisdiction && `[${data.funder_jurisdiction}]`,
              ]
                .filter(Boolean)
                .join(" ")}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Links */}
      {(data.website_url || data.doi || data.code) && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
          {data.website_url && (
            <Link
              href={data.website_url}
              target="_blank"
              rel="noopener"
              variant="body2"
              underline="hover"
            >
              Website
            </Link>
          )}
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
          {data.code && (
            <Typography variant="body2" color="text.secondary">
              Code: {data.code}
            </Typography>
          )}
        </Box>
      )}

      <Divider />

      {/* Objective */}
      {data.objective && (
        <Box>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            Objective
          </Typography>
          <Typography variant="body2">{objectiveText}</Typography>
          {data.objective.length > 400 && (
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
      )}

      {/* Keywords */}
      {keywords.length > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            Keywords
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {keywords.slice(0, 10).map((kw) => (
              <Chip key={kw} label={kw} size="small" variant="outlined" />
            ))}
            {keywords.length > 10 && (
              <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center" }}>
                +{keywords.length - 10} more
              </Typography>
            )}
          </Box>
        </Box>
      )}

      {/* Framework Programmes */}
      {fps.length > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            Framework Programmes
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {fps.map((fp) => (
              <Chip key={fp} label={fp} size="small" variant="outlined" />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

interface ProjectPanelProps {
  projects: ProjectPanelData[];
}

export function ProjectPanel({ projects }: ProjectPanelProps) {
  const topicsEnriched = useProjectTopicsEnriched();

  const topicMap = useMemo(() => {
    const map = new Map<string, TopicInfo>();
    topicsEnriched.forEach(({ project_id, topic_id, topic }) => {
      if (topic && !map.has(project_id)) {
        map.set(project_id, {
          topic_id,
          topic_name: topic.topic_name,
          field_name: topic.field_name,
        });
      }
    });
    return map;
  }, [topicsEnriched]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {projects.length} project{projects.length !== 1 ? "s" : ""}
      </Typography>

      {projects.map((project, idx) => (
        <Box key={project.project_id}>
          {idx > 0 && <Divider sx={{ mb: 2 }} />}
          <ProjectDetailCard project={project} topic={topicMap.get(project.project_id)} />
        </Box>
      ))}
    </Box>
  );
}
