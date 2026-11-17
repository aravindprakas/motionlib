// PriceHistorySpark — proof that the discount is real
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface PricePoint {
  /** ISO date. */
  date: string;
  price: number;
}

export interface PriceHistorySparkProps {
  history: PricePoint[];
  format?: (n: number) => string;
  /** Draw time in ms. Default 700. */
  duration?: number;
  className?: string;
}

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const VB = { w: 320, h: 72 };

/**
 * The last 90 days of this product's price, drawn as a sparkline with the
 * current point marked and the period low called out. Scrub it and the exact
 * price on any day is readable.
 *
 * This is the antidote to the inflated-RRP strikethrough. A retailer who
 * publishes the actual price history is making a claim that can be checked,
 * and the shopper who checks it and finds the discount genuine is far more
 * likely to buy than one shown a bigger fake saving. It is also increasingly
 * the regulatory direction of travel in several markets.
 *
 * The line draws once on entry via `pathLength`-normalised dashoffset, then
 * nothing animates again — scrubbing moves a marker, and the readout is
 * derived, not tweened. Deriving beats animating whenever the number has to be
 * exactly right.
 */
export function PriceHistorySpark({
  history,
  format = inr,
  duration = 700,
  className = '',
}: PriceHistorySparkProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [drawn, setDrawn] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const reduced = useReducedMotion();

  const { d, pts, min, max, current, low } = useMemo(() => {
    const prices = history.map((h) => h.price);
    const lo = Math.min(...prices);
    const hi = Math.max(...prices);
    const span = hi - lo || 1;
    const p = history.map((h, i) => {
      const x = (i / Math.max(1, history.length - 1)) * VB.w;
      const y = VB.h - 8 - ((h.price - lo) / span) * (VB.h - 20);
      return [x, y] as [number, number];
    });
    return {
      d: p.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' '),
      pts: p,
      min: lo,
      max: hi,
      current: history[history.length - 1],
      low: prices[prices.length - 1] <= lo,
    };
  }, [history]);

  useEffect(() => {
    if (reduced) {
      setDrawn(true);
      return;
    }
    const host = hostRef.current;
    if (!host) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          requestAnimationFrame(() => requestAnimationFrame(() => setDrawn(true)));
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(host);
    return () => io.disconnect();
  }, [reduced]);

  const scrub = (e: ReactPointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const t = (e.clientX - r.left) / r.width;
    setHover(Math.max(0, Math.min(history.length - 1, Math.round(t * (history.length - 1)))));
  };

  const shown = hover === null ? history.length - 1 : hover;
  const point = history[shown];

  return (
    <div ref={hostRef} className={`w-full max-w-sm ${className}`}>
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink/55">
          90-day price
        </p>
        <p className="font-mono text-[11px] tabular-nums">
          {format(point.price)}
          <span className="ml-2 text-ink/45">
            {new Date(point.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        </p>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        preserveAspectRatio="none"
        className="mt-2 h-20 w-full touch-none"
        onPointerMove={scrub}
        onPointerLeave={() => setHover(null)}
      >
        {/* Period low, as a reference rule. */}
        <line
          x1={0}
          x2={VB.w}
          y1={VB.h - 8}
          y2={VB.h - 8}
          className="stroke-ink/15"
          strokeWidth={1}
        />
        <path
          d={d}
          fill="none"
          className="stroke-ink"
          strokeWidth={1.25}
          vectorEffect="non-scaling-stroke"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={drawn ? 0 : 1}
          style={reduced ? undefined : { transition: `stroke-dashoffset ${duration}ms ease-out` }}
        />
        {drawn && (
          <>
            <line
              x1={pts[shown][0]}
              x2={pts[shown][0]}
              y1={0}
              y2={VB.h}
              className="stroke-accent/40"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
            <circle cx={pts[shown][0]} cy={pts[shown][1]} r={3} className="fill-accent" />
          </>
        )}
      </svg>

      <div className="mt-1 flex items-baseline justify-between font-mono text-[10px] text-ink/45">
        <span>low {format(min)}</span>
        {low && <span className="text-accent">lowest in 90 days</span>}
        <span>high {format(max)}</span>
      </div>
      <p className="sr-only">
        Current price {format(current.price)}. Ninety-day low {format(min)}, high {format(max)}.
      </p>
    </div>
  );
}
