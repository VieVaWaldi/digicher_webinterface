export const INITIAL_VIEW_STATE_EU = {
  longitude: 10,
  latitude: 50,
  zoom: 4,
  controller: {
    touchPitch: true, // Enables two-finger pitch/tilt
    touchRotate: true, // Enables two-finger rotation
  },
};

export const INITIAL_VIEW_STATE_TILTED_EU = {
  longitude: 10,
  latitude: 50,
  zoom: 4,
  pitch: 45, // Adds 45-degree tilt
  bearing: 0, // Optional: controls rotation (0 means north is up)
  controller: {
    touchPitch: true, // Enables two-finger pitch/tilt
    touchRotate: true, // Enables two-finger rotation
  },
};

export const INITIAL_VIEW_STATE_EU_GLOBE = {
  longitude: 10,
  latitude: 50,
  zoom: 3,
  scale: 1,
  bearing: 0,
};
