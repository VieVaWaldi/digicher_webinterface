"use client";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Pagination,
  Select,
  Skeleton,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useListFilters } from "@/hooks/persistence/useListFilters";
import { useTableViewProject } from "@/hooks/queries/views/table/useTableViewProject";
import { useTableViewResearchOutput } from "@/hooks/queries/views/table/useTableViewResearchOutput";
import { useTableViewInstitution } from "@/hooks/queries/views/table/useTableViewInstitution";
import { SearchBar, ENTITY_OPTIONS } from "@/components/mui/SearchBar";
import { ListFilterBar } from "@/components/listview/ListFilterBar";
import { ProjectRow } from "@/components/listview/rows/ProjectRow";
import { WorkRow } from "@/components/listview/rows/WorkRow";
import { InstitutionRow } from "@/components/listview/rows/InstitutionRow";
import { SideMenu } from "@/components/mui/SideMenu";
import { ProjectPanel } from "@/components/infopanel/panels/ProjectPanel";
import { WorkPanel } from "@/components/infopanel/panels/WorkPanel";
import { InstitutionDetailView } from "@/components/infopanel/shared/InstitutionDetailView";
import { useTopicFilter } from "@/components/filter/useTopicFilter";

const SORT_OPTIONS = {
  projects: [
    { value: "title", label: "Title" },
    { value: "start_date", label: "Start Date" },
    { value: "relevance", label: "Relevance" },
  ],
  works: [
    { value: "title", label: "Title" },
    { value: "publication_date", label: "Publication Date" },
    { value: "relevance", label: "Relevance" },
  ],
  institutions: [
    { value: "name", label: "Name" },
    { value: "country", label: "Country" },
  ],
};

function SkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <Box>
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
          <Skeleton variant="text" width="60%" height={22} />
          <Skeleton variant="text" width="40%" height={16} sx={{ mt: 0.5 }} />
        </Box>
      ))}
    </Box>
  );
}

