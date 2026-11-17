// StockErosion — scarcity told by a rule that frays, not a countdown that shouts
import { useMemo } from 'react';

export interface StockErosionProps {
  /** Units left. */
  stock: number;
  /** Units at which the rule is still solid. Default 12. */
  full?: number;
  /** Show the raw count once it is low enough to matter. Default true. */
  showCount?: boolean;
  className?: string;
}

/**
 * Availability drawn as a single hairline. At healthy stock it is solid; as
 * units fall the dash pattern opens up and the line starts to fray and thin,
 * until at the last unit it is barely holding together.
 *
 * Deliberately not a countdown timer or a red "ONLY 2 LEFT!" badge. Those read
 * as pressure tactics and shoppers have learned to discount them; a material
 * that is visibly wearing out communicates the same scarcity as a property of
 * the product rather than a threat from the retailer. It also degrades
 * honestly — at full stock it says nothing at all.
 *
 * The whole thing is one SVG path plus a `stroke-dasharray` transition. No
 * loop, no timer, nothing running when it is not changing.
 */
export function StockErosion({
  stock,
  full = 12,
  showCount = true,
  className = '',
}: StockErosionProps) {
  const t = Math.max(0, Math.min(1, stock / full)); // 1 healthy → 0 gone

  const { label, tone } = useMemo(() => {
    if (stock <= 0) return { label: 'Sold out', tone: 'text-ink/40' };
    if (stock === 1) return { label: 'Last one', tone: 'text-accent' };
    if (t < 0.34) return { label: 'Low stock', tone: 'text-accent' };
    return { label: 'In stock', tone: 'text-ink/60' };
  }, [stock, t]);

  // Gaps open as stock falls; the stroke thins with them.
  const dash = stock <= 0 ? '1 7' : `${(2 + t * 46).toFixed(1)} ${((1 - t) * 7 + 0.4).toFixed(1)}`;
  const width = stock <= 0 ? 0.6 : 0.6 + t * 1.0;

  // A jittered baseline — flat when healthy, visibly worn when nearly gone.
  const d = useMemo(() => {
    const wear = (1 - t) * 2.2;
    let p = 'M0,6';
    for (let i = 1; i <= 24; i++) {
      const x = (i / 24) * 300;
      const y = 6 + Math.sin(i * 1.7) * wear * (i % 3 === 0 ? 1 : 0.45);
      p += ` L${x.toFixed(1)},${y.toFixed(2)}`;
    }
    return p;
  }, [t]);

  return (
    <div className={`w-full max-w-sm ${className}`}>
      <div className="flex items-baseline justify-between">
        <p className={`font-mono text-[11px] uppercase tracking-[0.22em] ${tone}`}>{label}</p>
        {showCount && stock > 0 && t < 0.34 && (
          <p className="font-mono text-[11px] text-ink/45">{stock} left</p>
        )}
      </div>
      <svg
        viewBox="0 0 300 12"
        preserveAspectRatio="none"
        className="mt-2 h-3 w-full"
        aria-hidden
      >
        <path
          d={d}
          fill="none"
          stroke="currentColor"
          className={stock <= 0 ? 'text-ink/25' : t < 0.34 ? 'text-accent' : 'text-ink'}
          strokeWidth={width}
          strokeDasharray={dash}
          strokeLinecap="butt"
          style={{ transition: 'stroke-dasharray 500ms ease, stroke-width 500ms ease' }}
        />
      </svg>
    </div>
  );
}
