// ConsensusRating — the score, the spread, and where the average has been drifting
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useCoarsePointer, useSizeBand } from '@/lib/useSizeBand';

export interface ConsensusPoint {
  at: string | number | Date;
  avg: number;
}

export interface ConsensusRatingProps {
  /** Vote counts, lowest bucket first. Length sets the scale (5 → five marks). */
  distribution: number[];
  /** Where the average has been over time. Newest last. */
  history?: ConsensusPoint[];
  value?: number | null;
  defaultValue?: number | null;
  /** Snap increment. 1 = whole marks, 0.5 = halves, 0.1 = near-continuous. */
  step?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  /** Hide the drift trace even when history is supplied. */
  drift?: boolean;
  className?: string;
}

const STAR =
  'M12 2.4 14.9 8.6 21.6 9.5 16.8 14.2 18 20.9 12 17.7 6 20.9 7.2 14.2 2.4 9.5 9.1 8.6Z';

/**
 * A rating that stops pretending the average is the whole story.
 *
 * Every product page shows the same three things in three separate widgets: the
 * stars you can click, a bar chart of how everyone voted, and — if you are
 * lucky — a note about the trend. They occupy the same axis and are never drawn
 * on it. This puts all three in one control, because 4.2 built from a wall of
 * fives and a handful of ones is a different product from 4.2 where everyone
 * agreed, and an average climbing for six months is a different product from
 * one falling.
 *
 * The horizontal axis is the score, once, and everything is registered to it:
 * the distribution stands as columns beneath the marks, the community average
 * is a line through them, and the drift trace above plots that average against
 * time — newest at the bottom — so a wandering line reads as a product that
 * changed. Casting your own vote is not a separate act: the bucket you land on
 * grows, the average line moves, and you can see exactly how much one vote is
 * worth against the crowd.
 *
 * Dragging writes a single CSS custom property. Mark fills, the readout, the
 * hover line and the hit state are all derived from it in CSS — React is not
 * told anything until you commit, so a scrub across the rail costs zero
 * renders. Marks are sized from the component's own width and grow on coarse
 * pointers, so the same control is comfortable in a sidebar and under a thumb.
 * It is a real `role="slider"`: arrows step, Home/End jump, Page keys move a
 * whole mark. Reduced motion drops the settle animation, not the information.
 */
