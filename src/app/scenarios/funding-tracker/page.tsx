"use client";

import { LayerSwitcher } from "@/components/baseui/LayerSwitcher";
import BaseUI from "components/baseui/BaseUI";
import useCountryFilter from "components/filter/useCountryFilter";
import useFrameworkProgrammeFilter from "components/filter/useFrameworkProgrammeFilter";
import useInstitutionSearchFilter from "components/filter/useInstitutionSearchFilter";
import useProjectSearchFilter from "components/filter/useProjectSearchFilter";
import { useTopicFilter } from "components/filter/useTopicFilter";
import useTypeAndSmeFilter from "components/filter/useTypeAndSmeFilter";
import useYearRangeFilter from "components/filter/useYearRangeFilter";
import { PickingInfo } from "deck.gl";
import { INITIAL_VIEW_STATE_TILTED_EU } from "deckgl/viewports";
import { useInstitutionById } from "hooks/queries/institution/useInstitutionById";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { useMapViewInstitution } from "hooks/queries/views/map/useMapViewInstitution";
import { Box, Typography } from "@mui/material";
import { FilterSection } from "@/components/mui";

export default function FundingScenario() {
  /** Main Data */
  const { data, isPending, error } = useMapViewInstitution();

  /** View Toggle */
  const [showInstitutions, setShowInstitutions] = useState<boolean>(false);

  /** Selected Institution */
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<
    string | null
  >(null);
  const { data: institution, isPending: isPendingInstitution } =
    useInstitutionById(selectedInstitutionId || "", {
      enabled: !!selectedInstitutionId,
    });

  /** Hover State */
  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    funding: number;
    object: any;
  } | null>(null);

  /** Filters - Commented out as requested */
  const { YearRangeFilter, yearRangePredicate } = useYearRangeFilter();
  const { CountryFilter, countryPredicate } = useCountryFilter();
  const { TypeAndSmeFilter, typeAndSmePredicate } = useTypeAndSmeFilter();
  const { InstitutionSearchFilter, institutionSearchPredicate } =
    useInstitutionSearchFilter();
  const { ProjectSearchFilter, projectSearchPredicate } =
    useProjectSearchFilter();
  const { FrameworkProgrammeFilter, frameworkProgrammePredicate } =
    useFrameworkProgrammeFilter();
  const { TopicFilter, topicPredicate } = useTopicFilter();

  // ToDo: In the new drizzle institutionView data type there is the information for per institution budget AND total project budget, so we can keep the
  // toggle removed. Now we can use the total project sums without institution budgets from here

  /** Apply Filters - Using unfiltered data for now */
  const filteredData = useMemo(() => {
    if (!data?.length) return [];

    const filtered = data.filter((p) => {
      if (!institutionSearchPredicate(p.institution_id)) return false;
      if (!countryPredicate(p.country_code)) return false;
      if (!typeAndSmePredicate(p.type, p.sme)) return false;

      const projects = p.projects;
      if (!projects?.length) return false;

      return projects.some(
        (proj) =>
          topicPredicate(proj.id) &&
          projectSearchPredicate(proj.id) &&
          frameworkProgrammePredicate(proj.framework_programmes) &&
          yearRangePredicate(proj.start, proj.end),
      );
    });

    if (showInstitutions) {
      const institutionMap = new Map();

      filtered.forEach((row) => {
        const existing = institutionMap.get(row.institution_id);
        if (existing) {
          existing.total_cost += row.total_cost || 0;
          existing.project_count += 1;
          // existing.project_ids.push(row.project_id);
        } else {
          institutionMap.set(row.institution_id, {
            ...row,
            total_cost: row.total_cost || 0,
            project_count: 1,
            // project_ids: [row.project_id],
          });
        }
      });

      return Array.from(institutionMap.values());
    }

    return filtered;
  }, [
    data,
    showInstitutions,
    institutionSearchPredicate,
    projectSearchPredicate,
    frameworkProgrammePredicate,
    yearRangePredicate,
    countryPredicate,
    typeAndSmePredicate,
    topicPredicate,
  ]);

  /** Calculations */
  const maxTotalCost = useMemo(() => {
    return filteredData.reduce((max, p) => {
      const cost = p.total_cost || 0;
      return Math.max(max, cost);
    }, 0);
  }, [filteredData]);

  const totalFunding = useMemo(() => {
    return filteredData.reduce((sum, p) => sum + (p.total_cost || 0), 0);
  }, [filteredData]);

  /** UI Components */

  const filters: ReactNode = (
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
        institutions and{" "}
        <Box component="span" sx={{ color: "secondary.main", fontWeight: 500 }}>
          {Math.round(totalFunding).toLocaleString()}€
        </Box>{" "}
        funded
      </Typography>

      {/* Search Section */}
      {/*<FilterSection showDivider={false}>{SearchFilter}</FilterSection>*/}

      {/* Time Section */}
      <FilterSection title="Project Time" showDivider={true}>
        {YearRangeFilter}
      </FilterSection>

      {/* Geographic & Demographic Section */}
      <FilterSection title="Geographic & Demographic">
        {CountryFilter}
        {/*{MinorityGroupsFilter}*/}
        {/*{NutsFilter}*/}
      </FilterSection>

      {/* Institutional Section */}
      <FilterSection title="Institutional">
        {TypeAndSmeFilter}
        {FrameworkProgrammeFilter}
        {/*{InstitutionSearchFilter}*/}
        {/*{ProjectSearchFilter}*/}
      </FilterSection>

      {/* Topics Section */}
      <FilterSection title="Topics">{TopicFilter}</FilterSection>
    </Box>
  );

  /** Event Handlers */
  const handleMapOnClick = useCallback(
    (info: PickingInfo) => {
      if (showInstitutions && info.object?.institution_id) {
        setSelectedInstitutionId(info.object.institution_id);
        console.log(info.object);
      } else if (!showInstitutions && info.object?.project_id) {
        setSelectedInstitutionId(info.object.institution_id);
      }
    },
    [showInstitutions],
  );

  const handleHover = useCallback((info: PickingInfo) => {
    if (info.object) {
      setHoverInfo({
        x: info.x,
        y: info.y,
        funding: info.object.total_cost || 0,
        object: info.object,
      });
    } else {
      setHoverInfo(null);
    }
  }, []);

  /** Layer Switcher */
  const { layer, layerSwitcherUI } = LayerSwitcher({
    data: filteredData,
    maxTotalCost,
    onMapClick: handleMapOnClick,
    onHover: handleHover,
  });

  /** Hover Tooltip */
  const hoverTooltip = hoverInfo && (
    <div
      style={{
        position: "absolute",
        pointerEvents: "none",
        left: hoverInfo.x,
        top: hoverInfo.y,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: "#fff",
        padding: "8px",
        borderRadius: "4px",
        transform: "translate(-50%, -100%)",
        marginTop: "-15px",
        zIndex: 1000,
      }}
    >
      <div>
        Total Cost:{" "}
        {new Intl.NumberFormat("de-DE", {
          style: "currency",
          currency: "EUR",
        }).format(hoverInfo.funding)}
      </div>
    </div>
  );

  return (
    <>
      <BaseUI
        layers={[layer]}
        defaultViewState={INITIAL_VIEW_STATE_TILTED_EU}
        loading={isPending}
        error={error}
        scenarioName="funding-tracker"
        scenarioTitle="Funding Tracker"
        search={undefined}
        filters={filters}
      />
      {hoverTooltip}
      {layerSwitcherUI}
    </>
  );
}
