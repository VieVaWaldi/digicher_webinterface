import { ViewState } from "react-map-gl/mapbox";

export const INITIAL_VIEW_STATE_EU: ViewState = {
  longitude: 10,
  latitude: 50,
  zoom: 4,
  pitch: 0,
  bearing: 0,
  padding: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
};

export const INITIAL_VIEW_STATE_TILTED_EU: ViewState = {
  longitude: 8,
  latitude: 48,
  zoom: 4.2,
  pitch: 45,
  bearing: 15,
  padding: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
};

export const INITIAL_VIEW_STATE_EU_GLOBE = {
  longitude: 10,
  latitude: 50,
  zoom: 3,
  scale: 1,
  bearing: 0,
};
