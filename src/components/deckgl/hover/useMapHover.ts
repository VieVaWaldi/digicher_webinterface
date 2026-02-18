import { useState, useCallback } from "react";
import { PickingInfo } from "deck.gl";

export interface HoverState<T> {
  x: number;
  y: number;
  data: T;
}

export function useMapHover<T>() {
  const [hoverState, setHoverState] = useState<HoverState<T> | null>(null);

  /**
   * Returns a stable PickingInfo handler for a specific layer.
   * Pass an extractor that maps info.object → T | null.
   * Returning null clears the tooltip.
   */
  const makeHoverHandler = useCallback(
    (extractor: (obj: unknown) => T | null) =>
      (info: PickingInfo) => {
        if (!info.object) {
          setHoverState(null);
          return;
        }
        const data = extractor(info.object);
        setHoverState(
          data !== null ? { x: info.x, y: info.y, data } : null,
        );
      },
    [],
  );

  return { hoverState, makeHoverHandler };
}