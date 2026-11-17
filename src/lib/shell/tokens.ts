/**
 * Motion tokens for the App Shell set.
 *
 * Ten components share three numbers and two curves; that is the whole reason
 * the set reads as one thing rather than ten. Kept as a dependency-free module
 * (same pattern as @/lib/motion and @/lib/palette) so a component copied out of
 * this repo carries its timing with it.
 *
 * The spring is the one the set is named around: stiffness 100 / damping 20 is
 * critically damped enough to never overshoot visibly at these distances, and
 * slow enough (~600ms settle) that a staggered group reads as one gesture
 * instead of a burst.
 */

export const spring = {
  /** Entrance reveals — hero lines, bento cells, footer columns. */
  reveal: { type: 'spring' as const, stiffness: 100, damping: 20, mass: 1 },
  /** Controls that must feel instant — popover panels, toggles. */
  snappy: { type: 'spring' as const, stiffness: 420, damping: 34, mass: 0.7 },
  /** Layout moves — the sidebar rail, the active-item indicator. */
  layout: { type: 'spring' as const, stiffness: 260, damping: 30, mass: 0.9 },
};

export const ease = {
  /** Material standard curve — matches `ease-[cubic-bezier(0.4,0,0.2,1)]`. */
  standard: [0.4, 0, 0.2, 1] as const,
  /** Decelerate — for anything that arrives and stays. */
  out: [0.22, 1, 0.36, 1] as const,
};

/** Seconds between siblings in a staggered reveal. */
export const STAGGER = 0.08;

/** ms between rows in the DataTable's `.delay-[Nms]` ladder. */
export const ROW_STEP_MS = 50;

/**
 * Every entrance in the set is the same two properties: opacity and a small
 * upward translate. Both are compositor-only, so a 24-cell grid revealing at
 * once costs one composite, not 24 layouts.
 */
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  shown: { opacity: 1, y: 0 },
};
