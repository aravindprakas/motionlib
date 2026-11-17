// QuantityResist — the stock ceiling is felt before it is read
import { useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface QuantityResistProps {
  /** Units actually available. */
  stock: number;
  value?: number;
  onChange?: (n: number) => void;
  min?: number;
  className?: string;
}

/**
 * A quantity stepper that refuses past available stock by rubber-banding — the
 * field kicks against the press and settles back, and only then does the reason
 * appear underneath.
 *
 * A disabled `+` tells the shopper nothing; they press it, nothing happens, and
 * they assume the page is broken. Resistance is legible in a way absence is
 * not: the control visibly tried and could not, which reads as a limit rather
 * than a fault, and the explanation lands on a shopper already asking for it.
 *
 * The kick is the Web Animations API, not a CSS class toggle — `element.animate`
 * runs off the main thread, can be re-fired mid-flight without a reflow-forcing
 * class removal, and needs no keyframes in the stylesheet. Reduced motion
 * clamps silently and shows the note.
 */
export function QuantityResist({
  stock,
  value: controlled,
  onChange,
  min = 1,
  className = '',
}: QuantityResistProps) {
  const [internal, setInternal] = useState(min);
  const value = controlled ?? internal;
  const fieldRef = useRef<HTMLDivElement>(null);
  const [blocked, setBlocked] = useState(false);
  const reduced = useReducedMotion();

  const set = (n: number) => {
    if (controlled === undefined) setInternal(n);
    onChange?.(n);
  };

  const kick = (dir: 1 | -1) => {
    setBlocked(true);
    window.setTimeout(() => setBlocked(false), 2200);
    const el = fieldRef.current;
    if (!el || reduced) return;
    el.animate(
      [
        { transform: 'translateX(0)' },
        { transform: `translateX(${dir * 7}px)` },
        { transform: `translateX(${dir * -4}px)` },
        { transform: `translateX(${dir * 2}px)` },
        { transform: 'translateX(0)' },
      ],
      { duration: 320, easing: 'cubic-bezier(0.34,1.56,0.64,1)' },
    );
  };

  const step = (delta: 1 | -1) => {
    const next = value + delta;
    if (next > stock) return kick(1);
    if (next < min) return kick(-1);
    set(next);
  };

  return (
    <div className={className}>
      <div ref={fieldRef} className="inline-flex border border-ink">
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={() => step(-1)}
          className="h-12 w-12 cursor-pointer font-mono text-base hover:bg-ink hover:text-bone"
        >
          −
        </button>
        <output
          aria-live="polite"
          className="grid h-12 w-14 place-items-center border-x border-ink font-mono text-sm tabular-nums"
        >
          {value}
        </output>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => step(1)}
          className="h-12 w-12 cursor-pointer font-mono text-base hover:bg-ink hover:text-bone"
        >
          +
        </button>
      </div>

      <p
        className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-accent"
        style={{
          opacity: blocked ? 1 : 0,
          transition: 'opacity 200ms ease',
        }}
      >
        {value >= stock ? `Only ${stock} in stock` : `Minimum ${min}`}
      </p>
    </div>
  );
}
