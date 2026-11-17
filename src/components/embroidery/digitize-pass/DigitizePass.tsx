// DigitizePass — the same motif in its three states: artwork, path plan, stitch plan
import { useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import {
  DESIGNS,
  DUR,
  MOTION,
  colourChanges,
  fmtStitches,
  threadByCode,
  totalStitches,
  type EmbroideryDesign,
} from '@/lib/embroidery';

export interface DigitizePassProps {
  design?: EmbroideryDesign;
  /** Controlled stage: 0 artwork · 1 path plan · 2 stitch plan. */
  stage?: 0 | 1 | 2;
  onStageChange?: (stage: 0 | 1 | 2) => void;
  className?: string;
}

type Handle = { x: number; y: number };
type Travel = { x1: number; y1: number; x2: number; y2: number };

const STAGES = [
  {
    key: 'artwork',
    label: 'Artwork',
    caption: 'What you send us. Flat colour, any size, no idea yet how it is made.',
  },
  {
    key: 'paths',
    label: 'Path plan',
    caption: 'Every shape becomes a path with a direction, an entry and an exit. Dashes are the jumps between blocks — each one is a trim.',
  },
  {
    key: 'stitches',
    label: 'Stitch plan',
    caption: 'Paths become stitches at a real density. This is the file the machine runs, and the number your quote is built from.',
  },
] as const;

/**
 * One motif shown in the three states it passes through on the way to a
 * garment: the artwork a customer sends, the path plan a digitiser draws, and
 * the stitch plan a machine runs.
 *
 * Digitising is the step customers do not know they are buying, and it is where
 * the setup fee, the lead time and half the disputes come from. "Send us your
 * logo" hides a skilled redraw; when the invoice arrives with a setup line on
 * it, it reads as padding. Letting someone step through the same shape changing
 * representation makes the labour legible before it has to be defended — and it
 * doubles as the studio's proof of craft, because the path plan is visibly
 * hand-made work rather than an upload.
 *
 * The three states are not three pictures. They are three renderings of the
 * same `blocks` array, so the object never jumps: fills lose their colour and
 * gain outlines, anchor handles appear on the real curves, jump lines connect
 * the true end of one block to the true start of the next. Anchors and jumps
 * are sampled once from the live paths with `getPointAtLength` — the geometry
 * comes from the SVG itself, so it can never drift from what is drawn.
 *
 * Cross-fading three static layers means the whole interaction is opacity,
 * which composites; there is no per-frame work and nothing to throttle on a
 * slow device.
 */
export function DigitizePass({
  design = DESIGNS[0],
  stage: controlled,
  onStageChange,
  className = '',
}: DigitizePassProps) {
  const reduced = useReducedMotion();
  const [internal, setInternal] = useState<0 | 1 | 2>(0);
  const stage = controlled ?? internal;
  const svgRef = useRef<SVGSVGElement>(null);
  const [handles, setHandles] = useState<Handle[]>([]);
  const [travels, setTravels] = useState<Travel[]>([]);

  const [, , vw, vh] = design.viewBox.split(/\s+/).map(Number);
  const total = totalStitches(design);

  const set = (next: 0 | 1 | 2) => {
    if (controlled === undefined) setInternal(next);
    onStageChange?.(next);
  };

  /**
   * Sample anchors and jump lines off the rendered geometry. Once per design —
   * `getPointAtLength` forces layout, so it must never sit in an interaction.
   */
  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const paths = Array.from(svg.querySelectorAll<SVGPathElement>('[data-geom]'));
    if (!paths.length) return;

    const nextHandles: Handle[] = [];
    const ends: { start: Handle; end: Handle }[] = [];

    paths.forEach((p) => {
      const len = p.getTotalLength();
      if (!len) return;
      // Six anchors per block reads as "this was drawn by hand" without
      // turning into confetti on a small screen.
      const n = 6;
      for (let i = 0; i < n; i++) {
        const pt = p.getPointAtLength((len * i) / n);
        nextHandles.push({ x: pt.x, y: pt.y });
      }
      const s = p.getPointAtLength(0);
      const e = p.getPointAtLength(len);
      ends.push({ start: { x: s.x, y: s.y }, end: { x: e.x, y: e.y } });
    });

    setHandles(nextHandles);
    setTravels(
      ends.slice(0, -1).map((cur, i) => ({
        x1: cur.end.x,
        y1: cur.end.y,
        x2: ends[i + 1].start.x,
        y2: ends[i + 1].start.y,
      })),
    );
  }, [design]);

  const fade = reduced ? '0ms' : `${DUR.emphasis}ms`;
  const layer = (visible: boolean, delay = 0) => ({
    opacity: visible ? 1 : 0,
    transition: `opacity ${fade} ${MOTION.fabric} ${reduced ? 0 : delay}ms`,
  });

  return (
    <div className={className}>
      <div className="border border-ink bg-bone">
        <svg
          ref={svgRef}
          viewBox={design.viewBox}
          role="img"
          aria-label={`${design.name} at the ${STAGES[stage].label.toLowerCase()} stage`}
          className="block h-auto w-full"
          style={{ aspectRatio: `${vw} / ${vh}` }}
        >
          {/* 0 — artwork: flat colour, no construction shown. */}
          <g style={layer(stage === 0)}>
            {design.blocks.map((b) => {
              const t = threadByCode(b.thread);
              return b.weight == null ? (
                <path key={b.id} d={b.path} fill={t.hex} />
              ) : (
                <path
                  key={b.id}
                  d={b.path}
                  fill="none"
                  stroke={t.hex}
                  strokeWidth={b.weight}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}
          </g>

          {/* 1 — path plan: outlines, anchors, jumps. */}
          <g style={layer(stage === 1)}>
            {design.blocks.map((b) => (
              <path
                key={b.id}
                data-geom
                d={b.path}
                fill="none"
                stroke="#0c0b0e"
                strokeWidth="0.9"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {travels.map((t, i) => (
              <line
                key={i}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke="#ff4d23"
                strokeWidth="0.7"
                strokeDasharray="3 2.5"
              />
            ))}
            {handles.map((h, i) => (
              <rect
                key={i}
                x={h.x - 1.7}
                y={h.y - 1.7}
                width="3.4"
                height="3.4"
                fill="#ece6d8"
                stroke="#0c0b0e"
                strokeWidth="0.7"
                style={{
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  transform: stage === 1 ? 'scale(1)' : 'scale(0.2)',
                  transition: reduced
                    ? 'none'
                    : `transform ${DUR.std}ms ${MOTION.settle} ${(i % 6) * 18}ms`,
                }}
              />
            ))}
          </g>

          {/* 2 — stitch plan: real thread, real density. */}
          <g style={layer(stage === 2)}>
            {design.blocks.map((b) => {
              const t = threadByCode(b.thread);
              const w = b.weight ?? 2;
              return b.weight == null ? (
                <g key={b.id}>
                  <path d={b.path} fill={t.hex} opacity="0.9" />
                  <path
                    d={b.path}
                    fill="none"
                    stroke={t.hex}
                    strokeWidth="1.6"
                    strokeDasharray="2.6 1.5"
                  />
                </g>
              ) : (
                <path
                  key={b.id}
                  d={b.path}
                  fill="none"
                  stroke={t.hex}
                  strokeWidth={w}
                  strokeLinecap="butt"
                  strokeDasharray={`${w * 1.6} ${w * 0.8}`}
                />
              );
            })}
          </g>
        </svg>
      </div>

      {/* Controls. A radio group, because these are three views of one thing. */}
      <div
        role="radiogroup"
        aria-label="Digitising stage"
        className="mt-4 grid grid-cols-3 border border-ink"
        onKeyDown={(e) => {
          const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (!d) return;
          e.preventDefault();
          const next = Math.min(2, Math.max(0, stage + d)) as 0 | 1 | 2;
          set(next);
          (e.currentTarget.children[next] as HTMLElement | undefined)?.focus();
        }}
      >
        {STAGES.map((s, i) => (
          <button
            key={s.key}
            type="button"
            role="radio"
            aria-checked={stage === i}
            tabIndex={stage === i ? 0 : -1}
            onClick={() => set(i as 0 | 1 | 2)}
            className={`min-h-[44px] border-ink px-2 py-3 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent ${
              i > 0 ? 'border-l' : ''
            } ${stage === i ? 'bg-ink text-bone' : 'bg-bone text-ink/60 hover:text-ink'}`}
            style={{ transitionDuration: reduced ? '0ms' : `${DUR.micro}ms` }}
          >
            <span className="tabular-nums">{i + 1}</span> · {s.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <p aria-live="polite" className="max-w-prose text-sm leading-relaxed text-ink/75">
          {STAGES[stage].caption}
        </p>
        <dl className="flex gap-6 font-mono text-[10px] uppercase tracking-[0.16em] text-ink/55 sm:justify-end">
          <div>
            <dt>Stitches</dt>
            <dd className="mt-1 text-sm tabular-nums text-ink">
              {stage === 0 ? '—' : fmtStitches(total)}
            </dd>
          </div>
          <div>
            <dt>Trims</dt>
            <dd className="mt-1 text-sm tabular-nums text-ink">
              {stage === 0 ? '—' : travels.length}
            </dd>
          </div>
          <div>
            <dt>Changes</dt>
            <dd className="mt-1 text-sm tabular-nums text-ink">
              {stage === 0 ? '—' : colourChanges(design)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
