import { LayerProps } from "deck.gl";

interface BaseLayerProps {
  pickable: boolean;
  opacity: number;
  antialiasing: boolean;
  highlightColor: [number, number, number];
  autoHighlight: boolean;
  onClick?: LayerProps["onClick"];
}

export const baseLayerProps: BaseLayerProps = {
  pickable: true,
  opacity: 0.8,
  antialiasing: true,
  highlightColor: [1, 1, 1],
  autoHighlight: true,
};
