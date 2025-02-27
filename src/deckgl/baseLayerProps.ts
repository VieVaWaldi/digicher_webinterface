import { LayerProps } from "deck.gl";

interface BaseLayerProps {
  pickable: boolean;
  opacity: number;
  stroked: boolean;
  lineWidthMinPixels: number;
  antialiasing: boolean;
  highlightColor: [number, number, number];
  autoHighlight: boolean;
  filled: boolean;
  radiusMinPixels: number;
  radiusMaxPixels: number;
  onClick?: LayerProps["onClick"];
}

export const baseLayerProps: BaseLayerProps = {
  pickable: true,
  opacity: 0.4,
  stroked: true,
  lineWidthMinPixels: 1,
  antialiasing: true,
  highlightColor: [1, 200, 1],
  autoHighlight: true,

  filled: true,
  radiusMinPixels: 5,
  radiusMaxPixels: 5,
};
