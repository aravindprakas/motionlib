// ThreadPath — one continuous thread running through the steps, slack ahead of the needle
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useSizeBand } from '@/lib/useSizeBand';
import { MOTION, DUR } from '@/lib/embroidery';

export interface ThreadStep {
  id: string;
  label: string;
  /** Optional second line — a date, a status, a duration. */
  note?: string;
}

export interface ThreadPathProps {
  steps: ThreadStep[];
  /** Controlled selection. Falls back to internal state when omitted. */
  activeId?: string;
  onChange?: (id: string) => void;
  /** How far the un-run thread bows. 0 draws a taut line the whole way. */
  slack?: number;
  /** Accessible name for the step list. */
  label?: string;
  className?: string;
}

interface Geometry {
  w: number;
  h: number;
  d: string;
  /** Fraction along the path of each node, 0..1. */
  stops: number[];
}

/**
 * A stepper where the connector is one continuous thread rather than a row of
 * separate rules — taut behind the needle, slack ahead of it.
 *
 * Segmented progress bars leak a quiet lie: they draw the future as
 * already-built track. Thread has a real property that fixes this for free —
 * it hangs until it is pulled. Work that has been done is under tension and
 * straight; work that has not is loose. So the shape of the connector, not just
 * its colour, tells you where you are, which survives being seen at a glance,
 * in monochrome, or by someone who cannot separate the two accent colours.
 *
 * Geometry is measured from the real DOM once per resize, so the same component
 * lays the thread horizontally through five nodes on a desktop and vertically
 * down four on a phone without either layout being a special case. The needle
 * travels by `offset-path`; the run thread is drawn with `pathLength=100`, so
 * progress is a plain percentage regardless of how long the path physically is.
 * Between resizes there is no JavaScript at all — advancing a step changes two
 * custom properties and CSS does the rest.
 */
export function ThreadPath({
  steps,
  activeId,
  onChange,
  slack = 0.17,
  label = 'Order progress',
  className = '',
}: ThreadPathProps) {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const band = useSizeBand(wrapRef, { regular: 620, wide: 980 });
  const vertical = band === 'compact';

  const [internal, setInternal] = useState(steps[0]?.id);
  const current = activeId ?? internal;
  const index = Math.max(0, steps.findIndex((s) => s.id === current));
  const [geom, setGeom] = useState<Geometry | null>(null);

  const select = useCallback(
    (id: string) => {
      if (activeId === undefined) setInternal(id);
      onChange?.(id);
    },
    [activeId, onChange],
  );

  /**
   * Measure node centres and lay a thread through them. Runs on resize and on
   * step change only — never per frame.
   */
  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    const list = listRef.current;
    if (!wrap || !list) return;
    const base = wrap.getBoundingClientRect();
    const marks = Array.from(list.querySelectorAll<HTMLElement>('[data-node]'));
    if (marks.length < 2) return;

    const pts = marks.map((m) => {
      const r = m.getBoundingClientRect();
      return { x: r.left - base.left + r.width / 2, y: r.top - base.top + r.height / 2 };
    });

    // Straight-line distances: the run portion has ~no sag, so this is exact
    // where accuracy matters and imperceptibly short where it does not.
    const segs: number[] = [];
    let len = 0;
    for (let i = 1; i < pts.length; i++) {
      const d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
      segs.push(d);
      len += d;
    }

    let acc = 0;
    const stops = [0, ...segs.map((s) => (acc += s) / (len || 1))];

    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      // Thread that has already been run is pulled straight; thread ahead of
      // the needle sags under its own weight, perpendicular to the run.
      const bow = i - 1 >= index ? slack : 0.012;
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const sag = segs[i - 1] * bow;
      const cx = vertical ? mx + sag : mx;
      const cy = vertical ? my : my + sag;
      d += ` Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
    }

    setGeom({ w: base.width, h: base.height, d, stops });
  }, [index, slack, vertical]);

  useLayoutEffect(measure, [measure, steps.length, band]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [measure]);

  const progress = geom ? geom.stops[index] ?? 0 : 0;
  const move = reduced ? '0ms' : `${DUR.scene}ms`;

  const onKeyDown = (e: ReactKeyboardEvent<HTMLOListElement>) => {
    const next = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!next) return;
    e.preventDefault();
    const target = steps[Math.min(steps.length - 1, Math.max(0, index + next))];
    if (!target) return;
    select(target.id);
    listRef.current?.querySelectorAll<HTMLButtonElement>('[data-node]')[steps.indexOf(target)]?.focus();
  };

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      {geom && (
        <svg
          aria-hidden
          width={geom.w}
          height={geom.h}
          viewBox={`0 0 ${geom.w} ${geom.h}`}
          className="pointer-events-none absolute inset-0"
        >
          {/* The whole thread, unrun. */}
          <path
            d={geom.d}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-ink/25"
            strokeDasharray="4 3"
            style={{ transition: reduced ? 'none' : `d ${move} ${MOTION.fabric}` }}
          />
          {/* The run thread, pulled taut behind the needle. */}
          <path
            d={geom.d}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={100}
            strokeDashoffset={100 - progress * 100}
            className="text-accent"
            style={{ transition: reduced ? 'none' : `stroke-dashoffset ${move} ${MOTION.thread}` }}
          />
        </svg>
      )}

      {geom && (
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 block h-3 w-px bg-ink"
          style={{
            offsetPath: `path('${geom.d}')`,
            offsetDistance: `${progress * 100}%`,
            offsetRotate: '0deg',
            transition: reduced ? 'none' : `offset-distance ${move} ${MOTION.thread}`,
          }}
        />
      )}

      <ol
        ref={listRef}
        onKeyDown={onKeyDown}
        aria-label={label}
        className={`relative m-0 flex list-none p-0 ${
          vertical ? 'flex-col gap-8 pl-2' : 'flex-row justify-between gap-4'
        }`}
      >
        {steps.map((step, i) => {
          const state = i < index ? 'done' : i === index ? 'current' : 'todo';
          return (
            <li
              key={step.id}
              className={vertical ? 'flex items-center gap-4' : 'flex flex-1 flex-col items-center gap-3 text-center'}
            >
              <button
                type="button"
                data-node
                data-state={state}
                onClick={() => select(step.id)}
                aria-current={state === 'current' ? 'step' : undefined}
                className={`grid h-11 w-11 shrink-0 place-items-center border font-mono text-[11px] tabular-nums transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  state === 'todo'
                    ? 'border-ink/30 bg-bone text-ink/45'
                    : state === 'current'
                      ? 'border-ink bg-accent text-bone'
                      : 'border-ink bg-ink text-bone'
                }`}
                style={{ transitionDuration: reduced ? '0ms' : `${DUR.std}ms` }}
              >
                {String(i + 1).padStart(2, '0')}
                <span className="sr-only">
                  {' '}
                  — {step.label}
                  {state === 'done' ? ' (complete)' : ''}
                </span>
              </button>
              <span className={vertical ? 'min-w-0' : 'min-w-0 max-w-[14ch]'}>
                <span
                  className={`block font-mono text-[10px] uppercase leading-tight tracking-[0.16em] ${
                    state === 'todo' ? 'text-ink/45' : 'text-ink'
                  }`}
                >
                  {step.label}
                </span>
                {step.note && (
                  <span className="mt-1 block font-mono text-[10px] tabular-nums text-ink/45">
                    {step.note}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
