import { useCallback, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';

/**
 * Sizes a round button to fit the space it's given.
 *
 * Attach `onLayout` to the flexible area that holds the button. The size is the
 * largest that fits that area's height and width (minus `reserved` points for
 * anything else in the area), never more than `max` and never less than `min`.
 * `ratio` (size / max) lets text inside the button shrink with it.
 */
export function useFitSize(max: number, min: number, reserved = 0) {
  const [space, setSpace] = useState<{ w: number; h: number } | null>(null);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSpace((prev) => (prev && prev.w === width && prev.h === height ? prev : { w: width, h: height }));
  }, []);

  const size = space ? Math.max(min, Math.min(max, space.h - reserved, space.w)) : max;
  return { size, ratio: size / max, onLayout };
}
