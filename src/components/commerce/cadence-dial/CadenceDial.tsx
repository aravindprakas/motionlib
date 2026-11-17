// CadenceDial — set a subscription by turning it, not by picking from a list
import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

export interface CadenceDialProps {
  /** Selectable intervals, in weeks. */
  options?: number[];
  value?: number;
  onChange?: (weeks: number) => void;
  /** How many upcoming deliveries to preview. Default 3. */
  preview?: number;
  className?: string;
}

const R = 62;
const SWEEP = 260; // degrees of travel, leaving a gap at the bottom

/**
 * Delivery frequency set by turning a dial, with the next few delivery dates
 * re-settling live underneath as it turns.
 *
 * A subscription dropdown asks the shopper to convert "every 6 weeks" into a
 * calendar in their head, and most simply do not — they pick the default and
 * churn when a box arrives at the wrong time. Turning a dial against real dates
 * makes the consequence visible while the choice is still being made, which is
 * the only moment it can be corrected cheaply.
 *
 * Pointer angle is taken relative to the dial centre and snapped to the nearest
 * mark, so a drag anywhere on the face works and the control never lands
 * between values. Keyboard arrows step the same list — this is a radio group
 * wearing a dial, not a replacement for one.
 */
export function CadenceDial({
  options = [2, 4, 6, 8, 12],
  value: controlled,
  onChange,
  preview = 3,
  className = '',
}: CadenceDialProps) {
  const [internal, setInternal] = useState(options[1]);
  const weeks = controlled ?? internal;
  const index = Math.max(0, options.indexOf(weeks));
  const faceRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const commit = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(options.length - 1, i));
      const next = options[clamped];
      if (next === weeks) return;
      if (controlled === undefined) setInternal(next);
      onChange?.(next);
    },
    [options, weeks, controlled, onChange],
  );

  const fromPointer = (e: ReactPointerEvent<HTMLDivElement>) => {
    const face = faceRef.current;
    if (!face) return;
    const r = face.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    // 0deg at the top of the sweep, increasing clockwise.
    let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
    deg = ((deg + 360) % 360) - (360 - SWEEP) / 2 + (360 - SWEEP) / 2;
    const t = (deg + SWEEP / 2) / SWEEP;
    commit(Math.round(t * (options.length - 1)));
  };

  const angle = -SWEEP / 2 + (index / (options.length - 1)) * SWEEP;

  const dates = Array.from({ length: preview }, (_, n) => {
    const d = new Date();
    d.setDate(d.getDate() + weeks * 7 * (n + 1));
    return d;
  });

  return (
    <div className={`flex flex-wrap items-center gap-10 ${className}`}>
      <div
        ref={faceRef}
        role="slider"
        tabIndex={0}
        aria-valuemin={options[0]}
        aria-valuemax={options[options.length - 1]}
        aria-valuenow={weeks}
        aria-valuetext={`Every ${weeks} weeks`}
        aria-label="Delivery frequency"
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          fromPointer(e);
        }}
        onPointerMove={(e) => dragging.current && fromPointer(e)}
        onPointerUp={() => (dragging.current = false)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowUp') commit(index + 1);
          if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') commit(index - 1);
        }}
        className="relative h-40 w-40 shrink-0 cursor-grab touch-none select-none rounded-none border border-ink active:cursor-grabbing"
      >
        {/* Marks */}
        {options.map((o, i) => {
          const a = -SWEEP / 2 + (i / (options.length - 1)) * SWEEP;
          return (
            <span
              key={o}
              className={`absolute left-1/2 top-1/2 origin-top ${
                i === index ? 'bg-accent' : 'bg-ink/30'
              }`}
              style={{
                width: i === index ? 2 : 1,
                height: i === index ? 14 : 9,
                transform: `translate(-50%,0) rotate(${a}deg) translateY(-${R}px)`,
                transformOrigin: '50% 0',
              }}
            />
          );
        })}

        {/* Needle */}
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 h-[46px] w-px origin-bottom bg-ink"
          style={{
            transform: `translate(-50%,-100%) rotate(${angle}deg)`,
            transformOrigin: '50% 100%',
            transition: 'transform 240ms cubic-bezier(0.34,1.4,0.64,1)',
          }}
        />
        <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 bg-ink" />

        <div className="absolute inset-x-0 bottom-4 text-center">
          <p className="font-mono text-lg tabular-nums leading-none">{weeks}</p>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink/50">weeks</p>
        </div>
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink/55">
          Next {preview} deliveries
        </p>
        <ul className="mt-3 space-y-1">
          {dates.map((d, i) => (
            <li key={i} className="font-mono text-[12px] tabular-nums">
              {d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
            </li>
          ))}
        </ul>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
          Save 10% · skip or cancel anytime
        </p>
      </div>
    </div>
  );
}
