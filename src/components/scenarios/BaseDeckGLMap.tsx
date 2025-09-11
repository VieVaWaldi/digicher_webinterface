import React from "react";

import Map, { ViewState } from "react-map-gl";
import { BitmapLayer, FullscreenWidget, TileLayer } from "deck.gl";

import DeckGL from "@deck.gl/react";
import { MapView } from "@deck.gl/core";
import { PickingInfo } from "@deck.gl/core";
import { _GlobeView as GlobeView } from "@deck.gl/core";
import { useSettings } from "core/context/SettingsContext";
import { COORDINATE_SYSTEM, LayersList } from "@deck.gl/core";

import "mapbox-gl/dist/mapbox-gl.css";
import "@deck.gl/widgets/stylesheet.css";
import { Spinner } from "shadcn/spinner";

interface UnifiedDeckMapProps {
  id: string;
  layers: LayersList | null;
  viewState: ViewState;
  onMapClick: (info: PickingInfo) => void;
  onEmptyMapClick?: () => void;
  loading?: boolean;
  error: Error | null;
}

export default function BaseDeckGLMap({
  id,
  layers,
  viewState,
  onMapClick,
  onEmptyMapClick,
  loading = false,
  error = null,
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

  const handleClick = (info: PickingInfo) => {
    if (info.object) {
      onMapClick(info);
    } else if (onEmptyMapClick) {
      onEmptyMapClick();
    }
  };

  const view = isGlobe
    ? new GlobeView({ id: "globe" })
    : new MapView({
        id: "mercator",
        controller: true,
      });

  const activeLayers = isGlobe
    ? [backgroundLayers, ...(layers || [])]
    : layers || [];

  return (
    <>
      <DeckGL
        id={`deck-id-${id}`}
        key={`deck-key-${id}`}
        initialViewState={viewState}
        views={view}
        layers={activeLayers}
        controller={true}
        onClick={handleClick}
        getCursor={({ isDragging, isHovering }) => {
          if (isDragging) return "grabbing";
          if (isHovering) return "pointer";
          return "grab";
        }}
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

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
          <div className="rounded-lg bg-white p-4 shadow-lg">
            <Spinner />
            <p className="mt-2 text-sm text-gray-600">Loading ...</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
          <div className="rounded-lg bg-white p-4 shadow-lg">
            <p className="text-red-600">
              Something went wrong, this is still the alpha version though
            </p>
          </div>
        </div>
      )}
    </>
  );
}
