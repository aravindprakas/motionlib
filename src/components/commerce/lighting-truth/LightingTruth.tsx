// LightingTruth — see the colour under the light you'll actually wear it in
import { useState } from 'react';

export interface LightingMode {
  label: string;
  /** CSS filter applied to the shot. */
  filter: string;
  /** Overlay wash blended over it. */
  wash: string;
  note: string;
}

export interface LightingTruthProps {
  src: string;
  alt: string;
  modes?: LightingMode[];
  className?: string;
}

const MODES: LightingMode[] = [
  { label: 'Daylight', filter: 'none', wash: 'transparent', note: 'Shot at 5600K — this is the true colour' },
  { label: 'Storefront', filter: 'saturate(0.92) contrast(1.04) brightness(1.03)', wash: 'rgba(255,183,77,0.16)', note: 'Warm halogen, ~3000K' },
  { label: 'Evening', filter: 'saturate(0.8) brightness(0.82) contrast(1.06)', wash: 'rgba(60,90,160,0.22)', note: 'Low indoor light, ~2200K' },
  { label: 'Office', filter: 'saturate(0.88) brightness(1.02)', wash: 'rgba(200,255,240,0.12)', note: 'Fluorescent, ~4000K' },
];

/**
 * The same product shot under four lighting conditions, swapped by an
 * interpolated CSS filter and a wash rather than by loading four photographs.
 *
 * Colour mismatch is one of the largest single causes of returns in apparel and
 * homeware, and it is almost never the photograph's fault — it is that the
 * shopper saw the garment at 5600K and then wore it at 2700K. Letting them
 * check the colour under their own light before they buy is cheaper than
 * processing the return, and honest in a way a "colours may vary" disclaimer
 * is not.
 *
 * One image, one element, no extra bytes: filters and the wash both animate on
 * the compositor, so the crossfade between conditions costs nothing and there
 * is no decode flash when switching.
 */
export function LightingTruth({ src, alt, modes = MODES, className = '' }: LightingTruthProps) {
  const [i, setI] = useState(0);
  const mode = modes[i];

  return (
    <div className={`w-full max-w-md ${className}`}>
      <div className="relative overflow-hidden border border-ink">
        <img
          src={src}
          alt={alt}
          className="block w-full"
          style={{ filter: mode.filter, transition: 'filter 420ms ease' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-multiply"
          style={{ background: mode.wash, transition: 'background-color 420ms ease' }}
        />
      </div>

      <div className="mt-3 flex" role="group" aria-label="Lighting condition">
        {modes.map((m, n) => (
          <button
            key={m.label}
            type="button"
            aria-pressed={n === i}
            onClick={() => setI(n)}
            className={`flex-1 cursor-pointer border border-ink px-2 py-3 font-mono text-[10px] uppercase tracking-[0.14em] ${
              n === i ? 'bg-ink text-bone' : 'hover:bg-ink/5'
            } ${n > 0 ? 'border-l-0' : ''}`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">{mode.note}</p>
    </div>
  );
}
