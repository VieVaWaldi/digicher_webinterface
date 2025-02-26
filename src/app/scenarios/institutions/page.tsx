"use client";

import { ReactNode, useState } from "react";

import { ScatterplotLayer } from "deck.gl";

import { baseLayerProps } from "deckgl/baseLayerProps";
import { InstitutionPoint } from "datamodel/scenario_points/types";
import useTopicFilter from "components/menus/filter/TopicFilter";
import ScenarioTemplate from "components/scenarios/ScenarioTemplate";
import useCountryFilter from "components/menus/filter/CountryFilter";
import { RadioGroupFilter } from "components/menus/filter/RadioGroup";
import InstitutionInfoPanel from "components/infoPanels/InstitutionInfoPanel";
import useTransformInstitutions from "core/hooks/transform/useTransformInstitutions";
import { useInstitutionById } from "core/hooks/queries/institution/useInstitutionById";
import useFundingProgrammeFilter from "components/menus/filter/FundingProgrammeFilter";
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

  /** Layer */

  const layer = new ScatterplotLayer({
    ...baseLayerProps,
    id: `scatter-${id}`,
    data: filteredDataPoints,

    filled: true,
    stroked: false,
    radiusMinPixels: 5,
    radiusMaxPixels: 5,

    getPosition: (d) => [d.geolocation[1], d.geolocation[0]],
    getFillColor: (d) => (d.is_sme ? [6, 77, 135] : [255, 140, 0]),
    onClick: (info) => {
      if (info.object) {
        setSelectedInstitution(info.object as InstitutionPoint);
      }
    },
  });

  /** Component */

  const filterMenus: ReactNode[] = [
    <RadioGroupFilter
      key="sme-filter"
      defaultValue={smeFilter}
      labels={SME_FILTERS}
      setOnValueChange={setSmeFilter}
    />,
    <CountryFilter key="country-filter" />,
    <FundingProgrammeFilter key="funding-filter" />,
    <TopicFilter key="topic-filter" />,
  ];

  return (
    <ScenarioTemplate
      id={id}
      title="Institution Map"
      statsCard={
        <span>
          Displaying{" "}
          <span className="font-semibold text-orange-400">
            {filteredDataPoints?.length.toLocaleString() || 0}
          </span>{" "}
          Institutions
        </span>
      }
      filterMenus={filterMenus}
      infoPanel={
        institution && <InstitutionInfoPanel institution={institution} />
      }
      layers={[layer]}
      isLoading={loading}
      error={error}
    />
  );
}
