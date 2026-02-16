"use client";

import MapController from "@/components/deckgl/MapController";
import { useTopicFilter } from "components/filter/useTopicFilter";
import useYearRangeFilter from "components/filter/useYearRangeFilter";
import { INITIAL_VIEW_STATE_TILTED_EU } from "@/components/deckgl/viewports";
import {
  ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import useCountryFilter from "@/components/filter/useCountryFilter";
import { useFilters } from "@/hooks/persistence/useFilters";
import { useDebouncedCallback } from "use-debounce";
import { useMapViewInstitution } from "@/hooks/queries/views/map/useMapViewInstitution";
import useTypeAndSmeFilter from "@/components/filter/useTypeAndSmeFilter";
import { FilterSection, useUnifiedSearchFilter } from "@/components/mui";
import { ENTITY_OPTIONS } from "@/components/mui/SearchBar";
import useFrameworkProgrammeFilter from "@/components/filter/useFrameworkProgrammeFilter";
import { Box, Typography, useTheme } from "@mui/material";
import { groupByGeolocation } from "@/app/scenarios/scenario_data";
import { LayerConfig } from "@/components/mui/LayerSwitcher";
import { CollaborationNetworkLayer } from "@/components/deckgl/layers/CollaborationNetworkLayer";
import { useCollaborationNetworkById } from "@/hooks/queries/collaboration/useCollaborationNetworkById";

function CollaborationScenarioContent() {
  const { data, isPending, error } = useMapViewInstitution();

  /** ToDo, the 2nd Layer */
  // const {
  //   data: mapViewCollaborations,
  //   isPending,
  //   error,
  // } = useCollaborationsEnriched(); // loses projects not in scenarios view

  const [selectedInstitutionId, setSelectedInstitutionId] = useState<
    string | null
  >(null);

  /** Hover State */
  //   const [hoverInfo, setHoverInfo] = useState<{
  //     x: number;
  //     y: number;
  //     weight: number;
  //     object: any;
  //   } | null>(null);

  /** URL Filter State */

  const { filters: filterValues, setters, resetAll } = useFilters();

  const debouncedSetYearRange = useDebouncedCallback(setters.setYearRange, 300);
  const debouncedSetViewState = useDebouncedCallback(setters.setViewState, 300);
  const { YearRangeFilter, yearRangePredicate } = useYearRangeFilter({
    initialValue: filterValues.yearRange,
    onChange: debouncedSetYearRange,
  });
  const { CountryFilter, countryPredicate } = useCountryFilter({
    initialValue: filterValues.countries,
    onChange: setters.setCountries,
  });
  const { TypeAndSmeFilter, typeAndSmePredicate } = useTypeAndSmeFilter({
    initialValue: filterValues.typeAndSme,
    onChange: setters.setTypeAndSme,
  });
  const {
    SearchFilter,
    institutionSearchPredicate,
    projectSearchPredicate,
    MinorityGroupsFilter,
  } = useUnifiedSearchFilter({
    entityOptions: ENTITY_OPTIONS,
    defaultEntity: "projects",
    initialEntity: filterValues.unifiedSearch.entity,
    initialQuery: filterValues.unifiedSearch.query,
    initialMinorityGroups: filterValues.unifiedSearch.minorityGroups,
    onEntityChange: setters.setEntity,
    onQueryChange: setters.setQuery,
    onMinorityGroupsChange: setters.setMinorityGroups,
  });
  const { FrameworkProgrammeFilter, frameworkProgrammePredicate } =
    useFrameworkProgrammeFilter({
      initialValue: filterValues.frameworkProgrammes,
      onChange: setters.setFrameworkProgrammes,
    });
  const { TopicFilter, topicPredicate } = useTopicFilter();

  /** Apply Filters */

  const filteredData = useMemo(() => {
    if (!data?.length) return [];
    return data.flatMap((p) => {
      if (!institutionSearchPredicate(p.institution_id)) return [];
      if (!countryPredicate(p.country_code)) return [];
      if (!typeAndSmePredicate(p.type, p.sme)) return [];

      const matchingProjects = p.projects?.filter(
        (proj) =>
          topicPredicate(proj.id) &&
          projectSearchPredicate(proj.id) &&
          frameworkProgrammePredicate(proj.framework_programmes) &&
          yearRangePredicate(proj.start, proj.end),
      );
      if (!matchingProjects?.length) return [];

      return [{ ...p, projects: matchingProjects }];
    });
  }, [
    data,
    institutionSearchPredicate,
    countryPredicate,
    typeAndSmePredicate,
    topicPredicate,
    projectSearchPredicate,
    frameworkProgrammePredicate,
    yearRangePredicate,
  ]);

  /** UI Components */

  const totalProjects = useMemo(
    () => filteredData.reduce((sum, p) => sum + p.projects.length, 0),
    [filteredData],
  );

  const Filters: ReactNode = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography
        variant="h5"
        color="text.secondary"
        sx={{ textAlign: "center", mt: 1 }}
      >
        Displaying{" "}
        <Box component="span" sx={{ color: "secondary.main", fontWeight: 500 }}>
          {filteredData?.length.toLocaleString()}
        </Box>{" "}
        institutions &{" "}
        <Box component="span" sx={{ color: "secondary.main", fontWeight: 500 }}>
          {totalProjects.toLocaleString()}
        </Box>{" "}
        projects
      </Typography>

      <FilterSection showDivider={false}>{SearchFilter}</FilterSection>

      <FilterSection title="Project Time" showDivider={true}>
        {YearRangeFilter}
      </FilterSection>

      <FilterSection title="Geographic & Demographic">
        {CountryFilter}
        {MinorityGroupsFilter}
      </FilterSection>

      <FilterSection title="Institutional">
        {TypeAndSmeFilter}
        {FrameworkProgrammeFilter}
      </FilterSection>

      <FilterSection title="Topics">{TopicFilter}</FilterSection>
    </Box>
  );

  /** Calculations */

  // const uniqueInstitutions = useMemo(() => {
  //   if (!filteredDataView) return [];
  //
  //   const institutionMap = new Map();
  //
  //   filteredDataView
  //     .flatMap((collab) => [
  //       { id: collab?.a_institution_id, geolocation: collab?.a_geolocation },
  //       { id: collab?.b_institution_id, geolocation: collab?.b_geolocation },
  //     ])
  //     .forEach((inst) => {
  //       institutionMap.set(inst.id, inst);
  //     });
  //
  //   return Array.from(institutionMap.values());
  // }, [filteredDataView]);

  //   const MAX_COLLAB_WEIGHT = useMemo(() => {
  //     if (!collaborationView) return 0;
  //     return Math.max(...collaborationView.scenarios((d) => d.collaboration_weight));
  //   }, [collaborationView]);

  /** Event Handlers */

  const { data: networkData } = useCollaborationNetworkById(
    selectedInstitutionId,
  );

  useEffect(() => {
    if (networkData) {
      /** ToDo: This is where we open the SideMenu from */
      console.log("Network data:", networkData);
    }
  }, [networkData]);

  const handleMapOnClick = useCallback((info: any) => {
    if (info.object?.institutions?.length) {
      setSelectedInstitutionId(info.object.institutions[0].institution_id);
    }
  }, []);

  const handleEmptyMapClick = useCallback(() => {
    setSelectedInstitutionId(null);
  }, []);

  // const handleScatterOnClick = useCallback(
  //   (info: PickingInfo) => {
  //     console.log(info.object);
  //     if (info.object?.id) {
  //       setSelectedInstitutionId(info.object.id);
  //       setSelectedInfo(true);
  //     }
  //   },
  //   [uniqueInstitutions],
  // );

  //   const handleHover = useCallback((info: PickingInfo) => {
  //     if (info.object) {
  //       setHoverInfo({
  //         x: info.x,
  //         y: info.y,
  //         weight: info.object.collaboration_weight,
  //         object: info.object,
  //       });
  //     } else {
  //       setHoverInfo(null);
  //     }
  //   }, []);

  /** Layers */

  const groupedData = useMemo(
    () => groupByGeolocation(filteredData),
    [filteredData],
  );

  const sourcePosition = useMemo(() => {
    if (!selectedInstitutionId) return undefined;
    const inst = filteredData.find(
      (d) => d.institution_id === selectedInstitutionId,
    );
    return inst?.geolocation ?? undefined;
  }, [selectedInstitutionId, filteredData]);

  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const layerConfigs: LayerConfig[] = useMemo(
    () => [
      {
        id: "individual-icons",
        title: "Individual",
        description: "Click on an institution to reveal its network.",
        previewImage: "/images/settings/mapbox-dark.png",
        createLayers: () => [
          new CollaborationNetworkLayer({
            id: "collaboration-network",
            data: groupedData,
            isDark,
            onClick: handleMapOnClick,
            networkData,
            sourcePosition,
          }),
        ],
      },
    ],
    [groupedData, isDark, handleMapOnClick, networkData, sourcePosition],
  );

  // const scatterLayer = useMemo(() => {
  //   return new ScatterplotLayer({
  //     ...baseLayerProps,
  //     id: "scatter-projects",
  //     data: uniqueInstitutions,
  //     getFillColor: [255, 140, 0],
  //     getPosition: (d) => d.geolocation,
  //     onClick: handleScatterOnClick,
  //     updateTriggers: {
  //       getPosition: uniqueInstitutions,
  //       getFillColor: uniqueInstitutions,
  //     },
  //   });
  // }, [uniqueInstitutions, handleScatterOnClick]);
  //
  // const arcLayer = useMemo(() => {
  //   return new ArcLayer({
  //     id: "collaboration-arcs-all",
  //     data: filteredDataView,
  //     pickable: true,
  //     getSourcePosition: (c) => c.a_geolocation,
  //     getTargetPosition: (c) => c.b_geolocation,
  //     getSourceColor: (c) => getTopicColor(c.project_id),
  //     getTargetColor: (c) => getTopicColor(c.project_id),
  //     getWidth: 1,
  //     widthScale: 1,
  //     widthMinPixels: 0.5,
  //     updateTriggers: {
  //       getSourcePosition: filteredDataView,
  //       getTargetPosition: filteredDataView,
  //     },
  //   });
  // }, [filteredDataView]);

  /** Hover Tooltip */
  //   const hoverTooltip = hoverInfo && (
  //     <div
  //       style={{
  //         position: "absolute",
  //         pointerEvents: "none",
  //         left: hoverInfo.x,
  //         top: hoverInfo.y,
  //         backgroundColor: "rgba(0, 0, 0, 0.8)",
  //         color: "#fff",
  //         padding: "8px",
  //         borderRadius: "4px",
  //         transform: "translate(-50%, -100%)",
  //         marginTop: "-15px",
  //         zIndex: 1000,
  //       }}
  //     >
  //       <div>Total Collaborators: {hoverInfo.weight}</div>
  //     </div>
  //   );

  return (
    <MapController
      layerConfigs={layerConfigs}
      search={SearchFilter}
      filters={Filters}
      defaultViewState={INITIAL_VIEW_STATE_TILTED_EU}
      initialViewState={filterValues.viewState}
      onViewStateChange={debouncedSetViewState}
      onResetAll={resetAll}
      loading={isPending}
      error={error}
      onEmptyMapClick={handleEmptyMapClick}
      scenarioName="collaboration"
      scenarioTitle="Collaboration"
    />
  );
}

export default function CollaborationScenario() {
  return (
    <Suspense>
      <CollaborationScenarioContent />
    </Suspense>
  );
}
