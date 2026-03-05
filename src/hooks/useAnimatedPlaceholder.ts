"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates a placeholder string when the target changes:
 * deletes the current text character by character (fast), then
 * types the new text character by character.
 */
export function useAnimatedPlaceholder(
  target: string,
  deleteSpeed = 15,
  typeSpeed = 15,
): string {
  const [displayed, setDisplayed] = useState(target);
  const currentRef = useRef(target);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (currentRef.current === target) return;

    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    const from = currentRef.current;
    currentRef.current = target;

    const next: ReturnType<typeof setTimeout>[] = [];

    // Delete phase
    for (let i = 0; i <= from.length; i++) {
      next.push(
        setTimeout(() => {
          setDisplayed(from.slice(0, from.length - i));
        }, i * deleteSpeed),
      );
    }

    // Type phase (starts after delete finishes)
    const deleteTime = from.length * deleteSpeed;
    for (let i = 1; i <= target.length; i++) {
      next.push(
        setTimeout(() => {
          setDisplayed(target.slice(0, i));
        }, deleteTime + i * typeSpeed),
      );
    }

    timeoutsRef.current = next;
    return () => next.forEach(clearTimeout);
  }, [target, deleteSpeed, typeSpeed]);

  return displayed;
}