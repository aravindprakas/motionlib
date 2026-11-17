// CostPerWear — argue the price down instead of discounting it
import { useMemo, useState } from 'react';

export interface CostPerWearProps {
  price: number;
  /** Comparison anchor, e.g. a cheaper alternative that lasts less time. */
  against?: { label: string; price: number; months: number };
  /** Expected life of the product in months. Default 60. */
  months?: number;
  format?: (n: number) => string;
  className?: string;
}

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const VB = { w: 300, h: 88 };

/**
 * A slider for how often the shopper expects to wear the thing, and a single
 * large number: what it costs each time they do. A curve behind it shows how
 * fast that number falls, with a cheaper alternative plotted for contrast.
 *
 * Premium products lose to cheaper ones at the moment of comparison because
 * price is a single legible number and durability is a paragraph. Cost-per-wear
 * converts the paragraph into the same units as the objection — and because the
 * shopper sets the usage themselves, the conclusion is one they computed rather
 * than one they were sold.
 *
 * The number is derived on each render and never tweened. An animated count-up
 * here would be actively dishonest: the figure has to be verifiable against the
 * slider at every instant, not eventually.
 */
export function CostPerWear({
  price,
  against,
  months = 60,
  format = inr,
  className = '',
}: CostPerWearProps) {
  const [perMonth, setPerMonth] = useState(6);

  const cpw = price / Math.max(1, perMonth * months);
  const rivalCpw = against ? against.price / Math.max(1, perMonth * against.months) : null;

  // Decay curve across the slider's own range, so the marker rides the line.
  const path = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 30; i++) {
      const w = 1 + (i / 30) * 29;
      const v = price / (w * months);
      const x = (i / 30) * VB.w;
      const y = VB.h - 6 - Math.min(1, v / (price / months)) * (VB.h - 18);
      pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(' ');
  }, [price, months]);

  const t = (perMonth - 1) / 29;
  const markX = t * VB.w;
  const markY = VB.h - 6 - Math.min(1, cpw / (price / months)) * (VB.h - 18);

  return (
    <div className={`w-full max-w-sm ${className}`}>
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink/55">
          Cost per wear
        </p>
        <p className="font-mono text-[11px] text-ink/45">{format(price)} · {months / 12} yr life</p>
      </div>

      <p className="mt-1 font-display text-5xl tabular-nums">{format(cpw)}</p>

      <svg viewBox={`0 0 ${VB.w} ${VB.h}`} preserveAspectRatio="none" className="mt-3 h-20 w-full" aria-hidden>
        <path d={path} fill="none" className="stroke-ink" strokeWidth={1.25} vectorEffect="non-scaling-stroke" />
        {rivalCpw !== null && (
          <line
            x1={0}
            x2={VB.w}
            y1={VB.h - 6 - Math.min(1, rivalCpw / (price / months)) * (VB.h - 18)}
            y2={VB.h - 6 - Math.min(1, rivalCpw / (price / months)) * (VB.h - 18)}
            className="stroke-accent"
            strokeWidth={1}
            strokeDasharray="4 3"
            vectorEffect="non-scaling-stroke"
          />
        )}
        <circle cx={markX} cy={markY} r={3.5} className="fill-accent" />
      </svg>

      <input
        type="range"
        min={1}
        max={30}
        value={perMonth}
        aria-label="Times worn per month"
        onChange={(e) => setPerMonth(Number(e.target.value))}
        className="mt-2 w-full accent-[#ff4d23]"
      />
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink/55">
        worn {perMonth}× a month
      </p>

      {against && rivalCpw !== null && (
        <p className="mt-4 border-t border-ink/15 pt-3 font-mono text-[11px] leading-relaxed">
          {against.label} costs {format(rivalCpw)} per wear over {against.months / 12} years —{' '}
          <span className="text-accent">
            {rivalCpw > cpw ? `${format(rivalCpw - cpw)} more` : `${format(cpw - rivalCpw)} less`}
          </span>{' '}
          each time you wear it.
        </p>
      )}
    </div>
  );
}
