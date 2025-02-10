"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import "@deck.gl/widgets/stylesheet.css";

import React, { ReactNode, useState } from "react";
import { ColumnLayer } from "@deck.gl/layers";
import ScenarioTemplate from "core/components/deckgl/ScenarioTemplate";
import { InstitutionFundingPoint } from "datamodel/institution/types";
import { useInstitutionFundingsPoints } from "core/hooks/queries/institution/useInstitutionECNetFunding";
import CountryFilter from "core/components/menus/filter/CountryFilter";
import useTransformInstitutionTopics from "core/hooks/transform/useTransformInstitutionTopics";
import TopicFilter from "core/components/menus/filter/TopicFilter";

export default function InstitutionECNetFundingMap() {
  const id: string = "funding";
  const {
    data: fundingPoints,
    loading: loading,
    error: error,
  } = useInstitutionFundingsPoints();
  const {
    data: transformedPoints,
    loading: loadingTransformed,
    error: errorTransformed,
  } = useTransformInstitutionTopics(fundingPoints);

  // Progressive Enhancement
  const dataPoints = transformedPoints ?? fundingPoints;

  /** Filter */
  const [countriesFilter, setCountriesFilter] = useState<string[]>([]);
  const [topics0Filter, setTopics0Filter] = useState<string[]>([]);
  const [topics1Filter, setTopics1Filter] = useState<string[]>([]);
  const [topics2Filter, setTopics2Filter] = useState<string[]>([]);

  const filterdDataPoints = dataPoints?.filter((point) => {
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

    return (
      passesCountryFilter &&
      passesTopic0Filter &&
      passesTopic1Filter &&
      passesTopic2Filter
    );
  });

  const filterMenus: ReactNode[] = [
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
  ];

  const layer = new ColumnLayer<InstitutionFundingPoint>({
    id: id,
    data: filterdDataPoints,
    diskResolution: 10,
    radius: 10000,
    getPosition: (d) => [d.address_geolocation[1], d.address_geolocation[0]],
    getElevation: (d) => {
      const MAX_FUNDING = 205538467.02; // Known maximum
      const MAX_HEIGHT = 3000000; // Maximum height in m

      const funding = d.total_eu_funding
        ? parseFloat(d.total_eu_funding as string)
        : 0;
      return (funding / MAX_FUNDING) * MAX_HEIGHT;
    },
    getFillColor: (d) => {
      const MAX_FUNDING = 205538467.02;
      const funding = d.total_eu_funding
        ? parseFloat(d.total_eu_funding as string)
        : 0;
      const normalizedFunding = funding / MAX_FUNDING;

      return [255 * normalizedFunding, 0, 0, 200];
    },
    pickable: true,
    autoHighlight: true,
    extruded: true,
    material: {
      ambient: 0.64,
      diffuse: 0.6,
      shininess: 32,
      specularColor: [51, 51, 51],
    },
  });

  const funding = filterdDataPoints?.reduce(
    (acc, o) => acc + parseFloat(o.total_eu_funding ? o.total_eu_funding : "0"),
    0,
  );

  return (
    <ScenarioTemplate
      id={id}
      title="Funding Map"
      isLoading={loading}
      error={error}
      statsCard={
        <span>
          Displaying {filterdDataPoints?.length.toLocaleString() || 0}{" "}
          Institutions with{" "}
          {new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "EUR",
          }).format(funding ? funding : 0)}
        </span>
      }
      filterMenus={filterMenus}
      layers={[layer]}
      // detailsCard={institution && <InstitutionCard institution={institution} />}
    />
  );
}
