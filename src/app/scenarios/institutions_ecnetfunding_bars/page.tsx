"use client";
import { COORDINATE_SYSTEM, _GlobeView as GlobeView } from "@deck.gl/core";
import "mapbox-gl/dist/mapbox-gl.css";
import "@deck.gl/widgets/stylesheet.css";

import React, { useMemo } from "react";
import DeckGL from "@deck.gl/react";
import { BitmapLayer, ColumnLayer } from "@deck.gl/layers";
import { FullscreenWidget } from "@deck.gl/widgets";

import { INITIAL_VIEW_STATE_TILTED_EU } from "core/components/deckgl/viewports";
import { useInstitutionECNetFundings } from "core/hooks/queries/useInstitutionECNetFunding";
import { InstitutionECNetFunding } from "datamodel/institution/types";
import { TileLayer } from "deck.gl";

export default function InstitutionECNetFundingMap() {
  const {
    data: institutionECNetFundings,
    error: institutionECNetFundingsError,
  } = useInstitutionECNetFundings();
  const id: string = "institutions-ecnet-funding";

  const layer = new ColumnLayer<InstitutionECNetFunding>({
    id: id,
    data: institutionECNetFundings,
    diskResolution: 60,
    radius: 10000,

    getPosition: (d) => [d.address_geolocation[1], d.address_geolocation[0]],

    // Height of each column based on funding
    getElevation: (d) => {
      const MAX_FUNDING = 205538467.02; // Your known maximum
      const MAX_HEIGHT = 3000000; // Maximum height in meters you want for the tallest bar

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
        255 * normalizedFunding, // Red increases with funding
        0, // Green stays at 0
        0, // Blue stays at 0
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

  const backgroundLayers = useMemo(
    () => [
      new TileLayer({
        // data: "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
        data:
          "https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token=" +
          process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
        minZoom: 0,
        maxZoom: 19,
        tileSize: 256,

        renderSubLayers: (props) => {
          const { boundingBox } = props.tile;

          return new BitmapLayer(props, {
            data: undefined,
            image: props.data,
            _imageCoordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            bounds: [
              boundingBox[0][0],
              boundingBox[0][1],
              boundingBox[1][0],
              boundingBox[1][1],
            ],
          });
        },
      }),
    ],
    [],
  );

  return (
    <div className="flex h-screen flex-col">
      <div className="bg-white p-4">
        <h1 className="mb-2 text-2xl font-bold">
          Scenario | Institutions EC net fungding Bars
        </h1>
        <p className="mb-4">
          From 31k institutions displays 13k where ec net funding greater than
          0.
        </p>
      </div>
      <main className="relative flex-1">
        <DeckGL
          key={id}
          initialViewState={INITIAL_VIEW_STATE_TILTED_EU}
          layers={[backgroundLayers, layer]}
          views={new GlobeView()}
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
          {/* <Map
            mapStyle="mapbox://styles/mapbox/light-v11" // mapbox://styles/mapbox/dark-v11
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            projection={{ name: "globe" }}
            fog={{}}
          /> */}
        </DeckGL>
      </main>
    </div>
  );
}
