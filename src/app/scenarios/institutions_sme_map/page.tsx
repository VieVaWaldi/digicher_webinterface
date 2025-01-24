"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import React, { useState } from "react";

import DeckGL from "@deck.gl/react";
import Map from "react-map-gl";
import { ScatterplotLayer } from "deck.gl";
import { INITIAL_VIEW_STATE_EU } from "core/components/deckgl/viewports";

import { useInstitutionSmePoints } from "core/hooks/queries/useInstitutionSmePoints";
import { useInstitutionById } from "core/hooks/queries/useInstitutionById";
import InstitutionCard from "core/components/cards/InstitutionCard";

export default function InstitutionSmePointsMap() {
  const [popupInfo, setPopupInfo] = useState<{
    institutionId: number;
    x: number;
    y: number;
  } | null>(null);
  const { data: institutionSmePoints, error: institutionSmePointsError } =
    useInstitutionSmePoints();
  const { data: institution, error: institutionError } = useInstitutionById(
    popupInfo?.institutionId ?? -1,
  );

  const layer = new ScatterplotLayer({
    id: "institutions-sme-points",
    data: institutionSmePoints,
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
    getRadius: 100,
    onClick: (info) => {
      if (info.object) {
        console.log(info.object);
        setPopupInfo({
          institutionId: info.object.id,
          x: info.x,
          y: info.y,
        });
      } else {
        setPopupInfo(null);
      }
    },
  });

  return (
    <div className="flex h-screen flex-col">
      <div className="bg-white p-4">
        <h1 className="mb-2 text-2xl font-bold">
          Scenario | Institutions SME Map
        </h1>
        <p className="mb-4">
          All insitutions are visualised here. Green dots are SMEs. Click on an
          institution to get more information.
        </p>
      </div>
      <main className="relative flex-1">
        <DeckGL
          initialViewState={INITIAL_VIEW_STATE_EU}
          layers={[layer]}
          controller={true}
          style={{ position: "absolute", width: "100%", height: "100%" }}
          onClick={(info) => {
            if (!info.picked) {
              setPopupInfo(null);
            }
          }}
        >
          <Map
            mapStyle="mapbox://styles/mapbox/standard"
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
          />

          {popupInfo && institution && (
            <div
              className="absolute z-10"
              style={{
                left: popupInfo.x,
                top: popupInfo.y,
                transform: "translate(-50%, -100%)",
                marginTop: "-10px",
              }}
            >
              <InstitutionCard institution={institution} />
            </div>
          )}
        </DeckGL>
      </main>
    </div>
  );
}
