/** Custom Deck Map Controller  to fix the mobile zoom inertia bug*/

import { MapController } from "@deck.gl/core";

// Matches deck.gl's internal inertia easing
const INERTIA_EASING = (t: number) => 1 - (1 - t) * (1 - t);

// If the last two pinch events are closer than this, the velocity calculation
// produces near-infinity (touchend fires almost simultaneously with last touchmove).
// In that case we skip inertia entirely — the gesture already placed the view correctly.
const MIN_DT_MS = 16;

// Maximum zoom velocity in log2-zoom units per millisecond.
// Prevents runaway zoom from fast-but-not-simultaneous pinch lifts.
const MAX_VELOCITY_PER_MS = 0.004;

export class TamedMapController extends MapController {
  private _lastPinchEvent: Record<string, unknown> | null = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected override _onPinchStart(event: any): boolean {
    this._lastPinchEvent = null;
    return super._onPinchStart(event);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected override _onPinch(event: any): boolean {
    this._lastPinchEvent = event;
    return super._onPinch(event);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected override _onPinchEnd(event: any): boolean {
    const lastEvent = this._lastPinchEvent;
    this._lastPinchEvent = null;

    if (!this.isDragging()) return false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inertia = (this as any).inertia as number;
    const hasInertia = inertia > 0;

    if (hasInertia && lastEvent && event.scale !== lastEvent.scale) {
      const dt =
        (event.deltaTime as number) - (lastEvent.deltaTime as number);

      // dt near zero → near-infinite velocity → skip inertia, apply clean zoom end
      if (dt < MIN_DT_MS) {
        // Pass scale equal to last tracked scale so the deck.gl inertia condition
        // (`event.scale !== _lastPinchEvent.scale`) is false → takes the clean else
        // branch which just calls zoomEnd + updateViewport with no transition.
        return super._onPinchEnd({ ...event, scale: lastEvent.scale });
      }

      const pos = this.getCenter(event);
      const z = Math.log2(event.scale as number);
      let velocityZ =
        (z - Math.log2(lastEvent.scale as number)) / dt;

      // Clamp velocity to prevent runaway zoom from fast pinch lifts
      if (Math.abs(velocityZ) > MAX_VELOCITY_PER_MS) {
        velocityZ = Math.sign(velocityZ) * MAX_VELOCITY_PER_MS;
      }

      const endScale = Math.pow(2, z + (velocityZ * inertia) / 2);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let newState = (this.controllerState as any).rotateEnd();
      newState = newState.zoom({ pos, scale: endScale }).zoomEnd();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any).updateViewport(
        newState,
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(this as any)._getTransitionProps({ around: pos }),
          transitionDuration: inertia,
          transitionEasing: INERTIA_EASING,
        },
        {
          isDragging: false,
          isPanning: true,
          isZooming: true,
          isRotating: false,
        }
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any).blockEvents(inertia);

      // pinchEventWorkaround._lastPinchEvent (deck.gl module-private) remains non-null
      // until the next _onPinchStart resets it — acceptable since it's reset before
      // any subsequent _onPinchEnd can read a stale value.
      return true;
    }

    return super._onPinchEnd(event);
  }
}