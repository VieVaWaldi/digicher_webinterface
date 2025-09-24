"use client";

import BaseUI from "components/baseui/BaseUI";
import LeftSideFilters from "components/baseui/LeftSideFilterMenu";
import RightSideDataMenu from "components/baseui/RightSideDataMenu";
import SelectedInfo from "components/baseui/SelectedEntity";
import { usePaginatedProjects } from "components/baseui/usePaginatedProjects";
import { usePaginatedResearchOutputs } from "components/baseui/usePaginatedResearchOutputs";
import { ScopeToggle } from "components/buttons/toggle";
import useCountryFilter from "components/filter/useCountryFilter";
import useFrameworkProgrammeFilter from "components/filter/useFrameworkProgrammeFilter";
import useInstitutionSearchFilter from "components/filter/useInstitutionSearchFilter";
import useNutsFilter from "components/filter/useNutsFilter";
import useProjectSearchFilter from "components/filter/useProjectSearchFilter";
import { useTopicFilter } from "components/filter/useTopicFilter";
import useTypeAndSmeFilter from "components/filter/useTypeAndSmeFilter";
import useYearRangeFilter from "components/filter/useYearRangeFilter";
import InstitutionInfoPanel from "components/infoPanels/InstitutionInfoPanel";
import ProjectInfoPanel from "components/infoPanels/ProjectInfoPanel";
import ResearchOutputInfoPanel from "components/infoPanels/ResearchOutputInfoPanel";
import { useSettings } from "context/SettingsContext";
import { ColumnLayer, PickingInfo } from "deck.gl";
import { baseLayerProps } from "deckgl/baseLayerProps";
import { INITIAL_VIEW_STATE_TILTED_EU } from "deckgl/viewports";
import { useMapViewInstitution } from "hooks/queries/views/map/useMapViewInstitution";
import { useMapViewProject } from "hooks/queries/views/map/useMapViewProject";
import { FileText, Lightbulb } from "lucide-react";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "shadcn/tabs";
import { FundingInfoBox, FundingTitle } from "./content";

export default function FundingScenario() {
  /** Map Data View */
  const { data: mapViewProject, isPending, error } = useMapViewProject();
  const {
    data: mapViewInstitution,
    isPending: isPendingInstitutionView,
    error: errorInstitutionView,
  } = useMapViewInstitution();

  /** View Toggle */
  const [showInstitutions, setShowInstitutions] = useState<boolean>(false);

  const dataView = showInstitutions ? mapViewInstitution : mapViewProject;

  /** Selected Entity */
  const [selectedInfo, setSelectedInfo] = useState<boolean | "p" | "i" | "r">(
    false,
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<
    string | null
  >(null);
  const [selectedROId, setSelectedROId] = useState<string | null>(null);

  /** Year Range */

  /** Filters */
  const { YearRangeFilter, yearRangePredicate, minYear, maxYear } =
    useYearRangeFilter();
  const { CountryFilter, countryPredicate } = useCountryFilter();
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

  const handleTableProjectClick = useCallback((project: any) => {
    setSelectedProjectId(project.id);
    setSelectedInstitutionId(null);
    setSelectedInfo("p");
  }, []);

  const handleTableResearchOutputClick = useCallback((ro: any) => {
    setSelectedROId(ro.id);
    setSelectedInstitutionId(null);
    setSelectedProjectId(null);
    setSelectedInfo("r");
  }, []);

  const { ProjectsPaginated } = usePaginatedProjects({
    icon: <Lightbulb />,
    minYear,
    maxYear,
    projectSearchQuery,
    selectedFrameworkProgrammes,
    selectedDomains: selectedDomains,
    selectedFields: selectedFields,
    selectedSubfields: selectedSubfields,
    selectedTopics: selectedTopics,
    onProjectClick: handleTableProjectClick,
  });

  const { ResearchOutputsPaginated } = usePaginatedResearchOutputs({
    icon: <FileText />,
    minYear,
    maxYear,
    researchOutputSearchQuery: projectSearchQuery,
    onResearchOutputClick: handleTableResearchOutputClick,
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

  /** Hover Tooltip */

  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    funding: number;
    object: any;
  } | null>(null);

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

  /** Event Handlers */
  const handleMapOnClick = useCallback(
    (info: any) => {
      if (info.object.project_id) {
        setSelectedProjectId(info.object.project_id);
        setSelectedInfo(showInstitutions ? "i" : "p");
      }
      if (info.object.institution_id) {
        setSelectedInstitutionId(info.object.institution_id);
        setSelectedInfo(showInstitutions ? "i" : "p");
      }
    },
    [showInstitutions],
  );

  /** Constants */
  const COLOR_GAMMA = 0.5;
  const MAX_HEIGHT = 1_000_000;
  const BAR_RADIUS = 2_200;

  const { isGlobe } = useSettings();

  /** Layer */

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
    isGlobe,
    handleHover,
  ]);

  return (
    <div onClick={() => setSelectedInfo(false)}>
      <SelectedInfo show={selectedInfo} setSelectedInfo={setSelectedInfo}>
        {selectedInfo == "i" && (
          <InstitutionInfoPanel institution_id={selectedInstitutionId} />
        )}
        {selectedInfo == "p" && (
          <ProjectInfoPanel
            institution_id={selectedInstitutionId}
            project_id={selectedProjectId}
          />
        )}
        {selectedInfo == "r" && (
          <ResearchOutputInfoPanel researchOutputId={selectedROId} />
        )}
      </SelectedInfo>

      <div onClick={(e) => e.stopPropagation()}>
        <LeftSideFilters>{filters}</LeftSideFilters>

        <RightSideDataMenu>
          <Tabs defaultValue="projects" className="w-full">
            <TabsList className="grid w-full grid-cols-2 font-bold text-orange-500">
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="research-outputs">
                Research Outputs
              </TabsTrigger>
            </TabsList>
            <TabsContent value="projects" className="mt-4">
              <ProjectsPaginated />
            </TabsContent>
            <TabsContent value="research-outputs" className="mt-4">
              <ResearchOutputsPaginated />
            </TabsContent>
          </Tabs>
        </RightSideDataMenu>
      </div>

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
      {hoverTooltip}
    </div>
  );
}
