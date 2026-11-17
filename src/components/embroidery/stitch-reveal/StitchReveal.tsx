// StitchReveal — the design arrives in stitch order, the way the machine makes it
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import {
  DESIGNS,
  MOTION,
  blockSpans,
  colourChanges,
  fmtStitches,
  threadByCode,
  totalStitches,
  type EmbroideryDesign,
} from '@/lib/embroidery';

export interface StitchRevealProps {
  design?: EmbroideryDesign;
  /** Playback rate in stitches per second. 4000 ≈ a 90s run compressed to ~2s. */
  speed?: number;
  /** `in-view` is the honest default for a hero; `manual` defers to `play`. */
  trigger?: 'in-view' | 'mount' | 'manual';
  /** Only read when `trigger === 'manual'`. */
  play?: boolean;
  /** The travelling needle. Costs one extra element per stroked block. */
  needle?: boolean;
  /** Colour-change list under the hoop. Turn off for decorative use. */
  legend?: boolean;
  onComplete?: () => void;
  className?: string;
}

/**
 * `offset-path` is how the needle travels. It is not universal, and a needle
 * parked at the origin looks broken, so the element is never rendered without
 * support rather than being animated into a wrong position.
 */
const CAN_TRAVEL =
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('offset-path', "path('M 0 0 L 1 1')");

/**
 * An embroidery design that assembles itself in the order it is actually
 * stitched — outline, then stem, then leaves, then the fill that costs half the
 * run — with a needle leading the line and the thread changing under it.
 *
 * A fade-in tells a customer nothing. This is the one moment where the product
 * page can say *this object was made, in this order, by this many stitches*,
 * which is the entire premium of embroidery over print. The sequence is not
 * decorative timing: each block's share of the animation is its share of the
 * real stitch count, so the 2,260-stitch bloom visibly dominates the 280-stitch
 * rule, and a customer who watches it twice has learned where their money goes.
 *
 * Mechanically it is a mask per block. Stroked blocks reveal by sweeping a
 * thick mask stroke along the path (`pathLength=100`, so the maths is
 * resolution-independent); filled blocks reveal by scaling a mask rect, which
 * is how tatami actually lays down — in rows, from one edge. The visible art
 * underneath is dashed into discrete stitch marks, so what appears is stitches
 * arriving, not a line growing.
 *
 * Everything runs on the Web Animations API: a handful of animations created
 * once per reveal, then owned by the browser. No rAF loop, no React state per
 * frame, nothing to leak. Default markup is the *finished* design, so no-JS and
 * reduced-motion users get the artwork rather than an empty hoop.
 */
