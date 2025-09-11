"use client";

import BaseUI from "components/baseui/BaseUI";
import RightSideMenu from "components/baseui/RightSideMenu";
import { ScopeToggle } from "components/buttons/toggle";
import useCountryFilter from "components/filter/useCountryFilter";
import useFrameworkProgrammeFilter from "components/filter/useFrameworkProgrammeFilter";
import useInstitutionSearchFilter from "components/filter/useInstitutionSearchFilter";
import useNutsFilter from "components/filter/useNutsFilter";
import useProjectSearchFilter from "components/filter/useProjectSearchFilter";
import useTypeAndSmeFilter from "components/filter/useTypeAndSmeFilter";
import useYearRangeFilter from "components/filter/useYearRangeFilter";
import ProjectViewInfoPanel from "components/infoPanels/ProjectViewInfoPanel";
import { useSettings } from "core/context/SettingsContext";
import { ColumnLayer, PickingInfo } from "deck.gl";
import { baseLayerProps } from "deckgl/baseLayerProps";
import { INITIAL_VIEW_STATE_TILTED_EU } from "deckgl/viewports";
import { useInstitutionById } from "hooks/queries/institution/useInstitutionById";
import { useProjectbyId } from "hooks/queries/project/useProjectById";
import { useProjectYearRange } from "hooks/queries/project/useProjectYearRange";
import { useInstitutionView } from "hooks/queries/views/project/useInstitutionView";
import { useProjectView } from "hooks/queries/views/project/useProjectView";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { FundingInfoBox, FundingTitle } from "./content";
import { useTopicFilter } from "components/filter/useTopicFilter";

