"use client";

import BaseUI from "components/baseui/BaseUI";
import LeftSideFilters from "components/baseui/LeftSideFilterMenu";
import RightSideDataMenu from "components/baseui/RightSideDataMenu";
import { usePaginatedProjects } from "components/baseui/usePaginatedProjects";
import { ScopeToggle } from "components/buttons/toggle";
import useCountryFilter from "components/filter/useCountryFilter";
import useFrameworkProgrammeFilter from "components/filter/useFrameworkProgrammeFilter";
import useInstitutionSearchFilter from "components/filter/useInstitutionSearchFilter";
import useNutsFilter from "components/filter/useNutsFilter";
import useProjectSearchFilter from "components/filter/useProjectSearchFilter";
import { useTopicFilter } from "components/filter/useTopicFilter";
import useTypeAndSmeFilter from "components/filter/useTypeAndSmeFilter";
import useYearRangeFilter from "components/filter/useYearRangeFilter";
import ProjectViewInfoPanel from "components/infoPanels/ProjectViewInfoPanel";
import { useSettings } from "context/SettingsContext";
import { ColumnLayer, PickingInfo } from "deck.gl";
import { baseLayerProps } from "deckgl/baseLayerProps";
import { INITIAL_VIEW_STATE_TILTED_EU } from "deckgl/viewports";
import { useInstitutionById } from "hooks/queries/institution/useInstitutionById";
import { useProjectbyId } from "hooks/queries/project/useProjectById";
import { useInstitutionView } from "hooks/queries/views/project/useInstitutionView";
import { useProjectView } from "hooks/queries/views/project/useProjectView";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { FundingInfoBox, FundingTitle } from "./content";
import { X } from "lucide-react";
import { H2 } from "shadcn/typography";

