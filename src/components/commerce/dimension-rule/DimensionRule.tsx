// DimensionRule — measured callouts that draw themselves onto the product
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface Dimensions {
  /** Millimetres. */
  width: number;
  height: number;
  depth?: number;
}

export interface DimensionRuleProps {
  dimensions: Dimensions;
  /** Something known-size to sit beside the product. Default a credit card. */
  reference?: { label: string; width: number; height: number } | null;
  /** Draw time in ms. Default 620. */
  duration?: number;
  className?: string;
}

const CARD = { label: 'Card', width: 85.6, height: 53.98 };

/**
 * Dimension lines draw themselves along the product silhouette on first view,
 * with end ticks and a live cm / inch readout — and, beside it, a real object
 * at true relative scale.
 *
 * Size is the single biggest driver of returns in online retail, and a spec
 * table does not fix it because nobody can picture 340mm. A drawn measurement
 * next to a credit card can be read in one glance, and the drawing itself is
 * what makes the shopper actually look at the number instead of scrolling past
 * a static caption.
 *
 * Scale is derived from the real millimetre values, so the reference object is
 * genuinely proportional rather than eyeballed. Draw-in is `pathLength`
 * normalised dashoffset — no measuring, and one transition per line.
 */
export function DimensionRule({
  dimensions,
  reference = CARD,
  duration = 620,
  className = '',
}: DimensionRuleProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');
  const reduced = useReducedMotion();

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
          // One frame undrawn first, or the lines mount already complete.
          requestAnimationFrame(() => requestAnimationFrame(() => setDrawn(true)));
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(host);
    return () => io.disconnect();
  }, [reduced]);

  const fmt = (mm: number) =>
    unit === 'cm' ? `${(mm / 10).toFixed(1)} cm` : `${(mm / 25.4).toFixed(1)} in`;

  // Fit the product into the canvas; the reference then follows at true scale.
  const VB = { w: 340, h: 240 };
  const pad = 54;
  const s = Math.min((VB.w - pad * 2.2) / dimensions.width, (VB.h - pad * 1.6) / dimensions.height);
  const pw = dimensions.width * s;
  const ph = dimensions.height * s;
  const x0 = pad;
  const y0 = (VB.h - ph) / 2;

  const line = (d: string, i: number) => (
    <path
      d={d}
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={drawn ? 0 : 1}
      style={
        reduced ? undefined : { transition: `stroke-dashoffset ${duration}ms ease-out ${i * 140}ms` }
      }
    />
  );

  return (
    <div ref={hostRef} className={`w-full max-w-lg ${className}`}>
      <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="w-full text-ink" role="img"
        aria-label={`Width ${fmt(dimensions.width)}, height ${fmt(dimensions.height)}`}>
        {/* Product silhouette */}
        <rect x={x0} y={y0} width={pw} height={ph} className="fill-ink/10 stroke-ink" strokeWidth={1} />

        {/* Width line, below */}
        {line(`M${x0},${y0 + ph + 22} L${x0 + pw},${y0 + ph + 22}`, 0)}
        {line(`M${x0},${y0 + ph + 16} L${x0},${y0 + ph + 28}`, 0)}
        {line(`M${x0 + pw},${y0 + ph + 16} L${x0 + pw},${y0 + ph + 28}`, 0)}

        {/* Height line, left */}
        {line(`M${x0 - 22},${y0} L${x0 - 22},${y0 + ph}`, 1)}
        {line(`M${x0 - 28},${y0} L${x0 - 16},${y0}`, 1)}
        {line(`M${x0 - 28},${y0 + ph} L${x0 - 16},${y0 + ph}`, 1)}

        <text
          x={x0 + pw / 2}
          y={y0 + ph + 38}
          textAnchor="middle"
          className="fill-ink font-mono"
          style={{ fontSize: 10, letterSpacing: 1, opacity: drawn ? 1 : 0, transition: 'opacity 300ms ease 520ms' }}
        >
          {fmt(dimensions.width)}
        </text>
        <text
          x={x0 - 30}
          y={y0 + ph / 2}
          textAnchor="middle"
          transform={`rotate(-90 ${x0 - 30} ${y0 + ph / 2})`}
          className="fill-ink font-mono"
          style={{ fontSize: 10, letterSpacing: 1, opacity: drawn ? 1 : 0, transition: 'opacity 300ms ease 660ms' }}
        >
          {fmt(dimensions.height)}
        </text>

        {/* Known object at true relative scale */}
        {reference && (
          <g style={{ opacity: drawn ? 1 : 0, transition: 'opacity 400ms ease 800ms' }}>
            <rect
              x={x0 + pw + 26}
              y={y0 + ph - reference.height * s}
              width={reference.width * s}
              height={reference.height * s}
              className="fill-none stroke-accent"
              strokeWidth={1}
              strokeDasharray="3 2"
            />
            <text
              x={x0 + pw + 26}
              y={y0 + ph + 14}
              className="fill-accent font-mono"
              style={{ fontSize: 9, letterSpacing: 1 }}
            >
              {reference.label.toUpperCase()}
            </text>
          </g>
        )}
      </svg>

      <button
        type="button"
        onClick={() => setUnit((u) => (u === 'cm' ? 'in' : 'cm'))}
        className="mt-2 cursor-pointer border border-ink px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-ink hover:text-bone"
      >
        Show in {unit === 'cm' ? 'inches' : 'cm'}
      </button>
    </div>
  );
}
