import { MapViewCollaborationByTopicType } from "db/schemas/core-map-view";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { Slider } from "components/mui/Slider";

interface MinConnectionsFilterOptions {
  data: MapViewCollaborationByTopicType[];
}

interface MinConnectionsFilterResult {
  MinConnectionsFilter: ReactNode;
  connectionFilteredData: MapViewCollaborationByTopicType[];
  minConnections: number;
}

const HELP_TEXT =
  "This filter hides less connected institutions. " +
  "It shows only institutions with at least the selected number of unique collaborating institutions. " +
  "Edges connecting a kept institution to a hidden one are also removed.";

export default function useMinConnectionsFilter({
  data,
}: MinConnectionsFilterOptions): MinConnectionsFilterResult {
  const [minConnections, setMinConnections] = useState(1);

  /** Count unique collaborating institutions per institution across all edges. */
  const connectionCounts = useMemo(() => {
    const counts = new Map<string, Set<string>>();
    for (const row of data) {
      if (!counts.has(row.a_institution_id))
        counts.set(row.a_institution_id, new Set());
      if (!counts.has(row.b_institution_id))
        counts.set(row.b_institution_id, new Set());
      counts.get(row.a_institution_id)!.add(row.b_institution_id);
      counts.get(row.b_institution_id)!.add(row.a_institution_id);
    }
    return counts;
  }, [data]);

  const maxConnections = useMemo(() => {
    if (connectionCounts.size === 0) return 1;
    return Math.max(...Array.from(connectionCounts.values()).map((s) => s.size));
  }, [connectionCounts]);

  /** Clamp slider value when filtered data reduces the available maximum. */
  const effectiveMin = Math.min(minConnections, maxConnections);

  const connectionFilteredData = useMemo(() => {
    if (effectiveMin <= 1) return data;
    return data.filter(
      (row) =>
        (connectionCounts.get(row.a_institution_id)?.size ?? 0) >=
          effectiveMin &&
        (connectionCounts.get(row.b_institution_id)?.size ?? 0) >= effectiveMin,
    );
  }, [data, connectionCounts, effectiveMin]);

  const handleChange = useCallback((value: number) => {
    setMinConnections(value);
  }, []);

  const MinConnectionsFilter: ReactNode = (
    <Slider
      min={1}
      max={maxConnections}
      value={effectiveMin}
      onChange={handleChange}
      step={1}
      label="Unique collaborators"
      helpText={HELP_TEXT}
    />
  );

  return {
    MinConnectionsFilter,
    connectionFilteredData,
    minConnections: effectiveMin,
  };
}