export function ConsensusRating({
  distribution,
  history = [],
  value,
  defaultValue = null,
  step = 0.5,
  onChange,
  readOnly = false,
  drift = true,
  className = '',
}: ConsensusRatingProps) {
  const root = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const band = useSizeBand(root, { regular: 380, wide: 620 });
  const coarse = useCoarsePointer();
  const reduced = useReducedMotion();

  const max = distribution.length;
  const controlled = value !== undefined;
  const [inner, setInner] = useState<number | null>(defaultValue);
  const mine = controlled ? value : inner;

  const changeRef = useRef(onChange);
  changeRef.current = onChange;

  /** Community numbers, plus your vote once you have cast one. */
  const stats = useMemo(() => {
    const counts = distribution.slice();
    if (mine != null) {
      const bucket = Math.min(max - 1, Math.max(0, Math.round(mine) - 1));
      counts[bucket] += 1;
    }
    const total = counts.reduce((a, b) => a + b, 0) || 1;
    const sum = counts.reduce((a, c, i) => a + c * (i + 1), 0);
    const peak = Math.max(...counts, 1);
    return { counts, total, avg: sum / total, peak };
  }, [distribution, mine, max]);

  /** The average without your vote — so the delta you caused is showable. */
  const baseAvg = useMemo(() => {
    const total = distribution.reduce((a, b) => a + b, 0) || 1;
    return distribution.reduce((a, c, i) => a + c * (i + 1), 0) / total;
  }, [distribution]);

  /** Drift trace: x is the score, y is time. Newest at the bottom. */
  const trace = useMemo(() => {
    if (!drift || history.length < 2) return null;
    const pts = history
      .map((p) => ({ t: new Date(p.at).getTime(), avg: p.avg }))
      .sort((a, b) => a.t - b.t);
    const t0 = pts[0].t;
    const span = pts[pts.length - 1].t - t0 || 1;
    const d = pts
      .map((p, i) => {
        const x = ((p.avg - 0.5) / max) * 100;
        const y = ((p.t - t0) / span) * 100;
        return (i ? 'L' : 'M') + x.toFixed(2) + ' ' + y.toFixed(2);
      })
      .join(' ');
    return {
      d,
      from: new Date(pts[0].t).toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
      to: new Date(pts[pts.length - 1].t).toLocaleDateString(undefined, {
        month: 'short',
        year: '2-digit',
      }),
      delta: pts[pts.length - 1].avg - pts[0].avg,
    };
  }, [drift, history, max]);

  const snap = useCallback(
    (raw: number) => {
      const clamped = Math.min(Math.max(raw, step), max);
      return Math.round(clamped / step) * step;
    },
    [step, max],
  );

  const commit = useCallback(
    (v: number) => {
      const next = snap(v);
      if (!controlled) setInner(next);
      changeRef.current?.(next);
    },
    [controlled, snap],
  );

  // ── scrub: one CSS var, no renders until release ───────────────────────────
  useEffect(() => {
    const el = rail.current;
    const box = root.current;
    if (!el || !box || readOnly) return;

    let dragging = false;
    let pointerId = -1;
    let pending = mine ?? 0;

    const valueAt = (clientX: number) => {
      const r = el.getBoundingClientRect();
      return snap(((clientX - r.left) / (r.width || 1)) * max);
    };
    const preview = (v: number) => {
      pending = v;
      box.style.setProperty('--v', String(v));
      box.style.setProperty('--live', '1');
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      pointerId = e.pointerId;
      el.setPointerCapture(pointerId);
      preview(valueAt(e.clientX));
    };
    const onMove = (e: PointerEvent) => {
      if (dragging && e.pointerId === pointerId) preview(valueAt(e.clientX));
      else if (!dragging && e.pointerType === 'mouse') {
        box.style.setProperty('--hover', String(valueAt(e.clientX)));
      }
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pointerId) return;
      dragging = false;
      if (el.hasPointerCapture(pointerId)) el.releasePointerCapture(pointerId);
      box.style.removeProperty('--live');
      commit(pending);
    };
    const onLeave = () => box.style.removeProperty('--hover');

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [readOnly, snap, commit, max, mine]);

  const onKey = (e: React.KeyboardEvent) => {
    if (readOnly) return;
    const at = mine ?? Math.round(stats.avg);
    const moves: Record<string, number> = {
      ArrowRight: at + step,
      ArrowUp: at + step,
      ArrowLeft: at - step,
      ArrowDown: at - step,
      PageUp: at + 1,
      PageDown: at - 1,
      Home: step,
      End: max,
    };
    const next = moves[e.key];
    if (next === undefined) return;
    e.preventDefault();
    commit(next);
  };

  const markSize = coarse ? 34 : band === 'compact' ? 24 : band === 'regular' ? 30 : 36;
  const shown = mine ?? 0;

  return (
    <div
      ref={root}
      className={'select-none ' + className}
      style={{ ['--v' as string]: String(shown), ['--avg' as string]: String(stats.avg) }}
    >
      {/* ── drift: the average against time, on the same score axis ─────────── */}
      {trace && band !== 'compact' && (
        <div className="relative mb-1 h-16 border-x border-t border-ink/15">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            aria-hidden
          >
            <path
              d={trace.d}
              fill="none"
              stroke="currentColor"
              strokeWidth={0.9}
              vectorEffect="non-scaling-stroke"
              className="text-ink/45"
            />
          </svg>
          <span className="absolute left-1 top-1 font-mono text-[9px] uppercase tracking-[0.18em] opacity-45">
            {trace.from}
          </span>
          <span className="absolute bottom-1 left-1 font-mono text-[9px] uppercase tracking-[0.18em] opacity-45">
            {trace.to}
          </span>
          <span
            className={
              'absolute right-1 top-1 font-mono text-[9px] uppercase tracking-[0.18em] ' +
              (trace.delta >= 0 ? 'text-vermilion' : 'opacity-60')
            }
          >
            {(trace.delta >= 0 ? '+' : '') + trace.delta.toFixed(2)} over {history.length} months
          </span>
        </div>
      )}

      {/* ── distribution: columns standing under the marks they belong to ───── */}
      {/* Columns stretch to the full row height, so their percentage heights
          have something to resolve against. */}
      <div className="relative flex h-14 items-stretch border-x border-ink/15" aria-hidden>
        {stats.counts.map((c, i) => (
          <div key={i} className="flex flex-1 items-end justify-center px-px">
            <span
              className="w-full bg-ink/15 transition-[height] duration-300"
              style={{
                height: Math.max(2, (c / stats.peak) * 100) + '%',
                transitionDuration: reduced ? '0ms' : undefined,
                backgroundColor:
                  mine != null && Math.round(mine) === i + 1
                    ? 'color-mix(in srgb, var(--color-vermilion, #ff4d23) 45%, transparent)'
                    : undefined,
              }}
            />
          </div>
        ))}
        {/* Community average, drawn through the columns. */}
        <span
          className="pointer-events-none absolute inset-y-0 w-px bg-ink transition-[left] duration-300"
          style={{
            left: 'calc((var(--avg) - 0.5) / ' + max + ' * 100%)',
            transitionDuration: reduced ? '0ms' : undefined,
          }}
        />
      </div>

      {/* ── the control ─────────────────────────────────────────────────────── */}
      <div
        ref={rail}
        role="slider"
        tabIndex={readOnly ? -1 : 0}
        aria-label="Your rating"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={mine ?? undefined}
        aria-valuetext={mine != null ? mine + ' of ' + max : 'not rated'}
        aria-readonly={readOnly || undefined}
        onKeyDown={onKey}
        className={
          'relative flex touch-none items-center border-x border-b border-ink/15 outline-none focus-visible:ring-1 focus-visible:ring-vermilion ' +
          (readOnly ? '' : 'cursor-pointer')
        }
        style={{ height: markSize + 14 }}
      >
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className="relative flex flex-1 items-center justify-center">
            <svg
              width={markSize}
              height={markSize}
              viewBox="0 0 24 24"
              className="text-ink/25"
              aria-hidden
            >
              <path d={STAR} fill="none" stroke="currentColor" strokeWidth={1.2} />
            </svg>
            {/* Fractional fill, derived from --v entirely in CSS. */}
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 overflow-hidden text-vermilion"
              style={{
                width: 'calc(clamp(0, var(--v) - ' + i + ', 1) * ' + markSize + 'px)',
                height: markSize,
                transform: 'translate(' + -markSize / 2 + 'px,' + -markSize / 2 + 'px)',
              }}
            >
              <svg width={markSize} height={markSize} viewBox="0 0 24 24">
                <path d={STAR} fill="currentColor" />
              </svg>
            </span>
          </span>
        ))}

        {/* Where the pointer would land, before you commit to it. */}
        {!readOnly && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-1 w-px bg-vermilion/50 opacity-0"
            style={{
              left: 'calc(var(--hover, 0) / ' + max + ' * 100%)',
              opacity: 'min(var(--hover, 0), 1)',
            }}
          />
        )}
      </div>

      {/* ── readout ─────────────────────────────────────────────────────────── */}
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.2em]">
        <span>
          <span className="text-base tracking-tight">{stats.avg.toFixed(2)}</span>
          <span className="ml-2 opacity-55">{stats.total.toLocaleString()} ratings</span>
        </span>
        <span className={mine == null ? 'opacity-55' : 'text-vermilion'}>
          {mine == null
            ? 'drag the rail to rate'
            : 'you: ' +
              mine +
              ' · moved the average ' +
              (stats.avg - baseAvg >= 0 ? '+' : '') +
              (stats.avg - baseAvg).toFixed(3)}
        </span>
      </div>
    </div>
  );
}
