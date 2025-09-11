"use client";

import BaseUI from "components/baseui/BaseUI";
import RightSideMenu from "components/baseui/RightSideMenu";
import useCountryFilter from "components/filter/useCountryFilter";
import useFrameworkProgrammeFilter from "components/filter/useFrameworkProgrammeFilter";
import useInstitutionSearchFilter from "components/filter/useInstitutionSearchFilter";
import useNutsFilter from "components/filter/useNutsFilter";
import useProjectSearchFilter from "components/filter/useProjectSearchFilter";
import useTypeAndSmeFilter from "components/filter/useTypeAndSmeFilter";
import useYearRangeFilter from "components/filter/useYearRangeFilter";
import ProjectViewInfoPanel from "components/infoPanels/ProjectViewInfoPanel";
import { ScatterplotLayer } from "deck.gl";
import { baseLayerProps } from "deckgl/baseLayerProps";
import { INITIAL_VIEW_STATE_EU } from "deckgl/viewports";
import { useInstitutionById } from "hooks/queries/institution/useInstitutionById";
import { useProjectbyId } from "hooks/queries/project/useProjectById";
import { useProjectYearRange } from "hooks/queries/project/useProjectYearRange";
import { useProjectView } from "hooks/queries/views/project/useProjectView";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { InfoBox, Title } from "./content";
import { useTopicFilter } from "components/filter/useTopicFilter";

export default function CHProjectScenario() {
  /** Main Data */
  const { data: projectView, isPending, error } = useProjectView();

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

  /** Year */
  const { data: { minStartDate = 1985, maxEndDate = 2035 } = {} } =
    useProjectYearRange();
  const [years, setYears] = useState<number[]>(() => [
    minStartDate,
    maxEndDate,
  ]);

  /** Filters */

  const { YearRangeFilter, yearRangePredicate } = useYearRangeFilter({
    years: years,
    handleYearsChange: setYears,
    minStartDate: minStartDate,
    maxEndDate: maxEndDate,
  });
  const { CountryFilter, countryPredicate } = useCountryFilter();
  const { TypeAndSmeFilter, typeAndSmePredicate } = useTypeAndSmeFilter();
  const { NutsFilter, nutsPredicate } = useNutsFilter(projectView);
  const { InstitutionSearchFilter, institutionSearchPredicate } =
    useInstitutionSearchFilter();
  const { ProjectSearchFilter, projectSearchPredicate } =
    useProjectSearchFilter();
  const { FrameworkProgrammeFilter, frameworkProgrammePredicate } =
    useFrameworkProgrammeFilter();
  const { TopicFilter, topicPredicate } = useTopicFilter();

  /** Apply Filters */

  const filteredProjectView = useMemo(() => {
    if (!projectView?.length) return [];
    return projectView.filter((p) => {
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
  }, [
    projectView,
    institutionSearchPredicate,
    projectSearchPredicate,
    frameworkProgrammePredicate,
    yearRangePredicate,
    countryPredicate,
    typeAndSmePredicate,
    nutsPredicate,
    topicPredicate,
  ]);

  // const handleDownload = useCallback(() => {
  //   // const jsonStr = JSON.stringify(filteredProjectView, null, 2);
  //   // const blob = new Blob([jsonStr], { type: "application/json" });
  //   // const url = URL.createObjectURL(blob);
  //   // const link = document.createElement("a");
  //   // link.href = url;
  //   // link.download = `filtered-projects-${new Date().toISOString().split("T")[0]}.json`;
  //   // document.body.appendChild(link);
  //   // link.click();
  //   // document.body.removeChild(link);
  //   // URL.revokeObjectURL(url);
  // }, []); // filteredProjectView

  const filters: ReactNode = (
    <div className="space-y-6">
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

  if (project) {
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

  const { panel, togglePanel } = RightSideMenu({ rightPanelTabs });

  /** Event Handlers */
  const handleMapOnClick = useCallback(
    (info: any) => {
      if (info.object.project_id) {
        setSelectedProjectId(info.object.project_id);
        togglePanel("project-view");
      }
      if (info.object.institution_id) {
        setSelectedInstitutionId(info.object.institution_id);
      }
    },
    [togglePanel],
  );

  /** Layer */
  const layer = useMemo(() => {
    return new ScatterplotLayer({
      ...baseLayerProps,
      id: "scatter-projects",
      data: filteredProjectView,
      getFillColor: [255, 140, 0],
      getPosition: (d) => d.geolocation,
      onClick: handleMapOnClick,
      updateTriggers: {
        getPosition: filteredProjectView,
        getFillColor: filteredProjectView,
      },
    });
  }, [filteredProjectView, handleMapOnClick]);

  return (
    <BaseUI
      layers={[layer]}
      viewState={INITIAL_VIEW_STATE_EU}
      titleContent={<Title count={filteredProjectView?.length} />}
      infoBoxContent={<InfoBox />}
      rightSideMenu={panel}
      toggleRightSideMenu={togglePanel}
      // onDownloadAction={handleDownload}
      loading={isPending}
      error={error}
    />
  );
}
