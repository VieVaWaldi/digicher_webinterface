"use client";
import { useState } from "react";
import { ScatterplotLayer } from "deck.gl";
import { useInstitutionSmePoints } from "core/hooks/queries/useInstitutionSmePoints";
import { useInstitutionById } from "core/hooks/queries/useInstitutionById";
import InstitutionCard from "core/components/cards/InstitutionCard";
import { InstitutionSmePoint } from "datamodel/institution/types";
import ScenarioTemplate from "features/ScenarioTemplate";
import { INITIAL_VIEW_STATE_EU } from "core/components/deckgl/viewports";

export default function InstitutionScenario() {
  const [selectedInstitution, setSelectedInstitution] =
    useState<InstitutionSmePoint | null>(null);
  const { data: points, loading, error } = useInstitutionSmePoints();
  const { data: institution } = useInstitutionById(
    selectedInstitution?.id ?? -1,
  ); // loading, error

  const layer = new ScatterplotLayer({
    id: "institutions-points",
    data: points,
    pickable: true,
    opacity: 0.8,
    stroked: true,
    filled: true,
    radiusScale: 6,
    radiusMinPixels: 3,
    radiusMaxPixels: 100,
    lineWidthMinPixels: 1,
    getPosition: (d) => [d.address_geolocation[1], d.address_geolocation[0]],
    getFillColor: (d) => (d.sme ? [20, 140, 0] : [255, 140, 0]),
    onClick: (info) => {
      if (info.object) {
        setSelectedInstitution(info.object as InstitutionSmePoint);
      }
    },
    getRadius: 100,
  });

  return (
    <ScenarioTemplate
      title="Institution Map"
      isLoading={loading}
      error={error}
      statsCard={
        <span>Total Institutions: {points?.length.toLocaleString() || 0}</span>
      }
      initialViewState={INITIAL_VIEW_STATE_EU}
      layers={[layer]}
      detailsCard={institution && <InstitutionCard institution={institution} />}
    />
  );
}
