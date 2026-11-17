// ChronoRail — a carousel whose axis is time, not slide number
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useSizeBand, type SizeBand } from '@/lib/useSizeBand';

export interface ChronoItem {
  id: string;
  /** When this happened. Anything `new Date()` accepts. */
  at: string | number | Date;
  label: string;
  meta?: string;
  body?: string;
  media?: ReactNode;
}

export interface ChronoRailProps {
  items: ChronoItem[];
  /**
   * 0 = true time: a five-year gap is five years of empty rail and a busy month
   * shingles into a deck. 1 = even spacing, i.e. an ordinary carousel.
   */
  compression?: number;
  /** Starting item index. */
  defaultIndex?: number;
  onIndexChange?: (index: number, item: ChronoItem) => void;
  /** Draw the derived time axis with ticks under the rail. */
  axis?: boolean;
  className?: string;
}

/** Card width per size band — the only thing the band actually decides. */
const CARD_W: Record<SizeBand, number> = { compact: 208, regular: 264, wide: 320 };
const MS = { day: 864e5, month: 2629746e3, year: 31556952e3 };

const fmt = (d: Date, unit: 'year' | 'month' | 'day') =>
  unit === 'year'
    ? String(d.getFullYear())
    : unit === 'month'
      ? d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
      : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

/** "4 mo", "2 yr" — the real gap between two neighbouring events. */
function elapsed(ms: number): string {
  const a = Math.abs(ms);
  if (a >= MS.year) return (a / MS.year).toFixed(a / MS.year < 10 ? 1 : 0) + ' yr';
  if (a >= MS.month) return Math.round(a / MS.month) + ' mo';
  if (a >= MS.day) return Math.round(a / MS.day) + ' d';
  return 'same day';
}

interface Placed extends ChronoItem {
  t: number;
  x: number;
}

type Gotoable = HTMLElement & { __goto?: (i: number) => void };

/**
 * A carousel that admits its slides happened at different times.
 *
 * Every other carousel spaces slides evenly, which quietly asserts that the
 * distance between them is meaningless. For anything with a chronology — a
 * changelog, a release history, a case-study archive, a press timeline — that
 * throws away the most informative dimension in the data. Here the rail *is* a
 * time axis: an item's position is its timestamp, so a quiet year reads as an
 * empty stretch of rail and a busy quarter shingles into a visible deck.
 * `compression` dials continuously between that and ordinary even spacing, so
 * one component covers both a true timeline and a plain gallery.
 *
 * Positions are solved once per layout, written to each card as a static
 * transform, and never recomputed: dragging and snapping translate a single
 * track, so a frame costs one transform no matter how long the rail is. The
 * per-card falloff pass writes only when a rounded value actually changes and
 * skips anything off-screen, and the rAF loop stops dead the moment motion
 * settles — an idle rail costs nothing.
 *
 * Layout is driven by the component's own width rather than the viewport, so a
 * rail in a 320px sidebar behaves exactly as it does on a phone. Drag, trackpad,
 * arrow keys and Home/End all drive the same scrub. Reduced motion keeps the
 * time axis and drops the inertia — selection jumps instead of gliding.
 */
