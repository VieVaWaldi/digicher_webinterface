"use client";

import { ReactNode, useState } from "react";

import { ScatterplotLayer } from "deck.gl";

import { InstitutionPoint } from "datamodel/scenario_points/types";
import InstitutionInfoPanel from "core/components/infoPanels/InstitutionInfoPanel";
import useTopicFilter from "core/components/menus/filter/TopicFilter";
import ScenarioTemplate from "core/components/scenarios/ScenarioTemplate";
import useCountryFilter from "core/components/menus/filter/CountryFilter";
import { RadioGroupFilter } from "core/components/menus/filter/RadioGroup";
import useTransformInstitutions from "core/hooks/transform/useTransformInstitutions";
import { useInstitutionById } from "core/hooks/queries/institution/useInstitutionById";
import useFundingProgrammeFilter from "core/components/menus/filter/FundingProgrammeFilter";
import { useInstitutionPoints } from "core/hooks/queries/scenario_points/useInstitutionPoints";

const SME_FILTERS = ["All", "SME", "Non-SME"] as const;
export type SmeFilter = (typeof SME_FILTERS)[number];

export default function InstitutionScenario() {
  const id: string = "institutions";

  /** Data */
  const { data: institutionPoints, loading, error } = useInstitutionPoints();
  const { data: transformedPoints } =
    useTransformInstitutions(institutionPoints);
  const [selectedInstitution, setSelectedInstitution] =
    useState<InstitutionPoint | null>(null);
  const { data: institution } = useInstitutionById(
    selectedInstitution?.institution_id ?? -1,
  );

  /** Progressive Enhancement */
  const dataPoints = transformedPoints ?? institutionPoints;

  /** Filter */
  const [smeFilter, setSmeFilter] = useState<SmeFilter>("All");
  const { CountryFilter, countryPredicate } = useCountryFilter();
  const { TopicFilter, topicPredicate } = useTopicFilter();
  const { FundingProgrammeFilter, fundingProgrammePredicate } =
    useFundingProgrammeFilter();

  const filteredDataPoints = dataPoints?.filter((point) => {
    const passesSmeFilter =
      smeFilter === "All" ||
      (smeFilter === "SME" ? point.is_sme : !point.is_sme);

    return (
      passesSmeFilter &&
      countryPredicate(point) &&
      topicPredicate(point) &&
      fundingProgrammePredicate(point)
    );
  });

  const filterMenus: ReactNode[] = [
    <RadioGroupFilter
      key="sme-filter"
      defaultValue={smeFilter}
      labels={SME_FILTERS}
      setOnValueChange={setSmeFilter}
    />,
    <CountryFilter key="country-filter" />,
    <TopicFilter key="topic-filter" />,
    <FundingProgrammeFilter key="funding-filter" />,
  ];

  /** Layer */
  const layer = new ScatterplotLayer({
    id: `scatter-${id}`,
    data: filteredDataPoints,

    filled: true,
    stroked: false,

    getRadius: 2000,
    // radiusScale: 60,
    // radiusMinPixels: 4,
    // radiusMaxPixels: 4,
    // lineWidthMinPixels: 1,

    getPosition: (d) => [d.geolocation[1], d.geolocation[0]],
    getFillColor: (d) => (d.is_sme ? [20, 140, 0] : [255, 140, 0]),
    onClick: (info) => {
      if (info.object) {
        setSelectedInstitution(info.object as InstitutionPoint);
      }
    },

    pickable: true,
    opacity: 0.8,
    antialiasing: true,
    highlightColor: [1, 1, 1],
    autoHighlight: true,
  });

  return (
    <ScenarioTemplate
      id={id}
      title="Institution Map"
      isLoading={loading}
      error={error}
      statsCard={
        <span>
          Displaying {filteredDataPoints?.length.toLocaleString() || 0}{" "}
          Institutions
        </span>
      }
      filterMenus={filterMenus}
      layers={[layer]}
      infoPanel={institution && <InstitutionInfoPanel institution={institution} />}
    />
  );
}
