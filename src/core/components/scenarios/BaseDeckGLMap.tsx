import React from "react";

import Map from "react-map-gl";
import { BitmapLayer, FullscreenWidget, TileLayer } from "deck.gl";

import DeckGL from "@deck.gl/react";
import { MapView } from "@deck.gl/core";
import { PickingInfo } from "@deck.gl/core";
import { _GlobeView as GlobeView } from "@deck.gl/core";
import { useSettings } from "core/context/SettingsContext";
import { COORDINATE_SYSTEM, LayersList } from "@deck.gl/core";
import { INITIAL_VIEW_STATE_EU } from "core/components/scenarios/viewports";

import "mapbox-gl/dist/mapbox-gl.css";
import "@deck.gl/widgets/stylesheet.css";

interface UnifiedDeckMapProps {
  id: string;
  layers: LayersList;
  onMapClick: (info: PickingInfo) => void;
}

export default function BaseDeckGLMap({
  id,
  layers,
  onMapClick,
}: UnifiedDeckMapProps) {
  const { mapBoxStyle, isGlobe } = useSettings();
  const mapStyle = "mapbox://styles/" + mapBoxStyle;

  const backgroundLayers = [
    new TileLayer({
      data: `https://api.mapbox.com/styles/v1/${mapBoxStyle}/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`,
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
  ];

  const view = isGlobe
    ? new GlobeView({ id: "globe" })
    : new MapView({
        id: "mercator",
        controller: true,
      });

  const activeLayers = isGlobe ? [backgroundLayers, ...layers] : layers;

  return (
    <DeckGL
      id={`deck-id-${id}`}
      key={`deck-key-${id}`}
      initialViewState={INITIAL_VIEW_STATE_EU}
      views={view}
      layers={activeLayers}
      controller={true}
      onClick={onMapClick}
      getCursor={({ isDragging }) => (isDragging ? "grabbing" : "grab")}
      widgets={[
        new FullscreenWidget({
          id: "fullscreen",
          placement: "bottom-right",
        }),
      ]}
    >
      {!isGlobe && (
        <Map
          mapStyle={mapStyle}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
          projection={{ name: "mercator" }}
        />
      )}
    </DeckGL>
  );
}