export function ChronoRail({
  items,
  compression = 0.55,
  defaultIndex = 0,
  onIndexChange,
  axis = true,
  className = '',
}: ChronoRailProps) {
  const root = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const axisTrack = useRef<HTMLDivElement>(null);
  const band = useSizeBand(root, { regular: 520, wide: 880 });
  const reduced = useReducedMotion();

  const [index, setIndex] = useState(() =>
    Math.min(Math.max(defaultIndex, 0), Math.max(items.length - 1, 0)),
  );
  const changeRef = useRef(onIndexChange);
  changeRef.current = onIndexChange;

  const cardW = CARD_W[band];

  /** Solve x for every item: lerp true-time against even spacing, then de-collide. */
  const placed = useMemo<Placed[]>(() => {
    const sorted: Placed[] = items
      .map((it) => ({ ...it, t: new Date(it.at).getTime(), x: 0 }))
      .sort((a, b) => a.t - b.t);
    const n = sorted.length;
    if (!n) return [];
    const min = sorted[0].t;
    const span = sorted[n - 1].t - min || 1;
    const length = Math.max(n - 1, 1) * (cardW + 28);
    const k = Math.min(Math.max(compression, 0), 1);

    for (let i = 0; i < n; i++) {
      const time = (sorted[i].t - min) / span;
      const even = n > 1 ? i / (n - 1) : 0;
      sorted[i].x = (time * (1 - k) + even * k) * length;
    }
    // Clumped events shingle rather than stack invisibly on top of each other.
    const minGap = cardW * 0.34;
    for (let i = 1; i < n; i++) {
      if (sorted[i].x - sorted[i - 1].x < minGap) sorted[i].x = sorted[i - 1].x + minGap;
    }
    return sorted;
  }, [items, compression, cardW]);

  /** Piecewise-linear map from a timestamp to a rail x, for the axis ticks. */
  const timeToX = useCallback(
    (t: number) => {
      const n = placed.length;
      if (!n) return 0;
      if (t <= placed[0].t) return placed[0].x;
      if (t >= placed[n - 1].t) return placed[n - 1].x;
      for (let i = 1; i < n; i++) {
        if (t <= placed[i].t) {
          const a = placed[i - 1];
          const b = placed[i];
          return a.x + (b.x - a.x) * ((t - a.t) / (b.t - a.t || 1));
        }
      }
      return placed[n - 1].x;
    },
    [placed],
  );

  /** Tick unit is chosen from the span the data actually covers. */
  const ticks = useMemo(() => {
    if (!axis || placed.length < 2) return [];
    const from = placed[0].t;
    const to = placed[placed.length - 1].t;
    const span = to - from;
    const unit: 'year' | 'month' | 'day' =
      span > MS.year * 2.5 ? 'year' : span > MS.month * 2.5 ? 'month' : 'day';

    // Step by calendar units, not by an average length — adding 365.2425 days
    // repeatedly drifts far enough over a decade to repeat and skip labels.
    const cursor = new Date(from);
    if (unit === 'year') cursor.setMonth(0, 1);
    else if (unit === 'month') cursor.setDate(1);
    cursor.setHours(0, 0, 0, 0);

    const out: { t: number; x: number; label: string }[] = [];
    while (cursor.getTime() <= to && out.length < 24) {
      const t = cursor.getTime();
      if (t >= from) out.push({ t, x: timeToX(t), label: fmt(new Date(t), unit) });
      if (unit === 'year') cursor.setFullYear(cursor.getFullYear() + 1);
      else if (unit === 'month') cursor.setMonth(cursor.getMonth() + 1);
      else cursor.setDate(cursor.getDate() + 1);
    }
    return out;
  }, [axis, placed, timeToX]);

  const indexRef = useRef(index);
  indexRef.current = index;

  // ── scrub engine ───────────────────────────────────────────────────────────
  useEffect(() => {
    const vp = viewport.current;
    const tr = track.current;
    if (!vp || !tr || !placed.length) return;

    let pos = 0;
    let target = 0;
    let vel = 0;
    let raf = 0;
    let dragging = false;
    let pointerId = -1;
    let lastX = 0;
    let lastT = 0;
    let half = vp.clientWidth / 2;
    const cache = new Float32Array(placed.length).fill(-1);

    const centerFor = (i: number) => half - placed[i].x - cardW / 2;
    const nearestTo = (p: number) => {
      const want = half - p - cardW / 2;
      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i < placed.length; i++) {
        const d = Math.abs(placed[i].x - want);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      return best;
    };

    const paint = () => {
      const t3d = 'translate3d(' + pos.toFixed(2) + 'px,0,0)';
      tr.style.transform = t3d;
      if (axisTrack.current) axisTrack.current.style.transform = t3d;
      const focus = half - pos - cardW / 2;
      for (let i = 0; i < placed.length; i++) {
        const d = placed[i].x - focus;
        // Off-screen cards get one write to zero, then are left alone.
        const near = Math.abs(d) > half + cardW ? 0 : Math.max(0, 1 - Math.abs(d) / (half || 1));
        const q = Math.round(near * 100) / 100;
        if (cache[i] !== q) {
          cache[i] = q;
          (tr.children[i] as HTMLElement).style.setProperty('--near', String(q));
        }
      }
    };

    const frame = () => {
      if (dragging) {
        paint();
        raf = requestAnimationFrame(frame);
        return;
      }
      const d = target - pos;
      pos += d * 0.18;
      if (Math.abs(d) < 0.4) {
        pos = target;
        paint();
        raf = 0;
        return;
      }
      paint();
      raf = requestAnimationFrame(frame);
    };

    // Cancel-and-request, so a frame requested while the tab was hidden cannot
    // leave a stale id behind and wedge the loop shut. Still one call per frame.
    const wake = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    };

    const settle = (i: number, instant: boolean) => {
      const clamped = Math.min(Math.max(i, 0), placed.length - 1);
      target = centerFor(clamped);
      if (clamped !== indexRef.current) {
        indexRef.current = clamped;
        setIndex(clamped);
        changeRef.current?.(clamped, placed[clamped]);
      }
      if (instant || reduced) {
        pos = target;
        paint();
      } else wake();
    };

    // ── pointer drag ─────────────────────────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      pointerId = e.pointerId;
      vel = 0;
      lastX = e.clientX;
      lastT = e.timeStamp;
      vp.setPointerCapture(pointerId);
      vp.dataset.dragging = 'true';
      wake();
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pointerId) return;
      const dx = e.clientX - lastX;
      const dt = Math.max(8, e.timeStamp - lastT);
      vel = (dx / dt) * 16; // px per frame
      lastX = e.clientX;
      lastT = e.timeStamp;
      const first = half - placed[0].x - cardW / 2;
      const last = half - placed[placed.length - 1].x - cardW / 2;
      const next = pos + dx;
      // Rubber-band past the ends instead of hard-stopping.
      pos =
        next > first
          ? first + (next - first) * 0.35
          : next < last
            ? last + (next - last) * 0.35
            : next;
    };
    const endDrag = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pointerId) return;
      dragging = false;
      delete vp.dataset.dragging;
      if (vp.hasPointerCapture(pointerId)) vp.releasePointerCapture(pointerId);
      settle(nearestTo(pos + vel * 6), false);
    };

    // ── trackpad: horizontal intent only, so the page keeps its vertical scroll
    let wheelTimer = 0;
    const onWheel = (e: WheelEvent) => {
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : 0;
      if (!dx) return;
      e.preventDefault();
      pos -= dx;
      dragging = true;
      wake();
      window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => {
        dragging = false;
        settle(nearestTo(pos), false);
      }, 90);
    };

    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, number> = {
        ArrowRight: indexRef.current + 1,
        ArrowLeft: indexRef.current - 1,
        Home: 0,
        End: placed.length - 1,
      };
      const next = map[e.key];
      if (next === undefined) return;
      e.preventDefault();
      settle(next, false);
    };

    const onResize = () => {
      half = vp.clientWidth / 2;
      settle(indexRef.current, true);
    };

    vp.addEventListener('pointerdown', onDown);
    vp.addEventListener('pointermove', onMove, { passive: true });
    vp.addEventListener('pointerup', endDrag);
    vp.addEventListener('pointercancel', endDrag);
    vp.addEventListener('wheel', onWheel, { passive: false });
    vp.addEventListener('keydown', onKey);
    const ro = new ResizeObserver(onResize);
    ro.observe(vp);

    settle(indexRef.current, true);
    (vp as Gotoable).__goto = (i: number) => settle(i, false);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(wheelTimer);
      vp.removeEventListener('pointerdown', onDown);
      vp.removeEventListener('pointermove', onMove);
      vp.removeEventListener('pointerup', endDrag);
      vp.removeEventListener('pointercancel', endDrag);
      vp.removeEventListener('wheel', onWheel);
      vp.removeEventListener('keydown', onKey);
      ro.disconnect();
      delete (vp as Gotoable).__goto;
    };
  }, [placed, cardW, reduced]);

  const goto = (i: number) => (viewport.current as Gotoable | null)?.__goto?.(i);

  const current = placed[index];
  const gap = index > 0 && current ? current.t - placed[index - 1].t : 0;

  return (
    <div ref={root} className={'relative select-none ' + className}>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-ink pb-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em]">
          {current
            ? new Date(current.t).toLocaleDateString(undefined, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : '—'}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] opacity-60">
          {index > 0 ? '+' + elapsed(gap) + ' since previous' : 'first entry'} · {index + 1}/
          {placed.length}
        </p>
      </div>

      <div
        ref={viewport}
        tabIndex={0}
        role="listbox"
        aria-label="Timeline"
        aria-orientation="horizontal"
        className="relative h-[clamp(15rem,42vh,22rem)] cursor-grab touch-pan-y overflow-hidden outline-none focus-visible:ring-1 focus-visible:ring-vermilion data-[dragging]:cursor-grabbing"
      >
        <div ref={track} className="absolute inset-y-0 left-0 will-change-transform">
          {placed.map((it, i) => (
            <article
              key={it.id}
              role="option"
              aria-selected={i === index}
              data-on={i === index}
              onClick={() => goto(i)}
              style={{
                width: cardW,
                transform:
                  'translate3d(' + it.x + 'px,0,0) scale(calc(0.88 + var(--near, 0) * 0.12))',
                opacity: 'calc(0.34 + var(--near, 0) * 0.66)',
                zIndex: i === index ? 2 : 1,
              }}
              className="absolute inset-y-3 origin-center overflow-hidden border border-ink bg-bone p-4 transition-colors duration-200 data-[on=true]:border-vermilion"
            >
              {it.media && (
                <div className="mb-3 aspect-[4/3] overflow-hidden border border-ink/20 bg-ink/5">
                  {it.media}
                </div>
              )}
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-vermilion">
                {fmt(new Date(it.t), 'day')} · {new Date(it.t).getFullYear()}
              </p>
              <h3 className="mt-2 font-display text-base font-bold uppercase leading-tight tracking-tight">
                {it.label}
              </h3>
              {it.meta && (
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] opacity-60">
                  {it.meta}
                </p>
              )}
              {it.body && band !== 'compact' && (
                <p className="mt-3 font-serif text-sm italic leading-snug opacity-80">{it.body}</p>
              )}
            </article>
          ))}
        </div>

        {/* Focus gate — the point on the axis the rail reads from. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-vermilion/35"
        />
      </div>

      {axis && ticks.length > 1 && (
        <div className="relative mt-3 h-8 overflow-hidden border-t border-ink" aria-hidden>
          <div ref={axisTrack} className="absolute inset-y-0 left-0 will-change-transform">
            {ticks.map((t) => (
              <span
                key={t.t}
                className="absolute top-0 flex h-full flex-col items-center gap-1"
                style={{ transform: 'translate3d(' + t.x + 'px,0,0)' }}
              >
                <span className="h-2 w-px bg-ink/40" />
                <span className="whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.18em] opacity-50">
                  {t.label}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
