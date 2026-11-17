// StitchEstimator — size and density become stitches, thread, minutes and a price
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import {
  DESIGNS,
  DUR,
  MOTION,
  colourChanges,
  estimate,
  fmtDuration,
  fmtMoney,
  fmtStitches,
  type Coverage,
  type Density,
  type EmbroideryDesign,
} from '@/lib/embroidery';

export interface StitchEstimatorProps {
  design?: EmbroideryDesign;
  /** Cone length the coil is drawn against, in metres. */
  coneMetres?: number;
  onQuote?: (quote: ReturnType<typeof estimate>) => void;
  className?: string;
}

const DENSITIES: { value: Density; label: string; hint: string }[] = [
  { value: 'light', label: 'Light', hint: 'Open fill. Softer hand, faster run, less thread.' },
  { value: 'standard', label: 'Standard', hint: 'The default. Full coverage on most woven grounds.' },
  { value: 'dense', label: 'Dense', hint: 'Heavy coverage for pile and dark grounds. Stiffer result.' },
];

const COVERAGES: { value: Coverage; label: string }[] = [
  { value: 'outline', label: 'Outline' },
  { value: 'fill', label: 'Filled' },
];

/** An Archimedean spiral, as a path. Drawn once per size — no per-frame maths. */
function coilPath(turns: number, r0: number, r1: number, cx: number, cy: number): string {
  const steps = Math.max(24, Math.round(turns * 26));
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = t * turns * Math.PI * 2;
    const r = r0 + (r1 - r0) * t;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    d += `${i ? ' L' : 'M'} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

/**
 * A quote you can move, showing the four numbers that actually decide it:
 * stitches, thread, machine minutes and money.
 *
 * Embroidery pricing confuses people because the lever is invisible. Print is
 * priced by area and everybody's intuition is calibrated to that; embroidery is
 * priced by stitch count, which grows with the *square* of size and jumps when
 * an outline becomes a fill. A customer who scales a 60mm crest to 120mm has
 * quadrupled the price and has no idea. Putting the four outputs under one
 * slider turns a surprise on the invoice into a decision the customer made
 * themselves, and it deflects the "why is this more than a printed tee" email
 * before it is written.
 *
 * The coil is not decoration — its drawn length is the thread the job consumes,
 * against the capacity of one cone, so an abstract 74 metres gets a physical
 * size. It is a spiral generated once per size change and revealed by
 * `stroke-dashoffset` with `pathLength=100`.
 *
 * All arithmetic is pure and synchronous, so there is no debounce, no loading
 * state and nothing to get out of sync. It shares `estimate()` with the rest of
 * the group, which means the number quoted here is the number the production
 * gauge later counts down.
 */
export function StitchEstimator({
  design = DESIGNS[0],
  coneMetres = 1000,
  onQuote,
  className = '',
}: StitchEstimatorProps) {
  const reduced = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const [widthMm, setWidthMm] = useState(design.widthMm);
  const [coverage, setCoverage] = useState<Coverage>('fill');
  const [density, setDensity] = useState<Density>('standard');
  const [quantity, setQuantity] = useState(12);

  const aspect = design.heightMm / design.widthMm;
  const heightMm = Math.round(widthMm * aspect);
  const colours = colourChanges(design) + 1;

  const quote = useMemo(
    () => estimate({ widthMm, heightMm, coverage, density, colours, quantity }),
    [widthMm, heightMm, coverage, density, colours, quantity],
  );

  /**
   * Ref'd for the same reason as everywhere else in this group: an inline
   * `onQuote={(q) => setQuote(q)}` in the dependency array would re-fire on
   * every render the parent's own state change causes, which is a loop.
   */
  const quoteCb = useRef(onQuote);
  quoteCb.current = onQuote;
  useEffect(() => {
    quoteCb.current?.(quote);
  }, [quote]);

  const coilFill = Math.max(0, Math.min(1, quote.metres / coneMetres));
  const coil = useMemo(() => coilPath(6.5, 6, 46, 56, 56), []);
  const ease = reduced ? 'none' : `stroke-dashoffset ${DUR.emphasis}ms ${MOTION.thread}`;

  const field = 'font-mono text-[10px] uppercase tracking-[0.24em] text-ink/55';
  const segment = (on: boolean) =>
    `min-h-[44px] flex-1 border-ink px-2 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent ${
      on ? 'bg-ink text-bone' : 'bg-bone text-ink/60 hover:text-ink'
    }`;

  return (
    <div className={`grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] ${className}`}>
      <form className="min-w-0" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor={`${uid}-w`} className={`flex items-baseline justify-between ${field}`}>
            Finished width
            <span className="tabular-nums text-ink">
              {widthMm} × {heightMm} mm
            </span>
          </label>
          <input
            id={`${uid}-w`}
            type="range"
            min={25}
            max={300}
            step={5}
            value={widthMm}
            onChange={(e) => setWidthMm(Number(e.target.value))}
            className="mt-3 w-full accent-vermilion"
          />
          <p className="mt-2 font-mono text-[10px] leading-relaxed text-ink/45">
            Stitch count rises with area, not width — doubling this multiplies it by four.
          </p>
        </div>

        <fieldset className="mt-7 border-0 p-0">
          <legend className={field}>Coverage</legend>
          <div className="mt-3 flex border border-ink">
            {COVERAGES.map((c, i) => (
              <button
                key={c.value}
                type="button"
                aria-pressed={coverage === c.value}
                onClick={() => setCoverage(c.value)}
                className={`${segment(coverage === c.value)} ${i ? 'border-l' : ''}`}
                style={{ transitionDuration: reduced ? '0ms' : `${DUR.micro}ms` }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-7 border-0 p-0">
          <legend className={field}>Density</legend>
          <div className="mt-3 flex border border-ink">
            {DENSITIES.map((d, i) => (
              <button
                key={d.value}
                type="button"
                aria-pressed={density === d.value}
                onClick={() => setDensity(d.value)}
                className={`${segment(density === d.value)} ${i ? 'border-l' : ''}`}
                style={{ transitionDuration: reduced ? '0ms' : `${DUR.micro}ms` }}
              >
                {d.label}
              </button>
            ))}
          </div>
          <p className="mt-2 font-mono text-[10px] leading-relaxed text-ink/45">
            {DENSITIES.find((d) => d.value === density)?.hint}
          </p>
        </fieldset>

        <div className="mt-7">
          <label htmlFor={`${uid}-q`} className={field}>
            Quantity
          </label>
          <div className="mt-3 flex w-full max-w-[220px] border border-ink">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="h-11 w-11 shrink-0 border-r border-ink font-mono transition-colors hover:bg-ink hover:text-bone focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
            >
              <span aria-hidden>−</span>
              <span className="sr-only">One fewer</span>
            </button>
            <input
              id={`${uid}-q`}
              type="number"
              min={1}
              max={5000}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              className="h-11 min-w-0 flex-1 bg-bone text-center font-mono text-sm tabular-nums text-ink focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
            />
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(5000, q + 1))}
              className="h-11 w-11 shrink-0 border-l border-ink font-mono transition-colors hover:bg-ink hover:text-bone focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
            >
              <span aria-hidden>+</span>
              <span className="sr-only">One more</span>
            </button>
          </div>
          <p className="mt-2 font-mono text-[10px] leading-relaxed text-ink/45">
            Digitising is charged once and spread across the run. Larger runs also
            drop the per-unit rate.
          </p>
        </div>
      </form>

      {/* Outputs. A quote is a result, so these are <output> elements. */}
      <div className="border border-ink bg-bone">
        <div className="flex items-center gap-4 border-b border-ink px-5 py-5">
          <svg viewBox="0 0 112 112" aria-hidden className="h-24 w-24 shrink-0">
            <path d={coil} fill="none" stroke="#0c0b0e" strokeWidth="1" opacity="0.14" />
            <path
              d={coil}
              fill="none"
              stroke="#ff4d23"
              strokeWidth="2.2"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={100}
              strokeDashoffset={100 - coilFill * 100}
              style={{ transition: ease }}
            />
          </svg>
          <div>
            <p className={field}>Thread</p>
            <output
              htmlFor={`${uid}-w`}
              className="mt-1 block font-mono text-2xl tabular-nums leading-none text-ink"
            >
              {quote.metres.toFixed(0)} m
            </output>
            <p className="mt-1 font-mono text-[10px] tabular-nums text-ink/45">
              {((quote.metres / coneMetres) * 100).toFixed(0)}% of a {coneMetres}m cone, per piece
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-px bg-ink">
          <div className="bg-bone px-5 py-4">
            <dt className={field}>Stitches</dt>
            <dd className="mt-1 font-mono text-lg tabular-nums text-ink">
              {fmtStitches(quote.stitches)}
            </dd>
          </div>
          <div className="bg-bone px-5 py-4">
            <dt className={field}>Colours</dt>
            <dd className="mt-1 font-mono text-lg tabular-nums text-ink">{colours}</dd>
          </div>
          <div className="bg-bone px-5 py-4">
            <dt className={field}>Run, each</dt>
            <dd className="mt-1 font-mono text-lg tabular-nums text-ink">
              {fmtDuration(quote.minutesEach)}
            </dd>
          </div>
          <div className="bg-bone px-5 py-4">
            <dt className={field}>Run, total</dt>
            <dd className="mt-1 font-mono text-lg tabular-nums text-ink">
              {fmtDuration(quote.minutesTotal)}
            </dd>
          </div>
        </dl>

        <div className="border-t border-ink px-5 py-5">
          <div className="flex items-baseline justify-between">
            <p className={field}>Per piece</p>
            <output className="font-mono text-lg tabular-nums text-ink">
              {fmtMoney(quote.unitPrice)}
            </output>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <p className={field}>
              Total · {quantity} {quantity === 1 ? 'piece' : 'pieces'}
            </p>
            <output
              aria-live="polite"
              className="font-mono text-2xl tabular-nums leading-none text-ink"
            >
              {fmtMoney(quote.total)}
            </output>
          </div>
          <p className="mt-3 font-mono text-[10px] leading-relaxed text-ink/45">
            Indicative. Final count is set when the design is digitised — that is
            the number this estimate is approximating.
          </p>
        </div>
      </div>
    </div>
  );
}
