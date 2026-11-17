// ThresholdRule — free-shipping progress as one hairline
import { useEffect, useRef, useState } from 'react';

export interface ThresholdRuleProps {
  /** Current cart subtotal. */
  subtotal: number;
  /** Value at which shipping becomes free. */
  threshold: number;
  /** Formats currency. Default Indian rupee, no decimals. */
  format?: (n: number) => string;
  className?: string;
}

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

/**
 * The gap to free shipping, drawn as a single rule that fills. On crossing, the
 * fill completes, a tick draws once, and the label changes tense — from what is
 * still owed to what has been earned.
 *
 * The restraint is the design. A cart is where doubt peaks, so this states the
 * shortfall in currency the shopper can act on and then gets out of the way; it
 * never animates while merely sitting there, which is what makes the one moment
 * it does animate mean something.
 *
 * The crossing is edge-detected against the previous value, so the tick fires
 * on the transition rather than on every render where the total happens to be
 * above the line.
 */
export function ThresholdRule({
  subtotal,
  threshold,
  format = inr,
  className = '',
}: ThresholdRuleProps) {
  const pct = Math.max(0, Math.min(1, subtotal / threshold));
  const met = subtotal >= threshold;
  const wasMet = useRef(met);
  const [justCrossed, setJustCrossed] = useState(false);

  useEffect(() => {
    if (met && !wasMet.current) {
      setJustCrossed(true);
      const id = window.setTimeout(() => setJustCrossed(false), 900);
      wasMet.current = met;
      return () => window.clearTimeout(id);
    }
    wasMet.current = met;
  }, [met]);

  return (
    <div className={`w-full max-w-md ${className}`} role="status" aria-live="polite">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em]">
          {met ? 'Shipping is on us' : `${format(threshold - subtotal)} to free shipping`}
        </p>
        <p className="font-mono text-[11px] text-ink/45">{format(subtotal)}</p>
      </div>

      <div className="relative mt-3 h-px w-full bg-ink/20">
        <div
          className={met ? 'absolute inset-y-0 left-0 bg-accent' : 'absolute inset-y-0 left-0 bg-ink'}
          style={{
            width: `${pct * 100}%`,
            transition: 'width 420ms cubic-bezier(0.65,0,0.35,1), background-color 200ms linear',
          }}
        />
        {/* The threshold mark itself, and the tick that lands on it. */}
        <span aria-hidden className="absolute -top-1 right-0 h-[9px] w-px bg-ink/40" />
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          className="absolute -top-[7px] right-0 h-4 w-4 translate-x-1/2 overflow-visible"
        >
          <path
            d="M3 8.5 L6.5 12 L13 4.5"
            fill="none"
            stroke="currentColor"
            className="text-accent"
            strokeWidth="2"
            strokeLinecap="square"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={met ? 0 : 1}
            style={{ transition: `stroke-dashoffset ${justCrossed ? 380 : 0}ms ease-out 120ms` }}
          />
        </svg>
      </div>
    </div>
  );
}
