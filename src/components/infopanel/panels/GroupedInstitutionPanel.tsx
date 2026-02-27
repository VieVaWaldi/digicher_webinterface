"use client";

import { Box, Button, Divider, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { GeoGroup } from "@/app/scenarios/scenario_data";
import { useGetBulkInstitutionNames } from "@/hooks/queries/institution/useGetBulkInstitutionNames";
import { InstitutionDetailView } from "@/components/infopanel/shared/InstitutionDetailView";
import { InstitutionListRow } from "@/components/infopanel/shared/InstitutionListRow";
import { FilterValues } from "@/hooks/persistence/useFilters";
import { buildListProjectUrl } from "@/utils/buildListUrl";

const PAGE_SIZE = 50;

interface GroupedInstitutionPanelProps {
  data: GeoGroup;
  mapFilters?: FilterValues;
}

export function GroupedInstitutionPanel({ data, mapFilters }: GroupedInstitutionPanelProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [openId, setOpenId] = useState<string | null>(null);

  const sorted = useMemo(
    () =>
      [...data.institutions].sort(
        (a, b) => (b.projects?.length ?? 0) - (a.projects?.length ?? 0),
      ),
    [data.institutions],
  );

  const visible = useMemo(
    () => sorted.slice(0, visibleCount),
    [sorted, visibleCount],
  );
  const visibleIds = useMemo(() => visible.map((i) => i.institution_id), [visible]);
  const { data: names } = useGetBulkInstitutionNames(visibleIds);

  const remaining = data.count - visibleCount;

  function toggleOpen(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  // Single institution: show detail view directly
  if (data.count === 1) {
    const inst = data.institutions[0];
    return (
      <InstitutionDetailView
        institutionId={inst.institution_id}
        projectsData={inst.projects ?? undefined}
        listViewUrl={mapFilters
          ? buildListProjectUrl({ institutionId: inst.institution_id, mapFilters })
          : undefined}
      />
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {data.count} institutions at this location
      </Typography>
      <Divider />
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {visible.map((inst) => {
          const nameEntry = names?.[inst.institution_id];
          const listUrl = mapFilters
            ? buildListProjectUrl({ institutionId: inst.institution_id, mapFilters })
            : undefined;
          return (
            <InstitutionListRow
              key={inst.institution_id}
              institutionId={inst.institution_id}
              legalName={nameEntry?.legal_name ?? null}
              countryCode={inst.country_code}
              open={openId === inst.institution_id}
              onToggle={() => toggleOpen(inst.institution_id)}
              projectsData={inst.projects ?? undefined}
              listViewUrl={listUrl}
            />
          );
        })}
      </Box>

      {remaining > 0 && (
        <Button
          size="small"
          sx={{ alignSelf: "flex-start", textTransform: "none" }}
          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
        >
          Load {Math.min(remaining, PAGE_SIZE)} more ({remaining} remaining)
        </Button>
      )}
    </Box>
  );
}