export default function FundingScenario() {
  /** Map Data View */
  const { data: projectView, isPending, error } = useProjectView();
  const {
    data: institutionView,
    isPending: isPendingInstitutionView,
    error: errorInstitutionView,
  } = useInstitutionView();

  /** View Toggle */
  const [showInstitutions, setShowInstitutions] = useState<boolean>(false);

  const dataView = showInstitutions ? institutionView : projectView;

  /** UGH selected info */
  const [showSelectedInfo, setSelectedInfo] = useState(false);

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

  /** Hover State */
  // const [hoverInfo, setHoverInfo] = useState<{
  //   x: number;
  //   y: number;
  //   funding: number;
  //   object: any;
  // } | null>(null);

  /** Filters */
  const { YearRangeFilter, yearRangePredicate, minYear, maxYear } =
    useYearRangeFilter();
  const { CountryFilter, countryPredicate, selectedCountries } =
    useCountryFilter();
  const { TypeAndSmeFilter, typeAndSmePredicate } = useTypeAndSmeFilter();
  const { NutsFilter, nutsPredicate } = useNutsFilter(dataView);
  const { InstitutionSearchFilter, institutionSearchPredicate } =
    useInstitutionSearchFilter();
  const { ProjectSearchFilter, projectSearchPredicate, projectSearchQuery } =
    useProjectSearchFilter();
  const {
    FrameworkProgrammeFilter,
    frameworkProgrammePredicate,
    selectedFrameworkProgrammes,
  } = useFrameworkProgrammeFilter();
  const {
    TopicFilter,
    topicPredicate,
    selectedDomains,
    selectedFields,
    selectedSubfields,
    selectedTopics,
  } = useTopicFilter();

  /** Table Data View */

  const { ProjectsPaginated } = usePaginatedProjects({
    minYear,
    maxYear,
    projectSearchQuery,
    selectedFrameworkProgrammes,
    selectedDomains: selectedDomains,
    selectedFields: selectedFields,
    selectedSubfields: selectedSubfields,
    selectedTopics: selectedTopics,
  });

  /** Apply Filters */
  const filteredDataView = useMemo(() => {
    if (!dataView?.length) return [];

    const filtered = dataView.filter((p) => {
      return (
        topicPredicate(p.project_id) &&
        institutionSearchPredicate(p.institution_id) &&
        projectSearchPredicate(p.project_id) &&
        frameworkProgrammePredicate(p.framework_programmes) &&
        yearRangePredicate(p.start_date, p.end_date) &&
        countryPredicate(p.country_code) &&
        typeAndSmePredicate(p.type, p.sme) &&
        nutsPredicate(p.nuts_0, p.nuts_1, p.nuts_2, p.nuts_3)
      );
    });

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

    return filtered;
  }, [
    dataView,
    showInstitutions,
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

  // Right panel tabs
  // const rightPanelTabs: Array<{
  //   id: string;
  //   label: string;
  //   content: ReactNode;
  // }> = [];

  // if (project && !showInstitutions) {
  //   rightPanelTabs.push({
  //     id: "project-details",
  //     label: "Project Details",
  //     content: (
  // <ProjectViewInfoPanel
  //   institution={institution}
  //   project={project}
  //   isPendingInstitution={isPendingInstitution}
  //   isPendingProject={isPendingProject}
  // />
  //     ),
  //   });
  // }

  // if (showInstitutions) {
  //   rightPanelTabs.push({
  //     id: "institution-details",
  //     label: "Institution Details",
  //     content: (
  //       <div className="p-4 text-center text-gray-500">
  //         <p>Institution View</p>
  //         <p>Institution functionality not yet implemented.</p>
  //         <p>Switch to Projects view to explore project funding data.</p>
  //       </div>
  //     ),
  //   });
  // }

  /** Hover Tooltip */
  // const hoverTooltip = hoverInfo && (
  //   <div
  //     style={{
  //       position: "absolute",
  //       pointerEvents: "none",
  //       left: hoverInfo.x,
  //       top: hoverInfo.y,
  //       backgroundColor: "rgba(0, 0, 0, 0.8)",
  //       color: "#fff",
  //       padding: "8px",
  //       borderRadius: "4px",
  //       transform: "translate(-50%, -100%)",
  //       marginTop: "-15px",
  //       zIndex: 1000,
  //     }}
  //   >
  //     <div>
  //       Total Cost:{" "}
  //       {new Intl.NumberFormat("de-DE", {
  //         style: "currency",
  //         currency: "EUR",
  //       }).format(hoverInfo.funding)}
  //     </div>
  //   </div>
  // );

  /** Event Handlers */
  const handleMapOnClick = useCallback(
    (info: PickingInfo) => {
      if (showInstitutions && info.object?.institution_id) {
        setSelectedInstitutionId(info.object.institution_id);
        setSelectedInfo(true);
      } else if (!showInstitutions && info.object?.project_id) {
        setSelectedProjectId(info.object.project_id);
        setSelectedInstitutionId(info.object.institution_id);
        setSelectedInfo(true);
      }
    },
    [showInstitutions],
  );

  // const handleHover = useCallback((info: PickingInfo) => {
  //   if (info.object) {
  //     setHoverInfo({
  //       x: info.x,
  //       y: info.y,
  //       funding: info.object.total_cost || 0,
  //       object: info.object,
  //     });
  //   } else {
  //     setHoverInfo(null);
  //   }
  // }, []);

  // const handleRightPanelToggle = useCallback((isOpen: boolean) => {
  //   setIsRightPanelOpen(isOpen);
  // }, []);

  // const handleRightTabChange = useCallback((tabId: string) => {
  //   setActiveRightTabId(tabId);
  // }, []);

  /** Layer */
  /** Constants */
  const COLOR_GAMMA = 0.5;
  const MAX_HEIGHT = 1_000_000;
  const BAR_RADIUS = 2_200;

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
      // onHover: handleHover,
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
    // handleHover,
    isGlobe,
  ]);

  return (
    <div onClick={() => setSelectedInfo(false)}>
      {showSelectedInfo && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div
            className="relative max-h-[80vh] w-11/12 max-w-2xl overflow-y-auto rounded-xl bg-white/90 p-6 backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-row justify-between">
              <H2 className="text-xl font-semibold text-gray-800">Project</H2>
              <button
                className="-mt-3 mb-3 text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedInfo(false)}
              >
                <X className="text-gray-500" />
              </button>
            </div>
            <div className="mb-4 h-px w-full bg-gray-300" />
            {project && !showInstitutions && (
              <ProjectViewInfoPanel
                institution={institution}
                project={project}
                isPendingInstitution={isPendingInstitution}
                isPendingProject={isPendingProject}
              />
            )}
          </div>
        </div>
      )}

      <LeftSideFilters>{filters}</LeftSideFilters>
      <RightSideDataMenu>
        <ProjectsPaginated />{" "}
      </RightSideDataMenu>

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
        scenarioName="funding-tracker"
        scenarioTitle="Funding Tracker"
        loading={showInstitutions ? isPendingInstitutionView : isPending}
        error={showInstitutions ? errorInstitutionView : error}
      />
      {/* {hoverTooltip} */}
    </div>
  );
}
