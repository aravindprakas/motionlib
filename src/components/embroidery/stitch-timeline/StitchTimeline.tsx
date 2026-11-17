// StitchTimeline — scrub the run, stitch by stitch, the way the machine will do it
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import {
  DESIGNS,
  DUR,
  blockSpans,
  fmtDuration,
  fmtStitches,
  threadByCode,
  totalStitches,
  type EmbroideryDesign,
} from '@/lib/embroidery';

export interface StitchTimelineProps {
  design?: EmbroideryDesign;
  /** Playback rate in stitches per second. The trade figure is 750/min. */
  speed?: number;
  /** Machine speed used for the time readout, in stitches per minute. */
  machineSpm?: number;
  className?: string;
}

/**
 * The whole run on one scrubber: drag it and the design builds up in stitch
 * order, colour block by colour block, with the thread change called out at the
 * exact point the machine would stop for it.
 *
 * This is the studio's answer to "why does it take four days and cost that
 * much?", and it answers it with the customer's own hands rather than a
 * paragraph. Dragging past the 2,260-stitch bloom takes visibly longer than the
 * 280-stitch rule because the scrubber is denominated in stitches, not in
 * blocks or in seconds — the axis is the cost. It is equally the production
 * view: a floor supervisor can find the moment a colour changes and read off
 * the elapsed machine time there.
 *
 * The control is a real `input[type=range]`, so keyboard, screen reader and
 * touch behaviour are the platform's rather than reimplemented — arrow keys
 * step, Home/End jump, and the value is announced in stitches. Everything
 * visual hangs off it.
 *
 * Scrubbing does not re-render React. One handler writes `stroke-dashoffset` on
 * the stroked blocks and a `scaleY` on the mask rects of the filled ones —
 * about eight style writes per event, no layout — and the numeric readout is
 * written through `textContent`. React state changes only when the *block*
 * changes, which is a handful of times across an entire run. Playback is a
 * single rAF loop that exists only while playing and is cancelled on pause,
 * unmount, and reduced-motion.
 */
