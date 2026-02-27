# List View — Developer Documentation

The `/list` page is a paginated, searchable, sortable browse interface for the three core entity types: **Projects**, **Works**, and **Institutions**. This document covers everything needed to maintain or extend it.

---

## File Map

```
src/
├── app/
│   ├── list/
│   │   └── page.tsx                          ← Route entry point (client, Suspense wrapper)
│   └── api/views/table/
│       ├── project/route.tsx                 ← Projects API (extended with institutionId)
│       ├── researchoutput/route.tsx          ← Works API (pre-existing)
│       └── institution/route.ts              ← Institutions API (new)
│
├── hooks/
│   ├── persistence/
│   │   └── useListFilters.ts                 ← URL-synced filter state (the source of truth)
│   └── queries/views/table/
│       ├── useTableViewProject.tsx           ← Fetches projects (extended with institutionId)
│       ├── useTableViewResearchOutput.tsx    ← Fetches works (pre-existing)
│       └── useTableViewInstitution.ts        ← Fetches institutions (new)
│
└── components/
    ├── listview/
    │   ├── CLAUDE.md                         ← This file
    │   ├── ListViewContainer.tsx             ← Main orchestrator
    │   ├── ListFilterBar.tsx                 ← Entity-specific filter controls
    │   └── rows/
    │       ├── ProjectRow.tsx
    │       ├── WorkRow.tsx
    │       └── InstitutionRow.tsx
    ├── infopanel/panels/
    │   └── WorkPanel.tsx                     ← New side panel for works
    └── mui/
        └── SearchBar.tsx                     ← Entity selector lives here (ENTITY_OPTIONS)
```

---

## URL Schema

All state is persisted in the URL. The page is fully linkable and shareable.

```
/list?entity=projects&q=heritage&page=2&sort=start_date&sortOrder=desc&minYear=2018&maxYear=2023&fps=H2020,HORIZON&institution=abc123
/list?entity=works&q=digital&minYear=2020&type=article
/list?entity=institutions&q=museum&countries=DE,AT&instTypes=HES,REC&sme=true
```

### Parameter reference

| Param       | Type                              | Default     | Applies to          |
|-------------|-----------------------------------|-------------|---------------------|
| `entity`    | `projects\|works\|institutions`   | `projects`  | all                 |
| `q`         | string                            | `""`        | all                 |
| `page`      | number (0-indexed)                | `0`         | all                 |
| `sort`      | see sort options per entity       | `title`     | all                 |
| `sortOrder` | `asc\|desc`                       | `asc`       | all                 |
| `minYear`   | number                            | —           | projects, works     |
| `maxYear`   | number                            | —           | projects, works     |
| `fps`       | comma-separated FP codes          | —           | projects            |
| `institution` | institution ID string           | —           | projects            |
| `type`      | string (publication type)         | —           | works               |
| `countries` | comma-separated country codes     | —           | institutions        |
| `instTypes` | comma-separated type codes        | —           | institutions        |
| `sme`       | `true`                            | —           | institutions        |

**Note:** `sortBy` defaults omit from URL to keep URLs clean (`title` is never written, `asc` is never written).

---

## Data Flow

```
URL params
    ↓
useListFilters (parseFilters)       ← single source of truth, state + URL in sync
    ↓
ListViewContainer
    ├── SearchBar                   ← entity selector + text search
    ├── ListFilterBar               ← entity-specific filter controls
    ├── useTableViewProject  }
    ├── useTableViewResearchOutput  }  only the active entity query is enabled
    └── useTableViewInstitution }
    ↓
Row components (click → setSelectedId)
    ↓
SideMenu (33vw, slides in from right)
    └── ProjectPanel / WorkPanel / InstitutionDetailView
```

---

## `useListFilters` — URL persistence hook

**Location:** `src/hooks/persistence/useListFilters.ts`

Single hook that owns all filter state. Reads from `useSearchParams`, writes via `router.push`.

### Debouncing

- Text search (`setQ`) — **400 ms debounce** before URL update, so typing doesn't spam the router.
- All other setters pass `immediate = true` — URL updates synchronously (no debounce).
- Uses `useRef<ReturnType<typeof setTimeout>>` to track the debounce timer.

### Exposed setters

```ts
setEntity(entity: ListEntity)     // resets page + q
setQ(q: string)                   // debounced
setPage(page: number)             // 0-indexed
setSort(sortBy, sortOrder)        // resets page
setMinYear(v?: number)            // debounced (via setFilters)
setMaxYear(v?: number)            // debounced
setFps(fps: string[])             // immediate
clearInstitution()                // immediate, removes institution param
setWorkType(v?: string)           // immediate
setCountries(countries: string[]) // immediate
setInstTypes(types: string[])     // immediate
setSme(v?: boolean)               // immediate
```