export function ListViewContainer() {
  const {
    filters,
    setEntity,
    setQ,
    setPage,
    setSort,
    setMinYear,
    setMaxYear,
    setFps,
    clearInstitution,
    clearCollaboratorId,
    clearProjectId,
    setTopicIds,
    setSubfieldIds,
    setFieldIds,
    clearTopicFilters,
    setWorkType,
    setCountries,
    setInstTypes,
    setSme,
  } = useListFilters();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);

  const { TopicFilter } = useTopicFilter({
    initialFields: filters.fieldIds,
    initialSubfields: filters.subfieldIds,
    initialTopics: filters.topicIds.map(Number),
    onFieldsChange: setFieldIds,
    onSubfieldsChange: setSubfieldIds,
    onTopicsChange: (v) => setTopicIds(v.map(String)),
  });

  const projectParams = {
    search: filters.q || undefined,
    minYear: filters.minYear,
    maxYear: filters.maxYear,
    frameworkProgrammes: filters.fps.length ? filters.fps : undefined,
    institutionId: filters.institution,
    collaboratorId: filters.collaboratorId,
    projectIds: filters.projectId ? [filters.projectId] : undefined,
    topicIds: filters.topicIds.length ? filters.topicIds : undefined,
    subfieldIds: filters.subfieldIds.length ? filters.subfieldIds : undefined,
    fieldIds: filters.fieldIds.length ? filters.fieldIds : undefined,
    page: filters.page,
    limit: 20,
    sortBy: filters.sortBy as any,
    sortOrder: filters.sortOrder,
  };

  const workParams = {
    search: filters.q || undefined,
    minYear: filters.minYear,
    maxYear: filters.maxYear,
    page: filters.page,
    limit: 20,
    sortBy: filters.sortBy as any,
    sortOrder: filters.sortOrder,
  };

  const institutionParams = {
    search: filters.q || undefined,
    countries: filters.countries.length ? filters.countries : undefined,
    types: filters.instTypes.length ? filters.instTypes : undefined,
    sme: filters.sme,
    page: filters.page,
    limit: 20,
    sortBy: filters.sortBy as any,
    sortOrder: filters.sortOrder,
  };

  const projectQuery = useTableViewProject(projectParams, filters.entity === "projects");
  const workQuery = useTableViewResearchOutput(workParams, filters.entity === "works");
  const institutionQuery = useTableViewInstitution(institutionParams, filters.entity === "institutions");

  const isLoading =
    (filters.entity === "projects" && projectQuery.isLoading) ||
    (filters.entity === "works" && workQuery.isLoading) ||
    (filters.entity === "institutions" && institutionQuery.isLoading);

  const pagination =
    filters.entity === "projects"
      ? projectQuery.data?.pagination
      : filters.entity === "works"
        ? workQuery.data?.pagination
        : institutionQuery.data?.pagination;

  // Auto-open side panel when arriving via projectId deep-link
  useEffect(() => {
    if (filters.projectId && projectQuery.data?.data?.length === 1) {
      setSelectedId(projectQuery.data.data[0].id);
    }
  }, [filters.projectId, projectQuery.data]);

  const handleSelect = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const sidePanelTitle =
    filters.entity === "projects"
      ? "Project Details"
      : filters.entity === "works"
        ? "Work Details"
        : "Institution Details";

  const sortOptions = SORT_OPTIONS[filters.entity];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Search bar */}
      <Box sx={{ px: 3, pt: 2, pb: 1, flexShrink: 0 }}>
        <SearchBar
          value={filters.q}
          onSearch={setQ}
          onClear={() => setQ("")}
          entityOptions={ENTITY_OPTIONS}
          selectedEntity={filters.entity}
          onEntityChange={(v) => setEntity(v as any)}
          placeholder={`Search ${filters.entity}…`}
          reverseLayout
        />
      </Box>

      {/* Filter bar */}
      <Box sx={{ px: 3, flexShrink: 0 }}>
        <ListFilterBar
          filters={filters}
          onMinYear={setMinYear}
          onMaxYear={setMaxYear}
          onFps={setFps}
          onClearInstitution={clearInstitution}
          onClearCollaboratorId={clearCollaboratorId}
          onClearProjectId={clearProjectId}
          topicFilterCount={filters.topicIds.length + filters.subfieldIds.length + filters.fieldIds.length}
          onOpenTopicPicker={() => setTopicDialogOpen(true)}
          onClearTopicFilters={clearTopicFilters}
          onWorkType={setWorkType}
          onCountries={setCountries}
          onInstTypes={setInstTypes}
          onSme={setSme}
        />
      </Box>

      {/* Result count + sort */}
      <Box
        sx={{
          px: 3,
          py: 0.75,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {pagination
            ? `${pagination.total.toLocaleString()} result${pagination.total !== 1 ? "s" : ""}`
            : isLoading
              ? "Loading…"
              : ""}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Sort by
          </Typography>
          <Select
            size="small"
            value={filters.sortBy}
            onChange={(e) => setSort(e.target.value, filters.sortOrder)}
            variant="standard"
            disableUnderline
            sx={{ fontWeight: 500 }}
          >
            {sortOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
          <Button
            size="small"
            onClick={() =>
              setSort(filters.sortBy, filters.sortOrder === "asc" ? "desc" : "asc")
            }
            sx={{ textTransform: "none", minWidth: 0, px: 1 }}
          >
            {filters.sortOrder === "asc" ? "↑" : "↓"}
          </Button>
        </Box>
      </Box>

      {/* Main content area */}
      <Box sx={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {/* List */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            transition: "flex 0.2s ease",
          }}
        >
          {isLoading ? (
            <SkeletonRows />
          ) : (
            <>
              {filters.entity === "projects" && (
                <>
                  {(projectQuery.data?.data ?? []).length === 0 ? (
                    <Box sx={{ px: 3, py: 4, textAlign: "center" }}>
                      <Typography variant="body2" color="text.secondary">
                        No projects found. Try adjusting your search or filters.
                      </Typography>
                    </Box>
                  ) : (
                    (projectQuery.data?.data ?? []).map((project) => (
                      <ProjectRow
                        key={project.id}
                        id={project.id}
                        title={project.title}
                        acronym={project.acronym}
                        start_date={project.start_date}
                        end_date={project.end_date}
                        onSelect={handleSelect}
                        selected={selectedId === project.id}
                      />
                    ))
                  )}
                </>
              )}

              {filters.entity === "works" && (
                <>
                  {(workQuery.data?.data ?? []).length === 0 ? (
                    <Box sx={{ px: 3, py: 4, textAlign: "center" }}>
                      <Typography variant="body2" color="text.secondary">
                        No works found. Try adjusting your search or filters.
                      </Typography>
                    </Box>
                  ) : (
                    (workQuery.data?.data ?? []).map((work) => (
                      <WorkRow
                        key={work.id}
                        id={work.id}
                        title={work.title}
                        publication_date={work.publication_date}
                        doi={work.doi}
                        onSelect={handleSelect}
                        selected={selectedId === work.id}
                      />
                    ))
                  )}
                </>
              )}

              {filters.entity === "institutions" && (
                <>
                  {(institutionQuery.data?.data ?? []).length === 0 ? (
                    <Box sx={{ px: 3, py: 4, textAlign: "center" }}>
                      <Typography variant="body2" color="text.secondary">
                        No institutions found. Try adjusting your search or filters.
                      </Typography>
                    </Box>
                  ) : (
                    (institutionQuery.data?.data ?? []).map((inst) => (
                      <InstitutionRow
                        key={inst.id}
                        id={inst.id}
                        legal_name={inst.legal_name}
                        short_name={inst.short_name}
                        country_code={inst.country_code}
                        country_label={inst.country_label}
                        city={inst.city}
                        type_title={inst.type_title}
                        sme={inst.sme}
                        onSelect={handleSelect}
                        selected={selectedId === inst.id}
                      />
                    ))
                  )}
                </>
              )}
            </>
          )}
        </Box>

        {/* Side panel */}
        {selectedId && (
          <SideMenu
            side="right"
            title={sidePanelTitle}
            open={!!selectedId}
            onClose={() => setSelectedId(null)}
            width="33vw"
          >
            {filters.entity === "projects" && (
              <ProjectPanel
                projects={[
                  {
                    project_id: selectedId,
                    start_date: null,
                    end_date: null,
                    total_cost: null,
                    framework_programmes: [],
                  },
                ]}
              />
            )}
            {filters.entity === "works" && <WorkPanel workId={selectedId} />}
            {filters.entity === "institutions" && (
              <InstitutionDetailView institutionId={selectedId} />
            )}
          </SideMenu>
        )}
      </Box>

      {/* Topic filter dialog */}
      <Dialog open={topicDialogOpen} onClose={() => setTopicDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Filter by Topics</DialogTitle>
        <DialogContent>{TopicFilter}</DialogContent>
        <DialogActions>
          <Button onClick={() => setTopicDialogOpen(false)}>Done</Button>
        </DialogActions>
      </Dialog>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 1,
            borderTop: 1,
            borderColor: "divider",
            flexShrink: 0,
          }}
        >
          <Pagination
            count={pagination.totalPages}
            page={filters.page + 1}
            onChange={(_, page) => setPage(page - 1)}
            size="small"
          />
        </Box>
      )}
    </Box>
  );
}