export function StitchTimeline({
  design = DESIGNS[0],
  speed = 3200,
  machineSpm = 750,
  className = '',
}: StitchTimelineProps) {
  const reduced = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const svgRef = useRef<SVGSVGElement>(null);
  const rangeRef = useRef<HTMLInputElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef(0);
  const posRef = useRef(0);

  const [playing, setPlaying] = useState(false);
  const [blockIndex, setBlockIndex] = useState(0);

  const [, , vw, vh] = design.viewBox.split(/\s+/).map(Number);
  const total = totalStitches(design);
  /**
   * Memoised deliberately. `apply` closes over this, the reset effect depends
   * on `apply`, and a fresh array each render would make that effect run after
   * every state change — snapping the scrubber back to the end mid-drag.
   */
  const spans = useMemo(() => blockSpans(design), [design]);

  /**
   * Push a stitch position into the DOM. The single hot path — no React, no
   * allocation beyond the two strings, no reads that could force layout.
   */
  const apply = useCallback(
    (stitches: number) => {
      const svg = svgRef.current;
      if (!svg) return;
      const p = Math.max(0, Math.min(1, stitches / total));

      let current = 0;
      for (let i = 0; i < spans.length; i++) {
        const { start, end } = spans[i];
        const local = end === start ? 1 : (p - start) / (end - start);
        const clamped = local < 0 ? 0 : local > 1 ? 1 : local;
        const el = svg.querySelector<SVGElement>(`[data-sweep-i="${i}"]`);
        if (el) {
          if (el.dataset.sweep === 'stroke') {
            el.setAttribute('stroke-dashoffset', String(100 - clamped * 100));
          } else {
            el.style.transform = `scaleY(${clamped})`;
          }
        }
        if (p >= start && clamped > 0) current = i;
      }

      if (countRef.current) countRef.current.textContent = fmtStitches(stitches);
      if (clockRef.current) clockRef.current.textContent = fmtDuration(stitches / machineSpm);
      // Only tell React when the block actually changes.
      setBlockIndex((prev) => (prev === current ? prev : current));
    },
    [design, machineSpm, spans, total],
  );

  useLayoutEffect(() => {
    posRef.current = total;
    apply(total);
    if (rangeRef.current) rangeRef.current.value = String(total);
  }, [apply, total]);

  useEffect(() => {
    if (!playing) return;
    if (reduced) {
      // Reduced motion keeps the scrubber and loses the autoplay, which is the
      // part that moves without being asked.
      posRef.current = total;
      apply(total);
      if (rangeRef.current) rangeRef.current.value = String(total);
      setPlaying(false);
      return;
    }
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      posRef.current = Math.min(total, posRef.current + (speed * dt) / 1000);
      apply(posRef.current);
      if (rangeRef.current) rangeRef.current.value = String(Math.round(posRef.current));
      if (posRef.current >= total) return setPlaying(false);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, reduced, speed, total, apply]);

  const scrub = (v: number) => {
    posRef.current = v;
    apply(v);
  };

  const toggle = () => {
    if (!playing && posRef.current >= total) {
      posRef.current = 0;
      apply(0);
      if (rangeRef.current) rangeRef.current.value = '0';
    }
    setPlaying((p) => !p);
  };

  const block = design.blocks[blockIndex];
  const thread = threadByCode(block.thread);
  const isChange = blockIndex > 0 && design.blocks[blockIndex - 1].thread !== block.thread;

  return (
    <div className={className}>
      <div className="border border-ink bg-bone">
        <svg
          ref={svgRef}
          viewBox={design.viewBox}
          role="img"
          aria-label={`${design.name}, ${fmtStitches(total)} stitches`}
          className="block h-auto w-full"
          style={{ aspectRatio: `${vw} / ${vh}` }}
        >
          <defs>
            {design.blocks.map((b, i) => (
              <mask
                key={b.id}
                id={`${uid}-m-${b.id}`}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width={vw}
                height={vh}
              >
                {b.weight != null ? (
                  <path
                    data-sweep="stroke"
                    data-sweep-i={i}
                    d={b.path}
                    fill="none"
                    stroke="#fff"
                    strokeWidth={(b.weight ?? 2) + 4}
                    strokeLinecap="butt"
                    strokeLinejoin="round"
                    pathLength={100}
                    strokeDasharray={100}
                    strokeDashoffset={0}
                  />
                ) : (
                  <rect
                    data-sweep="rect"
                    data-sweep-i={i}
                    x="0"
                    y="0"
                    width={vw}
                    height={vh}
                    fill="#fff"
                    style={{ transformOrigin: `0px ${vh}px` }}
                  />
                )}
              </mask>
            ))}
          </defs>

          {design.blocks.map((b) => {
            const t = threadByCode(b.thread);
            const w = b.weight ?? 2;
            return (
              <g key={b.id} mask={`url(#${uid}-m-${b.id})`}>
                {b.weight != null ? (
                  <path
                    d={b.path}
                    fill="none"
                    stroke={t.hex}
                    strokeWidth={w}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={`${w * 1.7} ${w * 0.85}`}
                  />
                ) : (
                  <path d={b.path} fill={t.hex} />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Transport */}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-pressed={playing}
          className="grid h-11 w-11 shrink-0 place-items-center border border-ink bg-bone text-ink transition-colors hover:bg-ink hover:text-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          style={{ transitionDuration: reduced ? '0ms' : `${DUR.micro}ms` }}
        >
          <span aria-hidden className="font-mono text-xs">
            {playing ? '❚❚' : '▶'}
          </span>
          <span className="sr-only">{playing ? 'Pause run' : 'Play run'}</span>
        </button>

        <div className="min-w-0 flex-1">
          <label htmlFor={`${uid}-range`} className="sr-only">
            Stitch position
          </label>
          <input
            ref={rangeRef}
            id={`${uid}-range`}
            type="range"
            min={0}
            max={total}
            step={10}
            defaultValue={total}
            onChange={(e) => {
              if (playing) setPlaying(false);
              scrub(Number(e.target.value));
            }}
            aria-valuetext={`${fmtStitches(posRef.current)} of ${fmtStitches(total)} stitches, ${block.label}`}
            className="w-full accent-vermilion"
          />
          {/* Blocks drawn to scale on the axis: the shape of the run's cost. */}
          <div aria-hidden className="mt-1 flex h-1.5 w-full gap-px">
            {design.blocks.map((b, i) => (
              <span
                key={b.id}
                className="block"
                style={{
                  width: `${(b.stitches / total) * 100}%`,
                  background: threadByCode(b.thread).hex,
                  opacity: i <= blockIndex ? 1 : 0.28,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink/55 sm:grid-cols-4">
        <div>
          <dt>Stitch</dt>
          <dd className="mt-1 text-sm text-ink">
            <span ref={countRef} className="tabular-nums">
              {fmtStitches(total)}
            </span>
            <span className="text-ink/40"> / {fmtStitches(total)}</span>
          </dd>
        </div>
        <div>
          <dt>Machine time</dt>
          <dd className="mt-1 text-sm tabular-nums text-ink">
            <span ref={clockRef}>{fmtDuration(total / machineSpm)}</span>
          </dd>
        </div>
        <div className="col-span-2">
          <dt>Running now</dt>
          <dd className="mt-1 flex items-center gap-2 text-sm text-ink" aria-live="polite">
            <span
              aria-hidden
              className="block h-4 w-4 border border-ink/30"
              style={{ background: thread.hex }}
            />
            <span className="truncate">
              {block.label} · {thread.code} {thread.name}
            </span>
            {isChange && (
              <span className="shrink-0 border border-vermilion px-1 text-[9px] uppercase tracking-[0.12em] text-vermilion">
                colour change
              </span>
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}
