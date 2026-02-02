"use client";

import BaseUI from "components/baseui/BaseUI";
import useCountryFilter from "components/filter/useCountryFilter";
import useFrameworkProgrammeFilter from "components/filter/useFrameworkProgrammeFilter";
import { useTopicFilter } from "components/filter/useTopicFilter";
import useTypeAndSmeFilter from "components/filter/useTypeAndSmeFilter";
import useYearRangeFilter from "components/filter/useYearRangeFilter";
import { FilterSection, useUnifiedSearchFilter, EntityOption } from "components/mui";
import { IconLayer } from "deck.gl";
import { useMapViewInstitution } from "hooks/queries/views/map/useMapViewInstitution";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { INITIAL_VIEW_STATE_EU } from "@/deckgl/viewports";
import { Box, Typography } from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ScienceIcon from "@mui/icons-material/Science";

// MUI AccountBalance icon as SVG data URL
const INSTITUTION_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64">
  <path fill="#2c5f66" d="M4 10h3v7H4zm6.5 0h3v7h-3zM2 19h20v3H2zm15-9h3v7h-3zm-5-9L2 6v2h20V6z"/>
</svg>`;
const INSTITUTION_ICON_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(INSTITUTION_ICON_SVG)}`;

const ENTITY_OPTIONS: EntityOption[] = [
  // {
  //   value: "works",
  //   label: "Works",
  //   icon: <DescriptionIcon fontSize="small" />,
  // },
  {
    value: "projects",
    label: "Projects",
    icon: <ScienceIcon fontSize="small" />,
  },
  {
    value: "institutions",
    label: "Institutions",
    icon: <AccountBalanceIcon fontSize="small" />,
  },
];

export default function BaseScenario() {
  const { data, isPending, error } = useMapViewInstitution();
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<
    string | null
  >(null);

  /** Filters */

  const { YearRangeFilter, yearRangePredicate, minYear, maxYear } =
    useYearRangeFilter({
      defaultMinYear: 2020,
      defaultMaxYear: 2025,
    });
  const { CountryFilter, countryPredicate } = useCountryFilter();
  const { TypeAndSmeFilter, typeAndSmePredicate } = useTypeAndSmeFilter();
  const {
    SearchFilter,
    institutionSearchPredicate,
    projectSearchPredicate,
    MinorityGroupsFilter,
  } = useUnifiedSearchFilter({
    entityOptions: ENTITY_OPTIONS,
    defaultEntity: "projects",
  });
  const {
    FrameworkProgrammeFilter,
    frameworkProgrammePredicate,
    selectedFrameworkProgrammes,
  } = useFrameworkProgrammeFilter();
  const {
    TopicFilter,
    topicPredicate,
    getTopicColor,
    selectedDomains,
    selectedFields,
    selectedSubfields,
    selectedTopics,
  } = useTopicFilter();

  /** Apply Filters */

  const filteredData = useMemo(() => {
    if (!data?.length) return [];
    return data.filter((p) => {
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
        institutions
      </Typography>

      {/* Search Section */}
      <FilterSection showDivider={false}>{SearchFilter}</FilterSection>

      {/* Time Section */}
      <FilterSection title="Project Time" showDivider={true}>
        {YearRangeFilter}
      </FilterSection>

      {/* Geographic & Demographic Section */}
      <FilterSection title="Geographic & Demographic">
        {CountryFilter}
        {MinorityGroupsFilter}
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
  const handleMapOnClick = useCallback((info: any) => {
    if (info.object.institution_id) {
      setSelectedInstitutionId(info.object.institution_id);
      console.log(info.object);
    }
  }, []);

  /** Layer */
  const layer = useMemo(() => {
    return new IconLayer({
      id: "icon-institutions",
      data: filteredData,
      pickable: true,
      getPosition: (d) => d.geolocation,
      getIcon: () => ({
        url: INSTITUTION_ICON_URL,
        width: 64,
        height: 64,
        anchorY: 64,
      }),
      getSize: 40,
      sizeUnits: "meters",
      sizeMinPixels: 12, // clickable when zoomed out
      sizeMaxPixels: 40, // building-sized when zoomed in
      onClick: handleMapOnClick,
      updateTriggers: {
        getPosition: filteredData,
      },
    });
  }, [filteredData, handleMapOnClick]);

  return (
    <BaseUI
      layers={[layer]}
      search={SearchFilter}
      filters={filters}
      defaultViewState={INITIAL_VIEW_STATE_EU}
      loading={isPending}
      error={error}
      scenarioName={"<Base>"}
      scenarioTitle={"<Base>"}
    />
  );
}
