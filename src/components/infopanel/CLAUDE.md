# Infopanel

## selectedItem Pattern

`selectedItem` is a discriminated union (`SelectedItem` in `types.ts`) that stores **selection identity**, not derived data snapshots.

### grouped-institution

Stores only `geolocation: number[]` and `institutionIds: string[]` — the minimal identity of what was clicked.

Each scenario derives a live `selectedGeoGroup: GeoGroup | null` via `useMemo` from the current `filteredData`:

```typescript
const selectedGeoGroup = useMemo((): GeoGroup | null => {
  if (!selectedItem || selectedItem.type !== "grouped-institution") return null;
  const instMap = new Map(filteredData.map((i) => [i.institution_id, i]));
  const institutions = selectedItem.institutionIds.map(
    (id) => instMap.get(id) ?? { institution_id: id, geolocation: selectedItem.geolocation, country_code: null, type: null, sme: null, projects: null },
  );
  return { geolocation: selectedItem.geolocation, institutions, count: institutions.length };
}, [selectedItem, filteredData]);
```

This `selectedGeoGroup` is passed down: `scenario → MapController → InfoPanelContainer → GroupedInstitutionPanel`. Because it's derived from `filteredData`, it always reflects current filters — no re-sync effects needed.

**Rule:** Never store `GeoGroup` directly in `selectedItem`. Always store IDs and derive.

### collab-network

Stores `institutionId` (identity) + `network` (filtered snapshot). Network is re-synced via a dedicated `useEffect` in `collaboration/page.tsx` that watches `filteredCollaborationNetwork`. This is necessary because the network data comes from a separate API call keyed by institution ID.

### project

Stores `projects: ProjectPanelData[]` (project IDs + metadata). Panel fetches fresh data via API hooks — no re-sync needed.

## Panel Components

Panel components (`GroupedInstitutionPanel`, `CollaborationNetworkPanel`, `ProjectPanel`) are stateless with respect to filters. They receive fully-resolved data props and do not know about filter state.
