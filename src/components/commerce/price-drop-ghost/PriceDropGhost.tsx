// PriceDropGhost — the old price leaves the frame instead of vanishing
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface PriceDropGhostProps {
  /** Current price in minor-unit-free rupees. */
  price: number;
  /** Formats currency. Default Indian rupee, no decimals. */
  format?: (n: number) => string;
  /** Label shown beside a reduced price, e.g. 'Code AW26'. */
  reason?: string;
  className?: string;
}

interface Ghost {
  id: number;
  value: number;
  up: boolean;
}

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

/**
 * When the price changes, the previous figure detaches, drifts a few pixels and
 * fades out while the new one settles up into its place. The old number is
 * struck through on the way out if the price fell.
 *
 * Prices on a PDP change constantly — variant, size, quantity, coupon — and a
 * number that silently rewrites itself is the single easiest way to make a
 * shopper distrust a checkout. Letting the old value physically leave makes the
 * change legible and, more importantly, attributable: something you did caused
 * this.
 *
 * The ghost is a throwaway absolutely-positioned node keyed by an incrementing
 * id, so rapid changes stack and clear independently instead of fighting over a
 * single animating element. Nothing is measured and nothing loops — one
 * transform and one opacity, then the node is dropped.
 */
export function PriceDropGhost({
  price,
  format = inr,
  reason,
  className = '',
}: PriceDropGhostProps) {
  const prev = useRef(price);
  const seq = useRef(0);
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  const [settling, setSettling] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (price === prev.current) return;
    const from = prev.current;
    prev.current = price;
    if (reduced) return;

    const id = ++seq.current;
    setGhosts((g) => [...g, { id, value: from, up: price > from }]);
    setSettling(true);

    const drop = window.setTimeout(() => setGhosts((g) => g.filter((x) => x.id !== id)), 620);
    const land = window.setTimeout(() => setSettling(false), 40);
    return () => {
      window.clearTimeout(drop);
      window.clearTimeout(land);
    };
  }, [price, reduced]);

  const fell = ghosts.length > 0 && !ghosts[ghosts.length - 1].up;

  return (
    <div className={`relative inline-flex items-baseline gap-3 ${className}`}>
      <span
        className="relative font-display text-4xl tabular-nums"
        style={{
          transform: settling && !reduced ? 'translateY(3px)' : 'translateY(0)',
          opacity: settling && !reduced ? 0.35 : 1,
          transition: 'transform 340ms cubic-bezier(0.22,1,0.36,1), opacity 340ms ease-out',
        }}
      >
        {format(price)}
      </span>

      {reason && fell && (
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">{reason}</span>
      )}

      {/* Departing values — absolutely placed so they never affect layout. */}
      {ghosts.map((g) => (
        <span
          key={g.id}
          aria-hidden
          ref={(el) => {
            if (!el) return;
            requestAnimationFrame(() => {
              el.style.transform = `translate(-6px, ${g.up ? 10 : -14}px)`;
              el.style.opacity = '0';
            });
          }}
          className={`pointer-events-none absolute left-0 top-0 whitespace-nowrap font-display text-4xl tabular-nums text-ink/45 ${
            g.up ? '' : 'line-through decoration-accent decoration-1'
          }`}
          style={{
            transform: 'translate(0, 0)',
            opacity: 1,
            transition: 'transform 560ms cubic-bezier(0.22,1,0.36,1), opacity 560ms ease-out',
          }}
        >
          {format(g.value)}
        </span>
      ))}
    </div>
  );
}