### `ListFilters` type

```ts
interface ListFilters {
  entity: "projects" | "works" | "institutions";
  q: string;
  page: number;                  // 0-indexed internally; MUI Pagination is 1-indexed
  sortBy: string;
  sortOrder: "asc" | "desc";
  minYear?: number;
  maxYear?: number;
  fps: string[];                 // framework programme codes, e.g. ["H2020", "HORIZON"]
  institution?: string;          // institution ID — pre-filter from infopanel link
  workType?: string;
  countries: string[];           // country codes matching DB values (note: GB → UK)
  instTypes: string[];           // e.g. ["HES", "REC"]
  sme?: boolean;
}
```

---

## Entity Details

### Projects

**API route:** `GET /api/views/table/project`
**Query hook:** `useTableViewProject`
**Row component:** `ProjectRow`
**Side panel:** `ProjectPanel` (wraps a single project in the `projects[]` array format it expects)
**Sort options:** `title`, `start_date`, `relevance` (relevance only meaningful when `q` is set)

**`institution` filter:**
When `institution=<id>` is in the URL, the API adds a subquery:
```sql
WHERE id IN (
  SELECT project_id FROM core.j_project_institution
  WHERE institution_id = ?
)
```
This is how the infopanel "View projects for institution" deep-link works.
In `ListFilterBar`, when `institution` is set, an `InstitutionChip` renders showing the institution's name (fetched via `useInstitutionById`) with an `×` to dismiss it.

**Data source:** `core.table_view_project` (Drizzle view, defined in `src/db/schemas/core-table-view.ts`)

---

### Works (Research Outputs)

**API route:** `GET /api/views/table/researchoutput`
**Query hook:** `useTableViewResearchOutput`
**Row component:** `WorkRow`
**Side panel:** `WorkPanel` (`src/components/infopanel/panels/WorkPanel.tsx`)
**Sort options:** `title`, `publication_date`, `relevance`

**What `WorkPanel` shows:** title, type chip, open-access chip, publication date, journal, ISSN, publisher, language, DOI link, citation/influence/popularity metrics, collapsible abstract (truncated at 400 chars).

**Data source:** `core.researchoutput` table directly.

**Note:** The work type filter (`type` URL param) is parsed in `useListFilters` but **not yet wired into the API call** in `ListViewContainer`. The API does not currently accept a `type` filter — this is a known gap to implement if needed.

---

### Institutions

**API route:** `GET /api/views/table/institution`
**Query hook:** `useTableViewInstitution`
**Row component:** `InstitutionRow`
**Side panel:** `InstitutionDetailView` (the shared detail component from infopanel)
**Sort options:** `name`, `country`

**FTS search:** Uses `to_tsvector('simple', ...)` (not `'english'`) because institution names are proper nouns and should not be stemmed.

**Country code note:** The `countries-list` package uses `GB` for the UK, but the DB stores `UK`. The `matchCodesToDB` function in `ListFilterBar` handles this mapping.

**Institution type codes** (hardcoded in `ListFilterBar`, matched against `core.institution.type_title`):
- `HES` — Higher Education
- `REC` — Research Centre
- `PRC` — Private Company
- `PUB` — Public Body
- `OTH` — Other

**Data source:** `core.institution` table directly (re-exported from `core-table-view.ts` as `tableViewInstitution` — though the institution route imports directly from `core.ts`).

---

## Components

### `ListViewContainer`

The main orchestrator. Reads all state from `useListFilters`, fires the correct query (only the active entity query is `enabled`), renders the layout.

