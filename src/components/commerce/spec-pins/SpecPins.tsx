// SpecPins — construction details pinned to the place they happen
import { useState } from 'react';

export interface Pin {
  /** Position on the shot, 0–100. */
  x: number;
  y: number;
  label: string;
  detail: string;
  /** Which side the callout sits on. Default auto from x. */
  side?: 'left' | 'right';
}

export interface SpecPinsProps {
  src?: string;
  /** Flat colour stand-in when no shot is supplied. */
  hex?: string;
  alt?: string;
  pins: Pin[];
  className?: string;
}

/**
 * Numbered pins sit on the product shot; hovering or tapping one draws a leader
 * line out to a callout naming the construction detail at that exact point.
 *
 * A spec list says "bar-tacked stress points" and the shopper has no idea where
 * or why. Anchoring the claim to the millimetre it refers to turns a list of
 * assertions into evidence, which is the whole argument for a premium price —
 * you cannot charge for construction the buyer cannot locate.
 *
 * The leader is one SVG path in percentage-space, so it stays correct at any
 * container width with no measuring and no resize handling. Only the active
 * pin's line is mounted; the rest are dots.
 */
export function SpecPins({ src, hex = '#0c394a', alt = '', pins, className = '' }: SpecPinsProps) {
  const [active, setActive] = useState<number | null>(null);
  const pin = active === null ? null : pins[active];
  const side = pin ? (pin.side ?? (pin.x > 50 ? 'left' : 'right')) : 'right';
  const anchorX = side === 'right' ? 88 : 12;

  return (
    <div className={`w-full max-w-lg ${className}`}>
      <div
        className="relative aspect-[4/5] overflow-hidden border border-ink"
        style={{ background: hex }}
        onPointerLeave={() => setActive(null)}
      >
        {src && <img src={src} alt={alt} className="h-full w-full object-cover" />}

        {/* Leader line, drawn in percentage space. */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden
        >
          {pin && (
            <path
              d={`M${pin.x},${pin.y} L${(pin.x + anchorX) / 2},${pin.y} L${anchorX},${pin.y}`}
              fill="none"
              className="stroke-bone"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={0}
              style={{ animation: 'none' }}
            />
          )}
        </svg>

        {pins.map((p, i) => (
          <button
            key={p.label}
            type="button"
            aria-label={p.label}
            onPointerEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            className={`absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 cursor-pointer border font-mono text-[10px] transition-colors ${
              active === i ? 'border-bone bg-bone text-ink' : 'border-bone/70 bg-ink/40 text-bone'
            }`}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            {i + 1}
          </button>
        ))}

        {/* Callout */}
        {pin && (
          <div
            className="pointer-events-none absolute max-w-[46%] border border-bone/60 bg-ink/85 px-3 py-2 text-bone"
            style={{
              top: `${pin.y}%`,
              [side === 'right' ? 'right' : 'left']: '4%',
              transform: 'translateY(-50%)',
            }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.16em]">{pin.label}</p>
            <p className="mt-1 text-[11px] leading-snug text-bone/70">{pin.detail}</p>
          </div>
        )}
      </div>

      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50">
        {pins.length} construction details — hover or tap a pin
      </p>
    </div>
  );
}
