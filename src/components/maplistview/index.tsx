import React, { ReactNode, useMemo, useState } from "react";
import { MapViewInstitutionType } from "db/schemas/core-map-view";
import { MapViewCollaborationByTopicType } from "db/schemas/core-map-view";
import { MapListItem, SortOrder } from "./types";
import { toListItems, toTopicNetworkListItems } from "./adapters";
import { MapListView } from "./MapListView";

export type { MapListItem, SortOrder } from "./types";

interface MapListViewOptions {
  onFlyTo?: (geo: number[]) => void;
  onRowClick?: (item: MapListItem) => void;
}

function sortItems(items: MapListItem[], sortOrder: SortOrder): MapListItem[] {
  return [...items].sort((a, b) =>
    sortOrder === "cost-desc"
      ? b.totalCost - a.totalCost
      : a.totalCost - b.totalCost,
  );
}

export function useInstitutionListView(
  data: MapViewInstitutionType[],
  options?: MapListViewOptions,
): ReactNode {
  const [sortOrder, setSortOrder] = useState<SortOrder>("cost-desc");
  const [page, setPage] = useState(0);

  const rawItems = useMemo(() => toListItems(data), [data]);
  const items = useMemo(
    () => sortItems(rawItems, sortOrder),
    [rawItems, sortOrder],
  );

  return (
    <MapListView
      items={items}
      sortOrder={sortOrder}
      onSortChange={setSortOrder}
      page={page}
      onPageChange={setPage}
      onFlyTo={options?.onFlyTo}
      onRowClick={options?.onRowClick}
    />
  );
}

export function useTopicNetworkListView(
  data: MapViewCollaborationByTopicType[],
  options?: MapListViewOptions,
): ReactNode {
  const [sortOrder, setSortOrder] = useState<SortOrder>("cost-desc");
  const [page, setPage] = useState(0);

  const rawItems = useMemo(() => toTopicNetworkListItems(data), [data]);
  const items = useMemo(
    () => sortItems(rawItems, sortOrder),
    [rawItems, sortOrder],
  );

  return (
    <MapListView
      items={items}
      sortOrder={sortOrder}
      onSortChange={setSortOrder}
      page={page}
      onPageChange={setPage}
      onFlyTo={options?.onFlyTo}
      onRowClick={options?.onRowClick}
    />
  );
}