export function StitchReveal({
  design = DESIGNS[0],
  speed = 4000,
  trigger = 'in-view',
  play = false,
  needle = true,
  legend = true,
  onComplete,
  className = '',
}: StitchRevealProps) {
  const reduced = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const figureRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const animsRef = useRef<Animation[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  /**
   * Held in a ref so an inline `onComplete={() => …}` — which is what everyone
   * writes — cannot land in the effect's dependencies and tear down a reveal
   * that is halfway through running.
   */
  const doneCb = useRef(onComplete);
  doneCb.current = onComplete;

  const [, , vw, vh] = design.viewBox.split(/\s+/).map(Number);
  const spans = blockSpans(design);
  const total = totalStitches(design);
  const totalMs = (total / speed) * 1000;
  /** Reduced motion is the only thing that turns the sequence off. */
  const animate = !reduced;

  /** Hide before first paint — but only if we are actually going to animate. */
  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg || !animate) return;
    svg.querySelectorAll<SVGElement>('[data-sweep]').forEach((el) => {
      if (el.dataset.sweep === 'stroke') el.setAttribute('stroke-dashoffset', '100');
      else el.style.transform = 'scaleY(0)';
    });
    svg.querySelectorAll<SVGElement>('[data-needle]').forEach((el) => {
      el.style.opacity = '0';
    });
  }, [animate, design.id]);

  /** Arm the trigger. One observer, disconnected the moment it has fired. */
  useEffect(() => {
    if (trigger === 'mount') return setRunning(true);
    if (trigger === 'manual') return setRunning(play);
    const el = figureRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return setRunning(true);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRunning(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [trigger, play]);

  useEffect(() => {
    if (!running) return;
    const svg = svgRef.current;
    if (!svg) return;

    if (!animate) {
      setDone(true);
      doneCb.current?.();
      return;
    }

    const anims: Animation[] = [];
    design.blocks.forEach((block, i) => {
      const { start, end } = spans[i];
      const delay = start * totalMs;
      const duration = Math.max(90, (end - start) * totalMs);

      const sweep = svg.querySelector<SVGElement>(`[data-sweep-i="${i}"]`);
      if (sweep) {
        const frames: Keyframe[] =
          sweep.dataset.sweep === 'stroke'
            ? [{ strokeDashoffset: 100 }, { strokeDashoffset: 0 }]
            : [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }];
        anims.push(
          sweep.animate(frames, {
            delay,
            duration,
            // A machine runs at a constant rate. Anything eased here would be a lie.
            easing: block.type === 'fill' ? MOTION.thread : 'linear',
            fill: 'forwards',
          }),
        );
      }

      const tip = svg.querySelector<SVGElement>(`[data-needle-i="${i}"]`);
      if (tip) {
        anims.push(
          tip.animate(
            [
              { offsetDistance: '0%', opacity: 1, offset: 0 },
              { offsetDistance: '100%', opacity: 1, offset: 0.9 },
              { offsetDistance: '100%', opacity: 0, offset: 1 },
            ],
            { delay, duration, easing: 'linear', fill: 'forwards' },
          ),
        );
      }
    });

    animsRef.current = anims;
    const last = anims[anims.length - 1];
    let cancelled = false;
    last?.finished
      .then(() => {
        if (cancelled) return;
        setDone(true);
        doneCb.current?.();
      })
      .catch(() => {
        /* cancelled on unmount — not an error */
      });

    return () => {
      cancelled = true;
      anims.forEach((a) => a.cancel());
      animsRef.current = [];
    };
    // `spans`/`totalMs` are derived from design + speed; listing those is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, animate, design, speed]);

  const changes = colourChanges(design);

  return (
    <figure
      ref={figureRef}
      data-state={done ? 'stitched' : running ? 'stitching' : 'blank'}
      className={`m-0 ${className}`}
    >
      <div className="relative border border-ink bg-bone">
        {/* Hoop rim. Purely structural — it gives the artwork somewhere to be. */}
        <svg
          ref={svgRef}
          viewBox={design.viewBox}
          role="img"
          aria-label={`${design.name} — ${fmtStitches(total)} stitches in ${design.blocks.length} colour blocks`}
          className="block h-auto w-full"
          style={{ aspectRatio: `${vw} / ${vh}` }}
        >
          <defs>
            {/* Stitch grain. One pattern, reused by every filled block. */}
            <pattern
              id={`${uid}-grain`}
              width="3"
              height="3"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(52)"
            >
              <line x1="0" y1="0" x2="0" y2="3" stroke="#000" strokeWidth="0.9" opacity="0.22" />
            </pattern>

            {design.blocks.map((block, i) => {
              const stroked = block.weight != null;
              return (
                <mask
                  key={block.id}
                  id={`${uid}-m-${block.id}`}
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width={vw}
                  height={vh}
                >
                  {stroked ? (
                    <path
                      data-sweep="stroke"
                      data-sweep-i={i}
                      d={block.path}
                      fill="none"
                      stroke="#fff"
                      strokeWidth={(block.weight ?? 2) + 4}
                      strokeLinecap="butt"
                      strokeLinejoin="round"
                      pathLength={100}
                      strokeDasharray={100}
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
              );
            })}
          </defs>

          {design.blocks.map((block) => {
            const thread = threadByCode(block.thread);
            const stroked = block.weight != null;
            const mask = `url(#${uid}-m-${block.id})`;
            return (
              <g key={block.id} mask={mask}>
                {stroked ? (
                  <path
                    d={block.path}
                    fill="none"
                    stroke={thread.hex}
                    strokeWidth={block.weight}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    // Discrete stitch marks rather than a continuous line.
                    strokeDasharray={`${(block.weight ?? 2) * 1.7} ${(block.weight ?? 2) * 0.85}`}
                  />
                ) : (
                  <>
                    <path d={block.path} fill={thread.hex} />
                    <path d={block.path} fill={`url(#${uid}-grain)`} />
                  </>
                )}
              </g>
            );
          })}

          {needle &&
            CAN_TRAVEL &&
            design.blocks.map((block, i) =>
              block.weight == null ? null : (
                <g
                  key={`n-${block.id}`}
                  data-needle=""
                  data-needle-i={i}
                  style={{ offsetPath: `path('${block.path}')`, offsetRotate: '0deg' }}
                >
                  <line x1="0" y1="-13" x2="0" y2="4" stroke="#0c0b0e" strokeWidth="1.4" />
                  <circle r="1.9" fill="#ff4d23" />
                </g>
              ),
            )}
        </svg>
      </div>

      {legend && (
        <figcaption className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/60">
          <span className="text-ink">{design.name}</span>
          <span className="tabular-nums">{fmtStitches(total)} stitches</span>
          <span className="tabular-nums">
            {changes} colour {changes === 1 ? 'change' : 'changes'}
          </span>
          <ol className="flex list-none flex-wrap items-center gap-1 p-0">
            {design.blocks.map((b) => {
              const t = threadByCode(b.thread);
              return (
                <li key={b.id} className="flex items-center gap-1">
                  <span
                    aria-hidden
                    className="block h-3 w-3 border border-ink/30"
                    style={{ background: t.hex }}
                  />
                  <span className="sr-only">
                    {b.label}: thread {t.code} {t.name}
                  </span>
                </li>
              );
            })}
          </ol>
        </figcaption>
      )}
    </figure>
  );
}
