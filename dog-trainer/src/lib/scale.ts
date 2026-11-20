import { Dimensions } from 'react-native';

/**
 * Proportional sizing so the app looks the same on every phone.
 *
 * All sizes in the app are designed for a 390-point-wide iPhone (iPhone 12–16).
 * `sz()` scales them to the current screen width, so a 375-point iPhone mini and a
 * 393-point iPhone Pro show identical layouts: same line breaks, same proportions.
 * The factor is capped so tablets and very small screens stay sensible.
 */
const DESIGN_WIDTH = 390;
const MIN_SCALE = 0.8;
const MAX_SCALE = 1.25;

let factor = computeFactor(Dimensions.get('window').width);

function computeFactor(width: number) {
  if (!width || width < 200) return 1; // not measured yet
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, width / DESIGN_WIDTH));
}

Dimensions.addEventListener('change', ({ window }: { window: { width: number } }) => {
  factor = computeFactor(window.width);
});

/** Scale a design size (in points at 390pt width) to this screen. */
export function sz(n: number) {
  // Half-point rounding keeps text crisp while staying proportional.
  return Math.round(n * factor * 2) / 2;
}

export function scaleFactor() {
  return factor;
}
