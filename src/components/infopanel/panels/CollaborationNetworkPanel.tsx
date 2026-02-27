"use client";

import { Box, Button, CircularProgress, Divider, Link, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { MapViewCollaborationNetworkType } from "db/schemas/core-map-view";
import { useGetBulkInstitutionNames } from "@/hooks/queries/institution/useGetBulkInstitutionNames";
import { useProjectTopicsEnriched } from "@/hooks/queries/topic/useProjectTopicsEnriched";
import { useProjectbyId } from "@/hooks/queries/project/useProjectById";
import { topicIdToColor } from "@/components/filter/useTopicFilter";
import { InstitutionDetailView } from "@/components/infopanel/shared/InstitutionDetailView";
import { InstitutionListRow } from "@/components/infopanel/shared/InstitutionListRow";
import { FilterValues } from "@/hooks/persistence/useFilters";
import { buildListProjectUrl } from "@/utils/buildListUrl";
import GroupsIcon from "@mui/icons-material/Groups";
import ScienceIcon from "@mui/icons-material/Science";

interface TopicInfo {
  topic_id: number;
  topic_name: string;
}

interface SharedProjectRowProps {
  projectId: string;
  totalCost?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  topicMap: Map<string, TopicInfo>;
  listViewUrl?: string;
}

function formatDate(date: string | null | undefined): string {
  if (!date) return "?";
  return new Date(date).toLocaleDateString("en-GB", { year: "numeric", month: "short" });
}

function formatCost(cost: number | null | undefined): string {
  if (cost == null) return "";
  if (cost >= 1_000_000) return `€${(cost / 1_000_000).toFixed(1)}M`;
  if (cost >= 1_000) return `€${(cost / 1_000).toFixed(0)}K`;
  return `€${cost.toFixed(0)}`;
}

function SharedProjectRow({
  projectId,
  totalCost,
  startDate,
  endDate,
  topicMap,
  listViewUrl,
}: SharedProjectRowProps) {
  const { data, isLoading } = useProjectbyId(projectId);
  const topic = topicMap.get(projectId);
  const topicColor = topic ? topicIdToColor(topic.topic_id) : null;

  const start = data?.start_date ?? startDate;
  const end = data?.end_date ?? endDate;
  const cost = data?.total_cost ?? totalCost;
  const costStr = formatCost(cost);

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        py: 0.75,
        borderBottom: "1px solid",
        borderColor: "divider",
        "&:last-child": { borderBottom: "none" },
      }}
    >
      {/* Topic dot */}
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          flexShrink: 0,
          mt: 0.6,
          backgroundColor: topicColor
            ? `rgb(${topicColor[0]},${topicColor[1]},${topicColor[2]})`
            : "action.disabled",
        }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Title */}
        {listViewUrl ? (
          <Link
            href={listViewUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="body2"
            sx={{ fontWeight: 500, wordBreak: "break-word" }}
            underline="hover"
          >
            {isLoading ? "Loading…" : (data?.acronym
              ? `${data.acronym} — ${data.title ?? projectId}`
              : (data?.title ?? projectId))}
          </Link>
        ) : (
          <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: "break-word" }}>
            {isLoading ? "Loading…" : (data?.acronym
              ? `${data.acronym} — ${data.title ?? projectId}`
              : (data?.title ?? projectId))}
          </Typography>
        )}
        {/* Topic name */}
        {topic && topicColor && (
          <Typography
            variant="caption"
            sx={{ color: `rgb(${topicColor[0]},${topicColor[1]},${topicColor[2]})` }}
          >
            {topic.topic_name}
          </Typography>
        )}
        {/* Date + cost row */}
        <Box sx={{ display: "flex", gap: 1.5, mt: 0.25, flexWrap: "wrap" }}>
          <Typography variant="caption" color="text.secondary">
            {formatDate(start)} – {formatDate(end)}
          </Typography>
          {costStr && (
            <Typography variant="caption" color="text.secondary">
              {costStr}
            </Typography>
          )}
          {data?.source_system && (
            <Typography variant="caption" color="text.secondary">
              Source: {data.source_system}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

interface CollaborationNetworkPanelProps {
  institutionId: string;
  network: MapViewCollaborationNetworkType[] | null;
  mapFilters?: FilterValues;
}

const PAGE_SIZE = 50;

export function CollaborationNetworkPanel({
  institutionId,
  network,
  mapFilters,
}: CollaborationNetworkPanelProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const sorted = useMemo(
    () => [...(network ?? [])].sort((a, b) => (b.projects?.length ?? 0) - (a.projects?.length ?? 0)),
    [network],
  );

  const visible = useMemo(
    () => sorted.slice(0, visibleCount),
    [sorted, visibleCount],
  );

  const collaboratorIds = useMemo(
    () => visible.map((c) => c.collaborator_id),
    [visible],
  );

  const { data: names } = useGetBulkInstitutionNames(collaboratorIds);

  const topicsEnriched = useProjectTopicsEnriched();
  const topicMap = useMemo(() => {
    const map = new Map<string, TopicInfo>();
    topicsEnriched.forEach(({ project_id, topic_id, topic }) => {
      if (topic && !map.has(project_id)) {
        map.set(project_id, { topic_id, topic_name: topic.topic_name });
      }
    });
    return map;
  }, [topicsEnriched]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="body2" color="text.secondary">
        <GroupsIcon fontSize="small" /> Collaboration network of
      </Typography>

      {/* Main institution detail */}
      <InstitutionDetailView institutionId={institutionId} />

      <Divider />

      {/* Collaborators */}
      {network === null ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1 }}>
          <CircularProgress size={16} />
          <Typography variant="body2" color="text.secondary">
            Loading network data...
          </Typography>
        </Box>
      ) : network.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No collaborations found with current filters.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            {sorted.length} Collaborators <GroupsIcon fontSize="small" />
          </Typography>
          {visible.map((collab) => {
            const nameEntry = names?.[collab.collaborator_id];
            const isOpen = openId === collab.collaborator_id;
            const collabProjects = collab.projects ?? [];

            return (
              <InstitutionListRow
                key={collab.collaborator_id}
                institutionId={collab.collaborator_id}
                legalName={nameEntry?.legal_name ?? null}
                countryCode={collab.collaborator_country}
                open={isOpen}
                onToggle={() =>
                  setOpenId(isOpen ? null : collab.collaborator_id)
                }
              >
                {collabProjects.length > 0 && (
                  <Box sx={{ mt: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                      <ScienceIcon sx={{ color: "secondary.main", fontSize: 20, mr: 1 }} />
                      {mapFilters ? (
                        <Link
                          href={buildListProjectUrl({
                            institutionId,
                            collaboratorId: collab.collaborator_id,
                            mapFilters,
                          })}
                          variant="body2"
                          underline="always"
                          sx={{ color: "primary.main", cursor: "pointer" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {collabProjects.length} shared project{collabProjects.length !== 1 ? "s" : ""}
                        </Link>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          {collabProjects.length} shared project{collabProjects.length !== 1 ? "s" : ""}
                        </Typography>
                      )}
                    </Box>
                    {collabProjects.map((p, idx) => (
                      <SharedProjectRow
                        key={`${p.project_id}-${idx}`}
                        projectId={p.project_id}
                        totalCost={p.total_cost}
                        startDate={p.start_date}
                        endDate={p.end_date}
                        topicMap={topicMap}
                        listViewUrl={mapFilters
                          ? buildListProjectUrl({ projectId: p.project_id, mapFilters })
                          : undefined}
                      />
                    ))}
                  </Box>
                )}
              </InstitutionListRow>
            );
          })}
          {sorted.length > visibleCount && (
            <Button
              size="small"
              sx={{ alignSelf: "flex-start", textTransform: "none", mt: 1 }}
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            >
              {(() => {
                const remaining = sorted.length - visibleCount;
                return `Load ${Math.min(remaining, PAGE_SIZE)} more (${remaining} remaining)`;
              })()}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}
