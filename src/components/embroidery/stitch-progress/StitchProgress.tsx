// StitchProgress — an order status told in stitches and thread, not in a percentage
import { useEffect, useId, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import {
  DESIGNS,
  DUR,
  MOTION,
  fmtDuration,
  fmtStitches,
  threadByCode,
  threadMetres,
  totalStitches,
  type EmbroideryDesign,
} from '@/lib/embroidery';

export interface ProductionPhase {
  id: string;
  label: string;
  /** A timestamp, an operator, a machine number — whatever the floor logs. */
  note?: string;
}

export interface StitchProgressProps {
  design?: EmbroideryDesign;
  phases?: ProductionPhase[];
  /** Index of the phase currently running. Everything before it is complete. */
  phase?: number;
  /** Stitches laid down so far. Clamped to the design's total. */
  stitchesDone?: number;
  /** Capacity of the cone on the machine, in metres. 5,000m is a standard cone. */
  coneMetres?: number;
  machineSpm?: number;
  className?: string;
}

const DEFAULT_PHASES: ProductionPhase[] = [
  { id: 'digitising', label: 'Digitising', note: 'Path plan approved' },
  { id: 'hooping', label: 'Hooping', note: 'Cut-away backing' },
  { id: 'running', label: 'On the machine', note: 'Head 3' },
  { id: 'trimming', label: 'Trim & clean', note: '' },
  { id: 'finishing', label: 'Press & pack', note: '' },
];

/**
 * Where an order actually is, expressed in the units the workshop uses: how
 * many stitches are down, how much thread that has taken off the cone, and
 * which phase the piece is sitting in.
 *
 * A percentage bar on an order page is a guess wearing a uniform. Embroidery is
 * one of the rare businesses where the true unit of progress is countable and
 * already known — the machine reports stitches — so showing 12,400 of 18,300
 * is both more honest and more reassuring than "68%", because it is checkable.
 * The depleting cone alongside it is the same fact in a form that can be read
 * without reading: thread is a consumable, and watching it go down is watching
 * work happen.
 *
 * The gauge is a `clipPath` rect scaled on the Y axis, so the level animates on
 * the compositor with no layout and no repaint of the cone itself. Phase changes
 * and the stitch count are announced once, politely, rather than on every tick —
 * a screen reader should not be read a counter.
 *
 * Nothing here polls. Feed it new props from whatever you already use for order
 * state and the transitions handle the rest; with reduced motion the numbers
 * still update and only the movement is dropped.
 */
export function StitchProgress({
  design = DESIGNS[0],
  phases = DEFAULT_PHASES,
  phase = 2,
  stitchesDone,
  coneMetres = 5000,
  machineSpm = 750,
  className = '',
}: StitchProgressProps) {
  const reduced = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const total = totalStitches(design);
  const done = Math.max(0, Math.min(total, stitchesDone ?? Math.round(total * 0.62)));
  const pct = total ? done / total : 0;

  const metresUsed = threadMetres(done);
  const conePct = Math.max(0, 1 - metresUsed / coneMetres);
  const remaining = (total - done) / machineSpm;

  /** Announce the phase, not the counter. */
  const [announcement, setAnnouncement] = useState('');
  const lastPhase = useRef(phase);
  useEffect(() => {
    if (lastPhase.current === phase) return;
    lastPhase.current = phase;
    setAnnouncement(`${phases[phase]?.label ?? 'Next phase'} — ${fmtStitches(done)} of ${fmtStitches(total)} stitches`);
  }, [phase, phases, done, total]);

  const move = reduced ? 'none' : `transform ${DUR.scene}ms ${MOTION.fabric}`;
  const thread = threadByCode(design.blocks[Math.min(design.blocks.length - 1, phase)].thread);

  return (
    <section className={`border border-ink bg-bone ${className}`}>
      <div className="grid gap-px bg-ink sm:grid-cols-[auto_minmax(0,1fr)]">
        {/* The cone. A gauge that happens to be the actual consumable. */}
        <div className="flex items-center gap-4 bg-bone px-5 py-5 sm:flex-col sm:justify-center">
          <svg
            viewBox="0 0 60 96"
            aria-hidden
            className="h-24 w-16 shrink-0"
            style={{ aspectRatio: '60 / 96' }}
          >
            <defs>
              <clipPath id={`${uid}-cone`}>
                {/* The cone silhouette: wide at the base, narrow at the top. */}
                <path d="M22 4 L38 4 L52 88 L8 88 Z" />
              </clipPath>
            </defs>
            {/* Empty cone. */}
            <path d="M22 4 L38 4 L52 88 L8 88 Z" fill="#ddd5c4" stroke="#0c0b0e" strokeWidth="1.2" />
            {/* Thread remaining, filling from the bottom. */}
            <g clipPath={`url(#${uid}-cone)`}>
              <rect
                x="0"
                y="0"
                width="60"
                height="96"
                fill={thread.hex}
                style={{
                  transformOrigin: '0px 96px',
                  transform: `scaleY(${conePct.toFixed(3)})`,
                  transition: move,
                }}
              />
              {/* Winding lines, so it reads as wound thread rather than liquid. */}
              <g opacity="0.25">
                {Array.from({ length: 11 }, (_, i) => (
                  <line key={i} x1="0" y1={8 + i * 8} x2="60" y2={8 + i * 8} stroke="#000" strokeWidth="1.4" />
                ))}
              </g>
            </g>
            <path d="M22 4 L38 4 L52 88 L8 88 Z" fill="none" stroke="#0c0b0e" strokeWidth="1.2" />
          </svg>

          <div className="sm:mt-3 sm:text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/55">Cone</p>
            <p className="font-mono text-sm tabular-nums text-ink">
              {Math.round(coneMetres - metresUsed)}m
            </p>
            <p className="font-mono text-[10px] tabular-nums text-ink/45">
              {metresUsed.toFixed(0)}m used
            </p>
          </div>
        </div>

        <div className="bg-bone px-5 py-5">
          {/* Counters. The headline is a count, never a percentage. */}
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <p className="font-mono text-2xl tabular-nums leading-none text-ink">
              {fmtStitches(done)}
              <span className="text-ink/40"> / {fmtStitches(total)}</span>
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/55">
              {remaining > 0 ? `${fmtDuration(remaining)} of run left` : 'Run complete'}
            </p>
          </div>

          {/* Stitch progress against the colour blocks it is passing through. */}
          <div aria-hidden className="mt-4 flex h-2 w-full gap-px overflow-hidden">
            {design.blocks.map((b) => {
              const t = threadByCode(b.thread);
              return (
                <span
                  key={b.id}
                  className="block"
                  style={{ width: `${(b.stitches / total) * 100}%`, background: t.hex, opacity: 0.3 }}
                />
              );
            })}
          </div>
          <div aria-hidden className="relative -mt-2 h-2 w-full overflow-hidden">
            <div
              className="flex h-2 w-full gap-px origin-left"
              style={{ transform: `scaleX(${pct.toFixed(4)})`, transition: move }}
            >
              {design.blocks.map((b) => (
                <span
                  key={b.id}
                  className="block"
                  style={{ width: `${(b.stitches / total) * 100}%`, background: threadByCode(b.thread).hex }}
                />
              ))}
            </div>
          </div>

          {/* Phases. Plain chips — the ladder is a fact, not a decoration. */}
          <ol className="mt-6 flex list-none flex-wrap gap-px border border-ink bg-ink p-0">
            {phases.map((p, i) => {
              const state = i < phase ? 'done' : i === phase ? 'current' : 'todo';
              return (
                <li key={p.id} className="min-w-0 flex-1 basis-[7.5rem]">
                  <div
                    aria-current={state === 'current' ? 'step' : undefined}
                    className={`h-full px-3 py-2 ${
                      state === 'done'
                        ? 'bg-bone text-ink/50'
                        : state === 'current'
                          ? 'bg-ink text-bone'
                          : 'bg-bone text-ink/35'
                    }`}
                  >
                    <p className="font-mono text-[10px] uppercase leading-tight tracking-[0.14em]">
                      {state === 'done' ? '✓ ' : ''}
                      {p.label}
                    </p>
                    {p.note && (
                      <p
                        className={`mt-1 font-mono text-[9px] leading-tight ${
                          state === 'current' ? 'text-bone/60' : 'text-ink/35'
                        }`}
                      >
                        {p.note}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/55">
            {design.name} · {design.widthMm}×{design.heightMm} mm · {design.blocks.length} blocks
          </p>
        </div>
      </div>

      {/* One polite announcement per phase change. Not a live counter. */}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </section>
  );
}
