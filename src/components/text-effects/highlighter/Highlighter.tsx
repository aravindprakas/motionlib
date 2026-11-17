// Highlighter — hand-drawn marker annotations over inline text
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export type HighlighterAction =
  | 'highlight'
  | 'underline'
  | 'box'
  | 'circle'
  | 'strike-through'
  | 'crossed-off'
  | 'bracket';

export interface HighlighterProps {
  children: ReactNode;
  /** Which annotation to draw. Default 'highlight'. */
  action?: HighlighterAction;
  /** Any CSS colour. Default vermilion. */
  color?: string;
  /** Pen thickness in px (ignored by 'highlight', which scales to the type). Default 2. */
  strokeWidth?: number;
  /** How many passes of the pen — 2 reads as a confident hand-drawn stroke. Default 2. */
  iterations?: number;
  /** Wobble of the stroke in px. 0 draws perfectly straight. Default 2. */
  roughness?: number;
  /** Extra breathing room around the text in px. Default 2. */
  padding?: number;
  /** Draw-in time in ms. Default 700. */
  duration?: number;
  /** Delay before drawing in ms. Default 0. */
  delay?: number;
  /** 'view' draws once on entry, 'hover' on pointer-enter, 'mount' immediately. Default 'view'. */
  trigger?: 'view' | 'hover' | 'mount';
  /** Opacity of the ink. Defaults to 0.45 for 'highlight', 1 otherwise. */
  opacity?: number;
  /** Paint under the text instead of over it. Defaults to true for 'highlight'. */
  behind?: boolean;
  /** Multiply the marker into the page like real ink. Defaults to true for 'highlight'. */
  blend?: boolean;
  className?: string;
}

/* ---------------------------------------------------------------------------
 * Deterministic RNG — the same phrase re-renders with the same wobble, so the
 * annotation never twitches on a re-render or resize redraw.
 * ------------------------------------------------------------------------- */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A line drawn as a jittered cubic — the control points carry the wobble. */
function roughLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  rng: () => number,
  rough: number,
): string {
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const j = Math.min(rough, len / 8);
  const r = () => (rng() * 2 - 1) * j;
  const dx = x2 - x1;
  const dy = y2 - y1;
  return [
    `M${(x1 + r()).toFixed(2)},${(y1 + r()).toFixed(2)}`,
    `C${(x1 + dx * 0.35 + r()).toFixed(2)},${(y1 + dy * 0.35 + r()).toFixed(2)}`,
    `${(x1 + dx * 0.7 + r()).toFixed(2)},${(y1 + dy * 0.7 + r()).toFixed(2)}`,
    `${(x2 + r()).toFixed(2)},${(y2 + r()).toFixed(2)}`,
  ].join(' ');
}

