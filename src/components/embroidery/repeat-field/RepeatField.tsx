// RepeatField — one motif becomes an all-over, and the stitch count goes with it
import { useId, useMemo, useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { DesignArt } from '@/lib/DesignArt';
import {
  DESIGNS,
  DUR,
  GARMENTS,
  MOTION,
  fmtDuration,
  fmtStitches,
  threadMetres,
  totalStitches,
  type EmbroideryDesign,
  type Garment,
} from '@/lib/embroidery';

export type RepeatOffset = 'grid' | 'brick' | 'half-drop';

export interface RepeatSettings {
  /** Motif width in garment-box units. */
  scale: number;
  /** Extra space between motifs, as a fraction of motif width. */
  gap: number;
  rotation: number;
  offset: RepeatOffset;
}

export interface RepeatFieldProps {
  design?: EmbroideryDesign;
  garment?: Garment;
  value?: RepeatSettings;
  onChange?: (settings: RepeatSettings) => void;
  machineSpm?: number;
  className?: string;
}

const OFFSETS: { value: RepeatOffset; label: string }[] = [
  { value: 'grid', label: 'Grid' },
  { value: 'brick', label: 'Brick' },
  { value: 'half-drop', label: 'Half-drop' },
];

const DEFAULTS: RepeatSettings = { scale: 34, gap: 0.5, rotation: 0, offset: 'half-drop' };

/**
 * An all-over repeat, composed live on the garment, with the bill attached.
 *
 * All-over embroidery is the highest-margin thing an embroidery studio sells
 * and the hardest thing to sell, because nobody can picture it and every quote
 * is a shock. The two facts that make it hard are the same fact: a repeat is
 * not one design, it is *n* copies of one design, and *n* is set by three
 * sliders. Tightening the gap by a third can add forty thousand stitches. That
 * relationship is invisible in a normal customiser and unmissable here, because
 * the motif count and the stitch total sit under the controls and move with
 * them.
 *
 * The offsets are the real textile ones rather than invented options — a plain
 * grid reads mechanical and shows its seams, brick and half-drop are what
 * printers and weavers use to break the eye's line, and the difference between
 * them is obvious the moment you can switch.
 *
 * The whole field is a single SVG `<pattern>` clipped to the garment
 * silhouette. That means the browser tiles it once and the cost is flat no
 * matter how many motifs are on screen — 8 repeats and 800 repeats are the same
 * number of DOM nodes. Rotation is `patternTransform`, so re-laying the field
 * never touches the DOM at all.
 */
export function RepeatField({
  design = DESIGNS[2],
  garment = GARMENTS[0],
  value,
  onChange,
  machineSpm = 750,
  className = '',
}: RepeatFieldProps) {
  const reduced = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const [internal, setInternal] = useState<RepeatSettings>(DEFAULTS);
  const settings = value ?? internal;

  const set = (patch: Partial<RepeatSettings>) => {
    const next = { ...settings, ...patch };
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };

  const [, , gw, gh] = garment.viewBox.split(/\s+/).map(Number);
  const motif = settings.scale;
  const step = motif * (1 + settings.gap);

  /**
   * Tile geometry. Brick shifts alternate rows, half-drop shifts alternate
   * columns; both need a tile two steps deep on the shifted axis and a couple
   * of copies that hang outside it, which the pattern clips for free.
   */
  const tile = useMemo(() => {
    const placements: { x: number; y: number }[] = [];
    let w = step;
    let h = step;
    if (settings.offset === 'brick') {
      h = step * 2;
      placements.push({ x: 0, y: 0 }, { x: step / 2, y: step }, { x: -step / 2, y: step });
    } else if (settings.offset === 'half-drop') {
      w = step * 2;
      placements.push({ x: 0, y: 0 }, { x: step, y: step / 2 }, { x: step, y: -step / 2 });
    } else {
      placements.push({ x: 0, y: 0 });
    }
    return { w, h, placements };
  }, [step, settings.offset]);

  /**
   * How many motifs actually land on the garment. The silhouette covers roughly
   * 62% of its bounding box — close enough to quote from, and stated rather
   * than hidden.
   */
  const count = Math.max(1, Math.round((gw * gh * 0.62) / (step * step)));
  /** Garment-box units are arbitrary; millimetres are what a customer thinks in. */
  const motifMm = Math.round((motif / gw) * garment.widthMm);
  const perMotif = totalStitches(design);
  const stitches = count * perMotif;
  const metres = threadMetres(stitches);
  const minutes = stitches / machineSpm;

  const field = 'font-mono text-[10px] uppercase tracking-[0.24em] text-ink/55';
  const ease = reduced ? 'none' : `${DUR.emphasis}ms ${MOTION.fabric}`;

  return (
    <div className={`grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)] ${className}`}>
      <div className="border border-ink bg-bone">
        <svg
          viewBox={garment.viewBox}
          role="img"
          aria-label={`${garment.name} with ${design.name} repeated as a ${settings.offset} layout, about ${count} motifs`}
          className="block h-auto w-full"
          style={{ aspectRatio: `${gw} / ${gh}` }}
        >
          <defs>
            <pattern
              id={`${uid}-repeat`}
              patternUnits="userSpaceOnUse"
              width={tile.w}
              height={tile.h}
              patternTransform={`rotate(${settings.rotation})`}
              style={{ transition: reduced ? 'none' : `all ${ease}` }}
            >
              {tile.placements.map((p, i) => (
                <DesignArt
                  key={i}
                  design={design}
                  grain={false}
                  x={p.x}
                  y={p.y}
                  width={motif}
                  height={motif}
                  style={undefined}
                />
              ))}
            </pattern>
            <clipPath id={`${uid}-body`}>
              <path d={garment.path} />
            </clipPath>
          </defs>

          <path d={garment.path} fill="#e2dbcb" />
          <g clipPath={`url(#${uid}-body)`}>
            <rect x="0" y="0" width={gw} height={gh} fill={`url(#${uid}-repeat)`} />
          </g>
          <path
            d={garment.path}
            fill="none"
            stroke="#0c0b0e"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {garment.detail && (
            <path d={garment.detail} fill="none" stroke="#0c0b0e" strokeWidth="0.6" opacity="0.35" />
          )}
        </svg>
      </div>

      <div className="min-w-0">
        <form onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor={`${uid}-scale`} className={`flex items-baseline justify-between ${field}`}>
              Motif size
              <span className="tabular-nums text-ink">{motifMm} mm</span>
            </label>
            <input
              id={`${uid}-scale`}
              type="range"
              min={14}
              max={70}
              step={1}
              value={settings.scale}
              onChange={(e) => set({ scale: Number(e.target.value) })}
              className="mt-3 w-full accent-vermilion"
            />
          </div>

          <div className="mt-6">
            <label htmlFor={`${uid}-gap`} className={`flex items-baseline justify-between ${field}`}>
              Spacing
              <span className="tabular-nums text-ink">{Math.round(settings.gap * 100)}%</span>
            </label>
            <input
              id={`${uid}-gap`}
              type="range"
              min={0}
              max={150}
              step={5}
              value={Math.round(settings.gap * 100)}
              onChange={(e) => set({ gap: Number(e.target.value) / 100 })}
              className="mt-3 w-full accent-vermilion"
            />
            <p className="mt-2 font-mono text-[10px] leading-relaxed text-ink/45">
              Spacing is the expensive control. Halving it roughly quadruples the
              motif count.
            </p>
          </div>

          <div className="mt-6">
            <label htmlFor={`${uid}-rot`} className={`flex items-baseline justify-between ${field}`}>
              Rotation
              <span className="tabular-nums text-ink">{settings.rotation}°</span>
            </label>
            <input
              id={`${uid}-rot`}
              type="range"
              min={0}
              max={90}
              step={1}
              value={settings.rotation}
              onChange={(e) => set({ rotation: Number(e.target.value) })}
              className="mt-3 w-full accent-vermilion"
            />
          </div>

          <fieldset className="mt-6 border-0 p-0">
            <legend className={field}>Layout</legend>
            <div className="mt-3 flex border border-ink">
              {OFFSETS.map((o, i) => (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={settings.offset === o.value}
                  onClick={() => set({ offset: o.value })}
                  className={`min-h-[44px] flex-1 px-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent ${
                    i ? 'border-l border-ink' : ''
                  } ${settings.offset === o.value ? 'bg-ink text-bone' : 'bg-bone text-ink/60 hover:text-ink'}`}
                  style={{ transitionDuration: reduced ? '0ms' : `${DUR.micro}ms` }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </fieldset>
        </form>

        <dl
          aria-live="polite"
          className="mt-7 grid grid-cols-2 gap-px border border-ink bg-ink"
        >
          <div className="bg-bone px-4 py-3">
            <dt className={field}>Motifs</dt>
            <dd className="mt-1 font-mono text-lg tabular-nums text-ink">≈{count}</dd>
          </div>
          <div className="bg-bone px-4 py-3">
            <dt className={field}>Stitches</dt>
            <dd className="mt-1 font-mono text-lg tabular-nums text-ink">{fmtStitches(stitches)}</dd>
          </div>
          <div className="bg-bone px-4 py-3">
            <dt className={field}>Thread</dt>
            <dd className="mt-1 font-mono text-lg tabular-nums text-ink">{metres.toFixed(0)} m</dd>
          </div>
          <div className="bg-bone px-4 py-3">
            <dt className={field}>Run time</dt>
            <dd className="mt-1 font-mono text-lg tabular-nums text-ink">{fmtDuration(minutes)}</dd>
          </div>
        </dl>

        <p className="mt-3 font-mono text-[10px] leading-relaxed text-ink/45">
          Counted against {Math.round(0.62 * 100)}% of the garment box — the part
          of the silhouette an all-over actually reaches. {fmtStitches(perMotif)}{' '}
          stitches per motif.
        </p>
      </div>
    </div>
  );
}
