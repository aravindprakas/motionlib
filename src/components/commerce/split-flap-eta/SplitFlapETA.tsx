// SplitFlapETA — the delivery date lands on a split-flap board
import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface SplitFlapETAProps {
  /** Resolve a postcode to a delivery line. Default: a plausible local stub. */
  resolve?: (pincode: string) => Promise<string> | string;
  /** Characters per cell row. Default 14. */
  cells?: number;
  /** Frames each cell spends flapping before it locks. Default 26. */
  spin?: number;
  /** Placeholder before the first lookup. */
  idle?: string;
  className?: string;
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ,';

/**
 * The shopper types a pincode; the delivery estimate does not fade in, it
 * *lands* — each cell flapping through glyphs and locking left to right, the
 * way a departure board settles.
 *
 * This is a deliberate use of duration as reassurance. A delivery date that
 * appears instantly reads as a hardcoded marketing string; one that visibly
 * resolves reads as a real lookup against a real network, which is exactly the
 * claim the date is making. The cost is ~400ms, and it buys trust on the one
 * number that decides the sale.
 *
 * Own rAF loop over a fixed cell array — no per-frame allocation, and each cell
 * only re-rolls while it is still unlocked. Reduced motion sets the text flat.
 */
export function SplitFlapETA({
  resolve,
  cells = 14,
  spin = 26,
  idle = '— — —',
  className = '',
}: SplitFlapETAProps) {
  const [pincode, setPincode] = useState('');
  const [board, setBoard] = useState<string[]>(() =>
    idle.padEnd(cells, ' ').slice(0, cells).split(''),
  );
  const [busy, setBusy] = useState(false);
  const rafRef = useRef(0);
  const reduced = useReducedMotion();

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const flapTo = useCallback(
    (target: string) => {
      const to = target.toUpperCase().padEnd(cells, ' ').slice(0, cells).split('');
      if (reduced) {
        setBoard(to);
        setBusy(false);
        return;
      }
      cancelAnimationFrame(rafRef.current);

      // Each cell locks a few frames after the one to its left.
      const lock = to.map((_, i) => Math.floor(i * 2.2) + spin);
      let frame = 0;
      const next: string[] = to.slice();

      const tick = () => {
        let locked = 0;
        for (let i = 0; i < to.length; i++) {
          if (frame >= lock[i]) {
            next[i] = to[i];
            locked++;
          } else {
            next[i] = GLYPHS[(Math.random() * GLYPHS.length) | 0];
          }
        }
        setBoard(next.slice());
        frame++;
        if (locked < to.length) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setBusy(false);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [cells, spin, reduced],
  );

  const lookup = async () => {
    if (pincode.length < 6 || busy) return;
    setBusy(true);
    const stub = (code: string) => {
      const d = new Date();
      d.setDate(d.getDate() + 2 + (Number(code.slice(-1)) % 4));
      return d
        .toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
        .toUpperCase();
    };
    const value = await (resolve ? resolve(pincode) : stub(pincode));
    flapTo(value);
  };

  return (
    <div className={`w-full max-w-md ${className}`}>
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-ink/60">
        Arrives by
      </p>

      <div className="flex gap-[3px]" role="status" aria-live="polite" aria-busy={busy}>
        {board.map((ch, i) => (
          <span
            key={i}
            className="relative grid h-12 w-[1.6rem] place-items-center bg-ink font-mono text-base text-bone"
          >
            {ch === ' ' ? ' ' : ch}
            {/* The hinge line every flap board has. */}
            <span aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-bone/25" />
          </span>
        ))}
      </div>

      <div className="mt-4 flex gap-0">
        <input
          value={pincode}
          inputMode="numeric"
          maxLength={6}
          placeholder="PINCODE"
          aria-label="Delivery pincode"
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => e.key === 'Enter' && lookup()}
          className="w-40 border border-ink bg-transparent px-3 py-3 font-mono text-xs uppercase tracking-[0.2em] outline-none placeholder:text-ink/35"
        />
        <button
          type="button"
          onClick={lookup}
          disabled={pincode.length < 6 || busy}
          className="cursor-pointer border border-l-0 border-ink bg-accent px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink disabled:cursor-not-allowed disabled:bg-transparent disabled:text-ink/30"
        >
          Check
        </button>
      </div>
    </div>
  );
}
