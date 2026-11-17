/**
 * "Set II" tokens — the navy + five-accent system the 20 imported
 * Live-Components-II pieces are built from. Kept as a small shared palette
 * (per the hybrid port) so the colour-driven demos still read, while shape
 * follows the library's brutalist rules (radius 0, 1px hairlines, no shadows).
 *
 * JS-side consumers (canvas fields, scroll-scrubbed colour lerps) read these
 * hex strings directly; Tailwind mirrors them as `navy`, `cream`, `coral`,
 * `moss`, `gold`, `violet` for markup.
 */
export const SET2 = {
  navy: '#0c394a',
  navy700: '#11475c',
  navy900: '#07222c',
  cream: '#f4f1e8',
  paper: '#fbf9f3',
  ink: '#0c394a',
  inkSoft: 'rgba(12,57,74,0.58)',
  line: 'rgba(12,57,74,0.14)',
  accent: '#ff5a3c',
  green: '#2f9e7f',
  gold: '#e8a23d',
  violet: '#7b6cf6',
} as const;

/** Six-step accent ramp used by the per-item grids, clouds and carousels. */
export const SET2_RAMP: string[] = [
  SET2.navy,
  SET2.accent,
  SET2.green,
  SET2.gold,
  SET2.violet,
  SET2.navy700,
];

/** Convert a `#rrggbb` string to an `[r, g, b]` tuple for canvas fills. */
export function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace('#', '');
  return [
    parseInt(m.slice(0, 2), 16),
    parseInt(m.slice(2, 4), 16),
    parseInt(m.slice(4, 6), 16),
  ];
}
