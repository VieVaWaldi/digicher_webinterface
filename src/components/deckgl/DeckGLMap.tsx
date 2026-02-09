import { BitmapLayer, FullscreenWidget, TileLayer } from "deck.gl";
import Map, { ViewState } from "react-map-gl/mapbox";
import { useState } from "react";

import {
  _GlobeView as GlobeView,
  COORDINATE_SYSTEM,
  LayersList,
  MapView,
  PickingInfo,
} from "@deck.gl/core";
import DeckGL from "@deck.gl/react";

import "@deck.gl/widgets/stylesheet.css";
import { useSettings } from "context/SettingsContext";
import "mapbox-gl/dist/mapbox-gl.css";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useThemeMode } from "@/app/providers";

interface UnifiedDeckMapProps {
  id: string;
  layers: LayersList | null;
  defaultViewState: ViewState;
  commandedViewState: ViewState | undefined;
  isGlobe: boolean;
  onViewStateChange: (viewState: ViewState) => void;
  // onMapClick: (info: PickingInfo) => void;
  onEmptyMapClick?: () => void;
  loading?: boolean;
  error: Error | null;
}

export default function DeckGLMap({
  id,
  layers,
  defaultViewState,
  commandedViewState,
  onViewStateChange,
  isGlobe,
  // onMapClick,
  onEmptyMapClick,
  loading = false,
  error = null,
}: UnifiedDeckMapProps) {
  // const { isGlobe } = useSettings();
  const { resolvedMode } = useThemeMode();
  const [currentZoom, setCurrentZoom] = useState(defaultViewState.zoom ?? 0);

  const ZOOM_STYLE_THRESHOLD = 13;
  const selectedMapBoxStyle =
    resolvedMode === "light" ? "mapbox/light-v11" : "mapbox/dark-v11";
  const mapBoxStyle =
    currentZoom > ZOOM_STYLE_THRESHOLD ? "mapbox/standard" : selectedMapBoxStyle;
  const mapStyle = "mapbox://styles/" + mapBoxStyle;

  // const isGlobe = false;

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
    if (info.object && onEmptyMapClick) {
      onEmptyMapClick();
    }
  };

  const view = isGlobe
    ? new GlobeView({ id: "globe" }) // , resolution: 10
    : new MapView({ id: "mercator" });

  // Google Maps-like controller config for globe mode:
  // - dragMode: 'pan' keeps horizontal rotation working
  // - Vertical drag inverted feel achieved through standard globe controller
  const controllerConfig = isGlobe
    ? {
        inertia: true,
        scrollZoom: true,
        doubleClickZoom: true,
        dragPan: true,
        dragRotate: false, // Disable pitch/bearing rotation on right-drag
        touchRotate: false,
        keyboard: true,
      }
    : { inertia: true };

  const activeLayers = isGlobe
    ? [backgroundLayers, ...(layers || [])]
    : layers || [];

  return (
    <>
      <DeckGL
        id={`deck-id-${id}`}
        key={`deck-key-${id}`}
        initialViewState={defaultViewState}
        viewState={commandedViewState}
        onViewStateChange={({ viewState: newViewState }) => {
          const vs = newViewState as ViewState;
          setCurrentZoom(vs.zoom ?? 0);
          onViewStateChange(vs);
        }}
        views={view}
        layers={activeLayers}
        controller={controllerConfig}
        onClick={handleClick}
        getCursor={({ isDragging, isHovering }) => {
          if (isDragging) return "grabbing";
          if (isHovering) return "pointer";
          return "grab";
        }}
        widgets={
          [
            // new FullscreenWidget({
            //   id: "fullscreen",
            //   placement: "bottom-right",
            // }),
          ]
        }
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
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: (theme) => alpha(theme.palette.common.black, 0.2),
          }}
        >
          <Paper sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <CircularProgress size={32} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading ...
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Error overlay */}
      {error && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: (theme) => alpha(theme.palette.common.black, 0.2),
          }}
        >
          <Paper sx={{ p: 3 }}>
            <Typography color="error">
              Something went wrong, this is still the alpha version though
            </Typography>
          </Paper>
        </Box>
      )}
    </>
  );
}