export default function FundingScenario() {
  /** Main Data */
  const { data: projectView, isPending, error } = useProjectView();
  const {
    data: institutionView,
    isPending: isPendingInstitutionView,
    error: errorInstitutionView,
  } = useInstitutionView();

  /** View Toggle */
  const [showInstitutions, setShowInstitutions] = useState<boolean>(false);

  const dataView = showInstitutions ? institutionView : projectView;

  /** Constants */
  const COLOR_GAMMA = 0.5;
  const MAX_HEIGHT = 1_000_000;
  const BAR_RADIUS = 2_200;

  /** Selected Project */
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const { data: project, isPending: isPendingProject } = useProjectbyId(
    selectedProjectId || "",
    {
      enabled: !!selectedProjectId,
    },
  );

  /** Selected Institution */
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<
    string | null
  >(null);
  const { data: institution, isPending: isPendingInstitution } =
    useInstitutionById(selectedInstitutionId || "", {
      enabled: !!selectedInstitutionId,
    });

  /** Year Range */
  const { data: { minStartDate = 1985, maxEndDate = 2035 } = {} } =
    useProjectYearRange();
  const [years, setYears] = useState<number[]>(() => [
    minStartDate,
    maxEndDate,
  ]);

  /** Hover State */
  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    funding: number;
    object: any;
  } | null>(null);

  /** Filters */
  const { YearRangeFilter, yearRangePredicate } = useYearRangeFilter({
    years: years,
    handleYearsChange: setYears,
    minStartDate: minStartDate,
    maxEndDate: maxEndDate,
  });
  const { CountryFilter, countryPredicate } = useCountryFilter();
  const { TypeAndSmeFilter, typeAndSmePredicate } = useTypeAndSmeFilter();
  const { NutsFilter, nutsPredicate } = useNutsFilter(dataView);
  const { InstitutionSearchFilter, institutionSearchPredicate } =
    useInstitutionSearchFilter();
  const { ProjectSearchFilter, projectSearchPredicate } =
    useProjectSearchFilter();
  const { FrameworkProgrammeFilter, frameworkProgrammePredicate } =
    useFrameworkProgrammeFilter();
  const { TopicFilter, topicPredicate } = useTopicFilter();

  /** Apply Filters */
  // const filteredDataView = useMemo(() => {
  //   if (!dataView?.length) return [];
  //   return dataView.filter((p) => {
  //     return (
  //       institutionSearchPredicate(p.institution_id) &&
  //       projectSearchPredicate(p.project_id) &&
  //       frameworkProgrammePredicate(p.framework_programme) &&
  //       yearRangePredicate(p.start_date, p.end_date) &&
  //       countryPredicate(p.country_code) &&
  //       typeAndSmePredicate(p.type, p.sme) &&
  //       nutsPredicate(p.nuts_0, p.nuts_1, p.nuts_2, p.nuts_3)
  //     );
  //   });
  // }, [
  //   dataView,
  //   institutionSearchPredicate,
  //   projectSearchPredicate,
  //   frameworkProgrammePredicate,
  //   yearRangePredicate,
  //   countryPredicate,
  //   typeAndSmePredicate,
  //   nutsPredicate,
  // ]);

  const filteredDataView = useMemo(() => {
    if (!dataView?.length) return [];

    // Step 1: Always filter at the project level first
    const filtered = dataView.filter((p) => {
      return (
        topicPredicate(p.project_id) &&
        institutionSearchPredicate(p.institution_id) &&
        projectSearchPredicate(p.project_id) &&
        frameworkProgrammePredicate(p.framework_programme) &&
        yearRangePredicate(p.start_date, p.end_date) &&
        countryPredicate(p.country_code) &&
        typeAndSmePredicate(p.type, p.sme) &&
        nutsPredicate(p.nuts_0, p.nuts_1, p.nuts_2, p.nuts_3)
      );
    });

    // Step 2: Return aggregated data for institutions, raw data for projects
    if (showInstitutions) {
      const institutionMap = new Map();

      filtered.forEach((row) => {
        const existing = institutionMap.get(row.institution_id);
        if (existing) {
          existing.total_cost += row.total_cost || 0;
          existing.project_count += 1;
          existing.project_ids.push(row.project_id);
        } else {
          institutionMap.set(row.institution_id, {
            ...row,
            total_cost: row.total_cost || 0,
            project_count: 1,
            project_ids: [row.project_id],
          });
        }
      });

      return Array.from(institutionMap.values());
    }

    // For project view, return the filtered projects as-is
    return filtered;
  }, [
    dataView,
    showInstitutions, // Add this dependency!
    institutionSearchPredicate,
    projectSearchPredicate,
    frameworkProgrammePredicate,
    yearRangePredicate,
    countryPredicate,
    typeAndSmePredicate,
    nutsPredicate,
    topicPredicate,
  ]);

  /** Calculations */
  const maxTotalCost = useMemo(() => {
    return filteredDataView.reduce((max, p) => {
      const cost = p.total_cost || 0;
      return Math.max(max, cost);
    }, 0);
  }, [filteredDataView]);

  const totalFunding = useMemo(() => {
    return filteredDataView.reduce((sum, p) => sum + (p.total_cost || 0), 0);
  }, [filteredDataView]);

  /** UI Components */
  const filters: ReactNode = (
    <div className="space-y-6">
      <div className="flex justify-center">
        <ScopeToggle
          isInstitution={showInstitutions}
          onChange={setShowInstitutions}
        />
      </div>
      {YearRangeFilter}
      {TypeAndSmeFilter}
      {InstitutionSearchFilter}
      {ProjectSearchFilter}
      {CountryFilter}
      {FrameworkProgrammeFilter}
      {TopicFilter}
      {NutsFilter}
    </div>
  );

  const rightPanelTabs = [
    {
      id: "filters",
      label: "Filters",
      content: filters,
    },
  ];

  if (project && !showInstitutions) {
    rightPanelTabs.push({
      id: "project-view",
      label: "Details",
      content: (
        <ProjectViewInfoPanel
          institution={institution}
          project={project}
          isPendingInstitution={isPendingInstitution}
          isPendingProject={isPendingProject}
        />
      ),
    });
  }

  if (showInstitutions) {
    rightPanelTabs.push({
      id: "institution-placeholder",
      label: "Institutions",
      content: (
        <div className="p-4 text-center text-gray-500">
          <p>Institution View</p>
          <p>Institution functionality not yet implemented.</p>
          <p>Switch to Projects view to explore project funding data.</p>
        </div>
      ),
    });
  }

  const { panel, togglePanel } = RightSideMenu({ rightPanelTabs });

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

  /** Event Handlers */
  const handleMapOnClick = useCallback(
    (info: PickingInfo) => {
      if (showInstitutions && info.object?.institution_id) {
        setSelectedInstitutionId(info.object.institution_id);
        console.log(info.object);
        togglePanel("institution-view");
      } else if (!showInstitutions && info.object?.project_id) {
        setSelectedProjectId(info.object.project_id);
        setSelectedInstitutionId(info.object.institution_id);
        togglePanel("project-view");
      }
    },
    [showInstitutions, togglePanel],
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

  /** Layer */
  const { isGlobe } = useSettings();

  const layer = useMemo(() => {
    return new ColumnLayer({
      ...baseLayerProps,
      id: "column-projects",
      data: filteredDataView,
      getElevation: (d) => {
        const funding = d.total_cost || 0;
        const ratio = maxTotalCost > 0 ? funding / maxTotalCost : 0;
        return isGlobe ? ratio * MAX_HEIGHT * 3.5 : ratio * MAX_HEIGHT;
      },
      getFillColor: (d) => {
        const funding = d.total_cost || 0;
        const normalizedFunding = maxTotalCost > 0 ? funding / maxTotalCost : 0;
        const adjustedValue = Math.pow(normalizedFunding, COLOR_GAMMA);

        return [
          50 + (255 - 50) * adjustedValue,
          50 - 50 * adjustedValue,
          50 - 50 * adjustedValue,
          200,
        ];
      },
      getPosition: (d) => d.geolocation || [0, 0],
      onClick: handleMapOnClick,
      onHover: handleHover,
      radius: isGlobe ? BAR_RADIUS * 2.5 : BAR_RADIUS,
      diskResolution: 32,
      extruded: true,
      material: {
        ambient: 0.64,
        diffuse: 0.6,
        shininess: 32,
        specularColor: [51, 51, 51],
      },
    });
  }, [
    filteredDataView,
    maxTotalCost,
    BAR_RADIUS,
    handleMapOnClick,
    handleHover,
    isGlobe,
  ]);

  return (
    <>
      <BaseUI
        layers={[layer]}
        viewState={INITIAL_VIEW_STATE_TILTED_EU}
        titleContent={
          <FundingTitle
            count={filteredDataView?.length || 0}
            totalFunding={totalFunding}
            showInstitutions={showInstitutions}
          />
        }
        infoBoxContent={
          <FundingInfoBox
            count={filteredDataView?.length || 0}
            totalFunding={totalFunding}
            showInstitutions={showInstitutions}
          />
        }
        rightSideMenu={panel}
        toggleRightSideMenu={togglePanel}
        loading={showInstitutions ? isPendingInstitutionView : isPending}
        error={showInstitutions ? errorInstitutionView : error}
      />
      {hoverTooltip}
    </>
  );
}
