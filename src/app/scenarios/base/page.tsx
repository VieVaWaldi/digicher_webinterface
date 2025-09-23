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
import { ScatterplotLayer } from "deck.gl";
import { baseLayerProps } from "deckgl/baseLayerProps";
import { INITIAL_VIEW_STATE_EU } from "deckgl/viewports";
import { useMapViewInstitution } from "hooks/queries/views/map/useMapViewInstitution";
import { useMapViewProject } from "hooks/queries/views/map/useMapViewProject";
import { FileText, Lightbulb } from "lucide-react";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "shadcn/tabs";
import { InfoBox, Title } from "./content";
import ResearchOutputInfoPanel from "components/infoPanels/ResearchOutputInfoPanel";

export default function BaseScenario() {
  /** Map Data View */
  const { data: mapViewProject, isPending, error } = useMapViewProject();
  const { data: mapViewInstitution } = useMapViewInstitution();

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

  /** Filters */

  const { YearRangeFilter, yearRangePredicate, minYear, maxYear } =
    useYearRangeFilter();
  const { CountryFilter, countryPredicate } = useCountryFilter();
  const { TypeAndSmeFilter, typeAndSmePredicate } = useTypeAndSmeFilter();
  const { NutsFilter, nutsPredicate } = useNutsFilter(mapViewProject);
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
    getTopicColor,
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
    return dataView.filter((p) => {
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
  }, [
    dataView,
    institutionSearchPredicate,
    projectSearchPredicate,
    frameworkProgrammePredicate,
    yearRangePredicate,
    countryPredicate,
    typeAndSmePredicate,
    nutsPredicate,
    topicPredicate,
  ]);

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

  /** Layer */
  const layer = useMemo(() => {
    return new ScatterplotLayer({
      ...baseLayerProps,
      id: "scatter-projects",
      data: filteredDataView,
      getFillColor: (d) => getTopicColor(d.project_id),
      getPosition: (d) => d.geolocation,
      onClick: handleMapOnClick,
      updateTriggers: {
        getPosition: filteredDataView,
        getFillColor: filteredDataView,
      },
    });
  }, [filteredDataView, handleMapOnClick, getTopicColor]);

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

      <LeftSideFilters>{filters}</LeftSideFilters>

      <RightSideDataMenu>
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full grid-cols-2 font-bold text-orange-500">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="research-outputs">Research Outputs</TabsTrigger>
          </TabsList>
          <TabsContent value="projects" className="mt-4">
            <ProjectsPaginated />
          </TabsContent>
          <TabsContent value="research-outputs" className="mt-4">
            <ResearchOutputsPaginated />
          </TabsContent>
        </Tabs>
      </RightSideDataMenu>

      <BaseUI
        layers={[layer]}
        viewState={INITIAL_VIEW_STATE_EU}
        titleContent={
          <Title
            name={showInstitutions ? "Institutions" : "Projects"}
            count={filteredDataView?.length}
          />
        }
        infoBoxContent={<InfoBox />}
        loading={isPending}
        error={error}
        scenarioName="projects"
        scenarioTitle="Projects"
      />
    </div>
  );
}