/** Catmull-Rom through jittered points → an open sketchy loop. */
function roughEllipse(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rng: () => number,
  rough: number,
): string {
  const steps = 14;
  const from = -0.25;
  const to = Math.PI * 2 + 0.35; // overshoot, like a real circling pen
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= steps; i++) {
    const a = from + ((to - from) * i) / steps;
    const wob = 1 + (rng() * 2 - 1) * (rough / 40);
    pts.push([cx + Math.cos(a) * rx * wob, cy + Math.sin(a) * ry * wob]);
  }
  let d = `M${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
  }
  return d;
}

interface Stroke {
  d: string;
  width: number;
  cap: 'round' | 'butt';
}

interface Band {
  left: number;
  right: number;
  /** Top of the glyphs, not of the line box. */
  top: number;
  /** Baseline-ish bottom of the glyphs. */
  bottom: number;
  mid: number;
  size: number;
}

function buildStrokes(
  action: HighlighterAction,
  band: Band,
  pad: number,
  strokeWidth: number,
  iterations: number,
  rough: number,
  rng: () => number,
): Stroke[] {
  const out: Stroke[] = [];
  const L = band.left - pad;
  const R = band.right + pad;
  const T = band.top - pad;
  const B = band.bottom + pad;
  const midY = band.mid;
  const w = R - L;
  const h = B - T;

  const pen = (d: string, width = strokeWidth, cap: 'round' | 'butt' = 'round') =>
    out.push({ d, width, cap });

  switch (action) {
    case 'highlight': {
      // One fat marker sweep across the glyph band — sized from the type, not
      // the line box, so generous line-height doesn't inflate the band.
      const thickness = band.size * 0.92;
      for (let i = 0; i < Math.max(1, iterations - 1); i++) {
        pen(
          roughLine(L, midY + (rng() - 0.5) * 2, R, midY + (rng() - 0.5) * 2, rng, rough * 0.6),
          thickness,
          'butt',
        );
      }
      break;
    }
    case 'underline': {
      for (let i = 0; i < iterations; i++) {
        const yy = B + i * (strokeWidth * 0.9);
        pen(roughLine(L, yy, R, yy, rng, rough));
      }
      break;
    }
    case 'strike-through': {
      for (let i = 0; i < iterations; i++) {
        pen(roughLine(L, midY, R, midY, rng, rough));
      }
      break;
    }
    case 'box': {
      for (let i = 0; i < iterations; i++) {
        pen(roughLine(L, T, R, T, rng, rough));
        pen(roughLine(R, T, R, B, rng, rough));
        pen(roughLine(R, B, L, B, rng, rough));
        pen(roughLine(L, B, L, T, rng, rough));
      }
      break;
    }
    case 'circle': {
      const cx = (L + R) / 2;
      const cy = (T + B) / 2;
      for (let i = 0; i < iterations; i++) {
        pen(roughEllipse(cx, cy, w / 2 + band.size * 0.25, h / 2 + band.size * 0.3, rng, rough + 6));
      }
      break;
    }
    case 'crossed-off': {
      for (let i = 0; i < iterations; i++) {
        pen(roughLine(L, T, R, B, rng, rough));
        pen(roughLine(R, T, L, B, rng, rough));
      }
      break;
    }
    case 'bracket': {
      const tick = Math.min(w * 0.12, band.size * 0.5);
      for (let i = 0; i < iterations; i++) {
        pen(roughLine(L + tick, T, L, T, rng, rough));
        pen(roughLine(L, T, L, B, rng, rough));
        pen(roughLine(L, B, L + tick, B, rng, rough));
        pen(roughLine(R - tick, T, R, T, rng, rough));
        pen(roughLine(R, T, R, B, rng, rough));
        pen(roughLine(R, B, R - tick, B, rng, rough));
      }
      break;
    }
  }
  return out;
}

/**
 * Draws a rough, hand-annotated mark over its children — marker highlight,
 * underline, box, circle, strike, cross or brackets.
 *
 * Every path is generated here: a seeded RNG jitters the control points of a
 * cubic per stroke, so the line wobbles like a pen but is stable across
 * re-renders. No rough.js, no rough-notation, no canvas.
 *
 * Geometry is derived from the computed font size rather than the line box —
 * a line box carries the full leading, so on `leading-[1.8]` prose a line-box
 * underline would float well clear of the text and a line-box highlight would
 * be half again too tall.
 *
 * Multi-line safe: the text's own `getClientRects()` gives one rect per line
 * box, and each gets its own stroke set. A zero-size anchor span is measured
 * to establish the coordinate origin, which keeps the geometry correct in any
 * layout without assuming how the browser resolves an inline containing block.
 *
 * Stacking: the marker sits under the text by DOM order alone. It deliberately
 * does not use a negative z-index — `position: relative` with `z-index: auto`
 * opens no stacking context, so `z-index: -1` would drop the ink behind the
 * nearest ancestor background and disappear on any non-transparent surface.
 */
export function Highlighter({
  children,
  action = 'highlight',
  color = '#ff4d23',
  strokeWidth = 2,
  iterations = 2,
  roughness = 2,
  padding = 2,
  duration = 700,
  delay = 0,
  trigger = 'view',
  opacity,
  behind,
  blend,
  className = '',
}: HighlighterProps) {
  const hostRef = useRef<HTMLSpanElement>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [armed, setArmed] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const reduced = useReducedMotion();
  const seedId = useId();

  const isMarker = action === 'highlight';
  const ink = opacity ?? (isMarker ? 0.45 : 1);
  const under = behind ?? isMarker;
  const multiply = blend ?? isMarker;

  const measure = useCallback(() => {
    const text = textRef.current;
    const anchor = anchorRef.current;
    if (!text || !anchor) return;

    // The anchor is a 0×0 box at the same absolute origin the SVG uses, so its
    // own rect *is* the origin — no guessing at containing-block rules.
    const origin = anchor.getBoundingClientRect();
    const rects = Array.from(text.getClientRects());
    if (rects.length === 0) return;

    const size = parseFloat(getComputedStyle(text).fontSize) || 16;

    let seed = 0;
    for (let i = 0; i < seedId.length; i++) seed = (seed * 31 + seedId.charCodeAt(i)) | 0;
    const rng = mulberry32(seed + rects.length);

    const next: Stroke[] = [];
    for (const r of rects) {
      const mid = r.top - origin.top + r.height / 2;
      // Approximate cap-height / baseline from the type size, centred in the
      // line box — independent of leading.
      const band: Band = {
        left: r.left - origin.left,
        right: r.left - origin.left + r.width,
        top: mid - size * 0.4,
        bottom: mid + size * 0.36,
        mid: mid - size * 0.04,
        size,
      };
      next.push(...buildStrokes(action, band, padding, strokeWidth, iterations, roughness, rng));
    }
    setStrokes(next);
  }, [action, padding, strokeWidth, iterations, roughness, seedId]);

  useLayoutEffect(() => {
    measure();
    const host = hostRef.current;
    if (!host || typeof ResizeObserver === 'undefined') return;
    // Reflow (wrap point changes, font swap) invalidates the line rects.
    const ro = new ResizeObserver(() => measure());
    ro.observe(host);
    if (host.parentElement) ro.observe(host.parentElement);
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    fonts?.ready.then(() => measure()).catch(() => undefined);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    if (reduced || trigger === 'mount') {
      setArmed(true);
      return;
    }
    if (trigger !== 'view') return;
    const host = hostRef.current;
    if (!host) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setArmed(true);
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(host);
    return () => io.disconnect();
  }, [trigger, reduced]);

  // Two-phase commit. If arming and the first stroke set land in the same
  // React batch, the paths would mount already at offset 0 and snap into
  // existence with no draw — so let them paint undrawn for one frame first.
  useEffect(() => {
    if (!armed || strokes.length === 0 || drawn) return;
    if (reduced) {
      setDrawn(true);
      return;
    }
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setDrawn(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [armed, strokes.length, drawn, reduced]);

  const step = strokes.length ? duration / strokes.length : 0;

  return (
    <span
      ref={hostRef}
      className={`relative inline ${className}`}
      onPointerEnter={trigger === 'hover' ? () => setArmed(true) : undefined}
    >
      <span ref={anchorRef} aria-hidden className="absolute left-0 top-0 inline-block h-0 w-0" />

      <svg
        aria-hidden
        width="0"
        height="0"
        className="pointer-events-none absolute left-0 top-0 overflow-visible"
        style={{ zIndex: under ? undefined : 1, mixBlendMode: multiply ? 'multiply' : undefined }}
      >
        {strokes.map((s, i) => (
          <path
            key={i}
            d={s.d}
            fill="none"
            stroke={color}
            strokeWidth={s.width}
            strokeLinecap={s.cap}
            strokeOpacity={ink}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={drawn ? 0 : 1}
            style={
              reduced
                ? undefined
                : {
                    transition: `stroke-dashoffset ${step.toFixed(0)}ms cubic-bezier(0.4,0,0.2,1)`,
                    transitionDelay: `${(delay + i * step * 0.85).toFixed(0)}ms`,
                  }
            }
          />
        ))}
      </svg>

      <span ref={textRef} className="relative">
        {children}
      </span>
    </span>
  );
}
