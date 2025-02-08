"use client";

import { ReactNode, useState } from "react";
import { ScatterplotLayer } from "deck.gl";
import { InstitutionPoint } from "datamodel/institution/types";
import { RadioGroupFilter } from "core/components/menus/filter/RadioGroup";
import { useInstitutionPoints } from "core/hooks/queries/institution/useInstitutionPoints";
import { useInstitutionById } from "core/hooks/queries/institution/useInstitutionById";

import ScenarioTemplate from "core/components/deckgl/ScenarioTemplate";
import InstitutionCard from "core/components/cards/InstitutionCard";
import CountryFilter from "core/components/menus/filter/CountryFilter";
import useTransformInstitutionTopics from "core/hooks/transform/useTransformInstitutionTopics";
import TopicFilter from "core/components/menus/filter/TopicFilter";
import FundingFilter from "core/components/menus/filter/FundingFilter";

const SME_FILTERS = ["All", "SME", "Non-SME"] as const;
export type SmeFilter = (typeof SME_FILTERS)[number];

export default function InstitutionScenario() {
  const id: string = "institutions";

  /** Data */
  const { data: institutionPoints, loading, error } = useInstitutionPoints();
  const {
    data: transformedPoints,
    loading: loadingTransformed,
    error: errorTransformed,
  } = useTransformInstitutionTopics(institutionPoints);
  const [selectedInstitution, setSelectedInstitution] =
    useState<InstitutionPoint | null>(null);
  const {
    data: institution,
    loading: loadingInfo,
    error: errorInfo,
  } = useInstitutionById(selectedInstitution?.id ?? -1);

  // Progressive Enhancement
  const dataPoints = transformedPoints ?? institutionPoints;

  /** Filter */
  const [smeFilter, setSmeFilter] = useState<SmeFilter>("All");
  const [countriesFilter, setCountriesFilter] = useState<string[]>([]);
  const [topics0Filter, setTopics0Filter] = useState<string[]>([]);
  const [topics1Filter, setTopics1Filter] = useState<string[]>([]);
  const [topics2Filter, setTopics2Filter] = useState<string[]>([]);
  const [frameworksFilter, setFrameworksFilter] = useState<string[]>([]);
  const [codeFilter, setCodeFilter] = useState<string[]>([]);

  const filterdDataPoints = dataPoints?.filter((point) => {
    const passesSmeFilter =
      smeFilter === "All" || (smeFilter === "SME" ? point.sme : !point.sme);
    const passesCountryFilter =
      countriesFilter.length === 0 ||
      !point.address_country ||
      countriesFilter.includes(point.address_country);

    function topicFilter(data: string[]): boolean {
      return (
        data.length === 0 ||
        (point.topics?.some((topic) => data.includes(topic.id.toString())) ??
          false)
      );
    }
    const passesTopic0Filter = topicFilter(topics0Filter);
    const passesTopic1Filter = topicFilter(topics1Filter);
    const passesTopic2Filter = topicFilter(topics2Filter);

    const passesFrameworkFilter =
      frameworksFilter.length === 0 ||
      (point.funding_programmes?.some((funding) =>
        frameworksFilter.includes(funding.framework_programme),
      ) ??
        false);
    const passesCodeFilter =
      codeFilter.length === 0 ||
      (point.funding_programmes?.some((funding) =>
        codeFilter.includes(funding.code),
      ) ??
        false);

    return (
      passesSmeFilter &&
      passesCountryFilter &&
      passesTopic0Filter &&
      passesTopic1Filter &&
      passesTopic2Filter &&
      passesFrameworkFilter &&
      passesCodeFilter
    );
  });

  const filterMenus: ReactNode[] = [
    <RadioGroupFilter
      key="sme-filter"
      defaultValue={smeFilter}
      labels={SME_FILTERS}
      setOnValueChange={setSmeFilter}
    />,
    <CountryFilter
      key="country-filter"
      setSelectedCountries={setCountriesFilter}
    />,
    <TopicFilter
      key="topic-filter"
      setTopics0Filter={setTopics0Filter}
      setTopics1Filter={setTopics1Filter}
      setTopics2Filter={setTopics2Filter}
    />,
    <FundingFilter
      key="funding-filter"
      setFrameworksFilter={setFrameworksFilter}
      setCodeFilter={setCodeFilter}
    />,
  ];

  /** Layer */
  const layer = new ScatterplotLayer({
    id: `scatter-${id}`,
    data: filterdDataPoints,
    pickable: true,
    opacity: 0.8,
    filled: true,
    stroked: false,
    radiusScale: 6,
    radiusMinPixels: 3,
    radiusMaxPixels: 100,
    lineWidthMinPixels: 1,
    getRadius: 100,
    antialiasing: true,
    getPosition: (d) => [d.address_geolocation[1], d.address_geolocation[0]],
    getFillColor: (d) =>
      d.id === selectedInstitution?.id
        ? [1, 2, 3]
        : d.sme
          ? [20, 140, 0]
          : [255, 140, 0],
    onClick: (info) => {
      if (info.object) {
        setSelectedInstitution(info.object as InstitutionPoint);
      }
    },
  });

  return (
    <ScenarioTemplate
      id={id}
      title="Institution Map"
      isLoading={loading}
      error={error}
      statsCard={
        <span>
          Displaying {filterdDataPoints?.length.toLocaleString() || 0}{" "}
          Institutions
        </span>
      }
      filterMenus={filterMenus}
      layers={[layer]}
      detailsCard={institution && <InstitutionCard institution={institution} />}
    />
  );
}
