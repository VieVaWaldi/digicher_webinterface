# Chapter 1: selectedItem Pattern

## Overview

`SelectedItem` is a discriminated union defined in `src/components/infopanel/types.ts`. It is the single source of truth for what the user has selected on the map or in a list. It stores **selection identity**, not derived/filtered data.

## The SelectedItem Type

```typescript
type SelectedItem =
  | { type: "grouped-institution"; geolocation: number[]; institutionIds: string[] }
  | { type: "collab-network"; institutionId: string; network: MapViewCollaborationNetworkType[] | null }
  | { type: "project"; projects: ProjectPanelData[] }
```

## grouped-institution

**Identity:** `geolocation` (the click coordinates) + `institutionIds[]` (which institutions were in the group).

**Why not store GeoGroup directly?** `GeoGroup.institutions[].projects` is a filtered snapshot. Storing it in state means the panel goes stale when filters change. Re-syncing via `useEffect` by geolocation key breaks for hex bins and distance clusters (synthetic centroids don't appear in `groupedData`).

**How it works:**
1. On click: store `{ type: "grouped-institution", geolocation: group.geolocation, institutionIds: group.institutions.map(i => i.institution_id) }`
2. Each scenario page derives `selectedGeoGroup: GeoGroup | null` via `useMemo` from `filteredData` + the stored IDs. This is always live.
3. `selectedGeoGroup` flows: scenario → `MapController` → `InfoPanelContainer` → `GroupedInstitutionPanel`

**No re-sync `useEffect` needed** for `grouped-institution`.

## collab-network

**Identity:** `institutionId` (string).
**Data:** `network` is a filtered snapshot, re-synced by a `useEffect` in `collaboration/page.tsx` that watches `filteredCollaborationNetwork`. This is necessary because the network comes from a separate API keyed by institution ID.

## project

**Identity + data:** `projects: ProjectPanelData[]` (project IDs + metadata). The `ProjectPanel` fetches additional data fresh via API hooks. No re-sync needed.

## URL Persistence

URL param `sel` encodes the selection key:
- `gi:lat,lng` — grouped-institution (geolocation used as key)
- `cn:institutionId` — collab-network
- `pr:projectId` — project

Managed via `useFilters().setters.setSelectionKey`. Scenario pages have two effects:
- **Sync effect** (skip initial mount): writes `selectedItem` → URL
- **Restore effect** (runs once on mount): reads URL → `selectedItem` + opens panel

## Rule

**Never store derived/filtered arrays directly in `selectedItem` for `grouped-institution`.** Always store the minimal identity (geolocation + IDs) and derive the live `GeoGroup` via `useMemo`.