**Layout structure (flex column, `height: 100%` — fills the `flex: 1` container from `page.tsx`, do NOT change to `100vh` or pagination will be clipped by the parent's `overflow: hidden`):**
1. `SearchBar` — search input + entity selector dropdown
2. `ListFilterBar` — entity-specific filters
3. Result count + sort controls (inline)
4. Scrollable list area (flex row: list + side panel)
5. `Pagination` (only shown when `totalPages > 1`)

**Side panel:** Uses `SideMenu` with `width="33vw"`, `side="right"`. It uses `position: absolute` within the list area's `position: relative` container. The list does not visually shrink when the panel opens — the panel overlays it. Clicking the same row again closes the panel (toggle behaviour).

**Loading state:** `SkeletonRows` — 5 skeleton rows while the query is in flight.

**Empty state:** Inline message per entity when `data.length === 0`.

**`ProjectPanel` wrapping:** `ProjectPanel` expects `projects: ProjectPanelData[]`. When used in the list view, we pass a minimal object `{ project_id: selectedId, start_date: null, ... }` — the panel fetches full data itself via `useProjectbyId`.

---

### `ListFilterBar`

Renders different controls depending on `filters.entity`. Receives all filter values and setters as props (no internal state). Fully controlled.

**Project filters:** Institution chip (dismissible) · From/To year `TextField` · Framework Programmes `MultiSelectDropdown`
**Work filters:** From/To year `TextField` · Publication type `Select`
**Institution filters:** Countries `MultiSelectDropdown` · Institution Types `MultiSelectDropdown` · SME toggle `Chip`

The `InstitutionChip` sub-component does its own `useInstitutionById` fetch to resolve the institution name from the ID stored in the URL.

---

### Row Components (`rows/`)

All three rows follow the same pattern:
- MUI `Box` with `onClick={() => onSelect(id)}`
- `selected` prop sets `backgroundColor: "action.selected"`
- Hover: `backgroundColor: "action.hover"` (unless selected)
- `borderBottom: 1px solid divider`, no border on `:last-child`
- Two lines: primary info (bold) + secondary metadata (caption, text.secondary)

**`ProjectRow`** — accepts optional `end_date`, `total_cost`, `status`, `framework_programmes`. Currently `ListViewContainer` only passes `id`, `title`, `acronym`, `start_date` (the minimum returned by the table view query). Add more fields to the API `select` and row props if richer display is needed.

**`WorkRow`** — accepts optional `journal_name`, `open_access_color`, `citation_count`, `type`. Currently only `id`, `title`, `publication_date`, `doi` are passed (again, limited by the API select).

**`InstitutionRow`** — all fields passed through since the institution API returns them all.

---

## API Routes

All routes follow the project's standard pattern:
- Wrapped with `withApiWrapper` (handles errors, logging)
- Return `apiSuccess({ data, pagination, filters })` — no envelope wrapper
- Pagination is 0-indexed (`page: 0` = first page)
- Default `limit: 20` for all list routes

### Response shape (all three routes)

```ts
{
  data: T[];
  pagination: {
    page: number;       // 0-indexed
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: SearchParams; // echo of applied params
}
```

---

## `SearchBar` — Entity Selector

`ENTITY_OPTIONS` in `src/components/mui/SearchBar.tsx` controls which entities appear in the dropdown. Works was previously commented out and was enabled as part of this implementation. Adding a new entity requires adding an entry here and handling it throughout.

---

## How to Add a New Entity

1. **API route** — create `src/app/api/views/table/<entity>/route.ts` following the project/institution pattern
2. **Query hook** — create `src/hooks/queries/views/table/useTableView<Entity>.ts`
3. **Row component** — create `src/components/listview/rows/<Entity>Row.tsx`
4. **Side panel** — create or reuse a panel component
5. **`useListFilters`** — add entity-specific filter fields to `ListFilters`, `parseFilters`, `buildQueryString`, and new setter functions
6. **`ListFilterBar`** — add a new `entity === "<entity>"` branch with the relevant filter controls
7. **`ListViewContainer`** — add the new query, loading check, pagination selection, row rendering branch, and side panel branch
8. **`SORT_OPTIONS`** in `ListViewContainer` — add the new entity's sort options
9. **`ENTITY_OPTIONS`** in `SearchBar.tsx` — add the entity option with an icon

---

## Known Gaps / Future Work

- **Work type filter** — the `workType` field in `useListFilters` and `type` URL param are parsed and shown in `ListFilterBar`, but the value is not forwarded to the API call in `ListViewContainer` or accepted by the researchoutput API route. Wire up when needed.
- **ProjectRow richness** — the `table_view_project` view returns `status`, `end_date`, `total_cost`, `framework_programmes` but these are not currently selected in the project query and not passed to `ProjectRow`. Extend if denser rows are desired.
- **WorkRow richness** — same situation: `journal_name`, `open_access_color`, `citation_count`, `type` exist in `core.researchoutput` but the API only returns `id`, `title`, `publication_date`, `doi`.
- **Side panel URL state** — the selected row ID is local React state (`useState`), not persisted in the URL. Deep-linking to a pre-opened panel is not supported.
- **Page size** — hardcoded to `limit: 20` in `ListViewContainer`. Could be made configurable.