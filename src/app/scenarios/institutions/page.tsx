"use client";
import { ReactNode, useState } from "react";
import { ScatterplotLayer } from "deck.gl";
import { useInstitutionPoints } from "core/hooks/queries/institution/useInstitutionPoints";
import { useInstitutionById } from "core/hooks/queries/institution/useInstitutionById";
import InstitutionCard from "core/components/cards/InstitutionCard";
import { InstitutionPoint } from "datamodel/institution/types";
import CountryFilter from "core/components/menus/filter/CountryFilter";
import { RadioGroupFilter } from "core/components/menus/filter/RadioGroup";
import ScenarioTemplate from "core/components/deckgl/ScenarioTemplate";

const SME_FILTERS = ["All", "SME", "Non-SME"] as const;
export type SmeFilter = (typeof SME_FILTERS)[number];

export default function InstitutionScenario() {
  const id: string = "institutions";

  /** Data */
  const { data: institutionPoints, loading, error } = useInstitutionPoints();
  const [selectedInstitution, setSelectedInstitution] =
    useState<InstitutionPoint | null>(null);
  const {
    data: institution,
    loading: loadingCard,
    error: errorCard,
  } = useInstitutionById(selectedInstitution?.id ?? -1);

  /** Filter */
  const [smeFilter, setSmeFilter] = useState<SmeFilter>("All");
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const filterdInstitutionPoints = institutionPoints?.filter((point) => {
    const passesSmeFilter =
      smeFilter === "All" || (smeFilter === "SME" ? point.sme : !point.sme);

    const passesCountryFilter =
      selectedCountries.length === 0 ||
      !point.address_country ||
      selectedCountries.includes(point.address_country);

    return passesSmeFilter && passesCountryFilter;
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
      selectedCountries={selectedCountries}
      setSelectedCountries={setSelectedCountries}
    />,
  ];

  /** Layer */
  const layer = new ScatterplotLayer({
    id: `scatter-${id}`,
    data: filterdInstitutionPoints,
    pickable: true,
    opacity: 0.8,
    filled: true,
    radiusScale: 6,
    radiusMinPixels: 3,
    radiusMaxPixels: 100,
    lineWidthMinPixels: 1,
    getPosition: (d) => [d.address_geolocation[1], d.address_geolocation[0]],
    getFillColor: (d) => (d.sme ? [20, 140, 0] : [255, 140, 0]),
    onClick: (info) => {
      if (info.object) {
        setSelectedInstitution(info.object as InstitutionPoint);
      }
    },
    getRadius: 100,
  });

  return (
    <ScenarioTemplate
      id={id}
      title="Institution Map"
      isLoading={loading}
      error={error}
      statsCard={
        <span>
          Displaying {filterdInstitutionPoints?.length.toLocaleString() || 0}{" "}
          Institutions
        </span>
      }
      filterMenus={filterMenus}
      layers={[layer]}
      detailsCard={institution && <InstitutionCard institution={institution} />}
    />
  );
}
