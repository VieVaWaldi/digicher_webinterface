"use client";
import React, { ReactNode } from "react";

import { ColumnLayer } from "@deck.gl/layers";
import { FundingBasePoint } from "datamodel/scenario_points/types";
import useTopicFilter from "core/components/menus/filter/TopicFilter";
import ScenarioTemplate from "core/components/scenarios/ScenarioTemplate";
import useCountryFilter from "core/components/menus/filter/CountryFilter";
import useTransformInstitutions from "core/hooks/transform/useTransformInstitutions";
import useFundingProgrammeFilter from "core/components/menus/filter/FundingProgrammeFilter";
import { useFundingInstitutionPoints } from "core/hooks/queries/scenario_points/useFundingInstitutionPoints";

export default function FundingScenario() {
  const id: string = "funding";
  const {
    data: fundingPoints,
    loading: loading,
    error: error,
  } = useFundingInstitutionPoints();
  const { data: transformedPoints } = useTransformInstitutions(fundingPoints);

  /** Progressive Enhancement */
  const dataPoints = transformedPoints ?? fundingPoints;

  /** Filter */
  const { CountryFilter, countryPredicate } = useCountryFilter();
  const { TopicFilter, topicPredicate } = useTopicFilter();
  const { FundingProgrammeFilter, fundingProgrammePredicate } =
    useFundingProgrammeFilter();

  const filterdDataPoints = dataPoints?.filter((point) => {
    return (
      countryPredicate(point) &&
      topicPredicate(point) &&
      fundingProgrammePredicate(point)
    );
  });

  const filterMenus: ReactNode[] = [
    <CountryFilter key="country-filter" />,
    <TopicFilter key="topic-filter" />,
    <FundingProgrammeFilter key="funding-filter" />,
  ];

  const layer = new ColumnLayer<FundingBasePoint>({
    id: id,
    data: filterdDataPoints,
    diskResolution: 10,
    radius: 10000,
    getPosition: (d) => [d.geolocation[1], d.geolocation[0]],
    getElevation: (d) => {
      const MAX_FUNDING = 205538467.02; // Known maximum
      const MAX_HEIGHT = 3000000; // Maximum height in m

      const funding = d.total_cost ? parseFloat(d.total_cost as string) : 0;
      return (funding / MAX_FUNDING) * MAX_HEIGHT;
    },
    getFillColor: (d) => {
      const MAX_FUNDING = 205538467.02;
      const funding = d.total_cost ? parseFloat(d.total_cost as string) : 0;
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
    (acc, o) => acc + parseFloat(o.total_cost ? o.total_cost : "0"),
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
      // infoPanel={institution && < institution={institution} />}
    />
  );
}
