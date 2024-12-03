"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import "@deck.gl/widgets/stylesheet.css";

import React from "react";
import DeckGL from "@deck.gl/react";
import Map from "react-map-gl";
import { ColumnLayer } from "@deck.gl/layers";
import { FullscreenWidget } from "@deck.gl/widgets";

import Header from "components/Header";

import { INITIAL_VIEW_STATE_TILTED_EU } from "components/deckgl/viewports";
import { useInstitutionECNetFundings } from "hooks/queries/useInstitutionECNetFunding";
import { InstitutionECNetFunding } from "lib/types";

export default function InstitutionECNetFundingMap() {
  const { institutionECNetFundings, error: institutionECNetFundingsError } =
    useInstitutionECNetFundings();

  const layer = new ColumnLayer<InstitutionECNetFunding>({
    id: "institutions-ecnet-funding",
    data: institutionECNetFundings,
    diskResolution: 6,
    radius: 1000,

    getPosition: (d) => [d.address_geolocation[1], d.address_geolocation[0]],

    // Height of each column based on funding
    getElevation: (d) => {
      const MAX_FUNDING = 205538467.02; // Your known maximum
      const MAX_HEIGHT = 300000; // Maximum height in meters you want for the tallest bar

      const funding = d.total_eu_funding
        ? parseFloat(d.total_eu_funding as string)
        : 0;
      return (funding / MAX_FUNDING) * MAX_HEIGHT; // This will make heights relative to max
    },

    getFillColor: (d) => {
      const MAX_FUNDING = 205538467.02;
      const funding = d.total_eu_funding
        ? parseFloat(d.total_eu_funding as string)
        : 0;
      const normalizedFunding = funding / MAX_FUNDING;

      return [
        255, // Red stays at 255
        255 * (1 - normalizedFunding), // Green decreases with funding
        255 * (1 - normalizedFunding), // Blue decreases with funding
        200, // Alpha
      ];
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

  return (
    <div className="flex flex-col h-screen">
      <Header showBackButton={true} />
      <div className="p-4 bg-white">
        <h1 className="text-2xl font-bold mb-2">
          Scenario | Institutions EC net fungding Bars
        </h1>
        <p className="mb-4">
          From 31k institutions displays 13k where ec net funding greater than
          0.
        </p>
      </div>
      <main className="flex-1 relative">
        <DeckGL
          initialViewState={INITIAL_VIEW_STATE_TILTED_EU}
          layers={[layer]}
          controller={true}
          getTooltip={({ object }) =>
            object && {
              html: `
                <div>
                    <b>${object.institution_name}</b><br/>
                    Funding: €${(
                      parseFloat(object.total_eu_funding || "0") / 1000000
                    ).toFixed(2)}M<br/>
                    Projects: ${object.number_of_projects}
                </div>
            `,
            }
          }
          widgets={[
            new FullscreenWidget({
              id: "fullscreen",
              placement: "bottom-right",
            }),
          ]}
        >
          <Map
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            projection={{ name: "mercator" }}
          />
        </DeckGL>
      </main>
    </div>
  );
}
