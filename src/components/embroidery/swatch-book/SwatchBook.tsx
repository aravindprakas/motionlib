// SwatchBook — the material sample book, lifted one leaf at a time
import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { DesignArt } from '@/lib/DesignArt';
import {
  DESIGNS,
  DUR,
  FABRICS,
  MOTION,
  definition,
  threadByCode,
  type EmbroideryDesign,
  type Fabric,
} from '@/lib/embroidery';

export interface SwatchBookProps {
  fabrics?: Fabric[];
  /** Drawn small on every swatch, so the material is judged with work on it. */
  design?: EmbroideryDesign;
  index?: number;
  onChange?: (fabric: Fabric, index: number) => void;
  className?: string;
}

/** How far a swatch must be dragged before it counts as lifted. */
const THROW_PX = 90;

/**
 * Weave, as CSS. Cheaper than an image, sharp at any density, recolours with
 * the fabric, and adds nothing to the network. A knit is fine vertical wales, a
 * basket weave is a crosshatch, fleece is a soft dot field, canvas is a hard
 * diagonal, linen is an irregular two-way slub.
 */
function weave(f: Fabric): CSSProperties {
  const dark = 'rgba(0,0,0,0.16)';
  const light = 'rgba(255,255,255,0.12)';
  switch (f.weave.split(',')[0]) {
    case 'Single jersey knit':
      return {
        backgroundImage: `repeating-linear-gradient(90deg, ${dark} 0 1px, transparent 1px 4px), repeating-linear-gradient(0deg, ${light} 0 1px, transparent 1px 6px)`,
      };
    case 'Loop-back':
      return {
        backgroundImage: `radial-gradient(${light} 1px, transparent 1.4px), radial-gradient(${dark} 1px, transparent 1.4px)`,
        backgroundSize: '7px 7px, 7px 7px',
        backgroundPosition: '0 0, 3.5px 3.5px',
      };
    case 'Basket weave':
      return {
        backgroundImage: `repeating-linear-gradient(90deg, ${dark} 0 2px, transparent 2px 5px), repeating-linear-gradient(0deg, ${dark} 0 2px, transparent 2px 5px)`,
      };
    case 'Plain weave':
      return f.id === 'canvas'
        ? {
            backgroundImage: `repeating-linear-gradient(45deg, ${dark} 0 1px, transparent 1px 5px)`,
          }
        : {
            backgroundImage: `repeating-linear-gradient(0deg, ${dark} 0 1px, transparent 1px 5px), repeating-linear-gradient(90deg, ${light} 0 2px, transparent 2px 7px)`,
          };
    default:
      return {};
  }
}

/**
 * The swatch book from the studio wall, on screen: a stack of materials you lift
 * through, one leaf at a time, each carrying the same piece of stitching so the
 * comparison is like for like.
 *
 * Fabric is chosen by hand in real life, and the reason is that the decision is
 * comparative and physical — you hold two grounds against the same thread and
 * one of them is obviously right. A dropdown of fabric names destroys exactly
 * that. A grid of flat colour chips is barely better, because it hides the two
 * properties that decide an embroidery job: what the weave does to fine detail,
 * and how much the ground weighs. Both are on the card here, with the design
 * stitched onto it and a verdict on whether the thread will still read.
 *
 * The stack is the interaction, not an effect: only the top card is draggable,
 * the ones beneath are offset and dimmed in a real z-order, and lifting one
 * settles the rest forward. It is not a carousel — nothing scrolls, and the
 * sideways throw exists because that is how you turn a sample.
 *
 * Every card is also reachable without a pointer: previous/next buttons, arrow
 * keys, and a numbered dot per material. During a drag the transform is written
 * straight to the node; React is told once, on release.
 */
export function SwatchBook({
  fabrics = FABRICS,
  design = DESIGNS[2],
  index: controlled,
  onChange,
  className = '',
}: SwatchBookProps) {
  const reduced = useReducedMotion();
  const [internal, setInternal] = useState(0);
  const index = controlled ?? internal;
  const topRef = useRef<HTMLDivElement>(null);
  const start = useRef(0);
  const dragging = useRef(false);

  const go = useCallback(
    (next: number) => {
      const wrapped = ((next % fabrics.length) + fabrics.length) % fabrics.length;
      if (controlled === undefined) setInternal(wrapped);
      onChange?.(fabrics[wrapped], wrapped);
    },
    [fabrics, controlled, onChange],
  );

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragging.current = true;
    start.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
    const el = topRef.current;
    if (el) el.style.transition = 'none';
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const dx = e.clientX - start.current;
    const el = topRef.current;
    if (!el) return;
    // Paper lifts and turns as it goes — rotation is proportional to travel.
    el.style.transform = `translate3d(${dx}px,${-Math.abs(dx) * 0.06}px,0) rotate(${dx * 0.035}deg)`;
    el.style.opacity = String(Math.max(0.35, 1 - Math.abs(dx) / 420));
  };

  const release = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    const dx = e.clientX - start.current;
    const el = topRef.current;
    if (el) {
      el.style.transition = reduced
        ? 'none'
        : `transform ${DUR.emphasis}ms ${MOTION.fabric}, opacity ${DUR.std}ms linear`;
      el.style.transform = '';
      el.style.opacity = '';
    }
    if (Math.abs(dx) > THROW_PX) go(index + (dx < 0 ? 1 : -1));
  };

  const current = fabrics[index];
  const thread = threadByCode(design.blocks[0].thread);
  const verdict = definition(thread.hex, current.hex);

  return (
    <div className={`grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,230px)] ${className}`}>
      <div
        role="group"
        aria-roledescription="Swatch book"
        aria-label="Fabric samples"
        onKeyDown={(e) => {
          const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (!d) return;
          e.preventDefault();
          go(index + d);
        }}
        tabIndex={-1}
      >
        {/*
          The stack gets its own positioning context. The leaves under the top
          one are `inset-0`, so anything else inside this box — the controls —
          would be sized into and covered by them.
        */}
        <div className="relative">
        {/* Three leaves is enough to read as a stack and costs three nodes. */}
        {[2, 1, 0].map((depth) => {
          const f = fabrics[(index + depth) % fabrics.length];
          const top = depth === 0;
          return (
            <div
              key={depth}
              ref={top ? topRef : undefined}
              onPointerDown={top ? onPointerDown : undefined}
              onPointerMove={top ? onPointerMove : undefined}
              onPointerUp={top ? release : undefined}
              onPointerCancel={top ? release : undefined}
              aria-hidden={!top}
              className={`${top ? 'relative touch-none cursor-grab select-none active:cursor-grabbing' : 'pointer-events-none absolute inset-0'} border border-ink`}
              style={{
                transform: top ? undefined : `translate(${depth * 10}px, ${depth * 8}px)`,
                zIndex: 10 - depth,
                opacity: top ? 1 : 0.55 - depth * 0.15,
                transition: reduced ? 'none' : `transform ${DUR.emphasis}ms ${MOTION.fabric}`,
              }}
            >
              <div className="relative" style={{ background: f.hex }}>
                <div aria-hidden className="absolute inset-0" style={weave(f)} />
                <div className="relative flex items-center justify-between gap-4 p-6">
                  <DesignArt
                    design={design}
                    grain={false}
                    className="h-24 w-24 shrink-0"
                    aria-hidden={!top}
                  />
                  <div className="text-right">
                    <p
                      className="font-mono text-[10px] uppercase tracking-[0.2em]"
                      style={{ color: f.gsm > 300 || f.id === 'brushed-fleece' ? '#ece6d8' : '#0c0b0e', opacity: 0.6 }}
                    >
                      {f.gsm} gsm
                    </p>
                    <p
                      className="mt-1 font-mono text-sm uppercase tracking-[0.1em]"
                      style={{ color: f.id === 'brushed-fleece' ? '#ece6d8' : '#0c0b0e' }}
                    >
                      {f.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </div>

        {/* Clears the two leaves peeking out below the top card. */}
        <div className="mt-8 flex items-center gap-2">
          <button
            type="button"
            onClick={() => go(index - 1)}
            className="grid h-11 w-11 place-items-center border border-ink transition-colors hover:bg-ink hover:text-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span aria-hidden>←</span>
            <span className="sr-only">Previous fabric</span>
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            className="grid h-11 w-11 place-items-center border border-ink transition-colors hover:bg-ink hover:text-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span aria-hidden>→</span>
            <span className="sr-only">Next fabric</span>
          </button>
          <ul className="ml-2 flex list-none gap-1 p-0">
            {fabrics.map((f, i) => (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-current={i === index ? 'true' : undefined}
                  className="grid h-11 w-6 place-items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <span
                    aria-hidden
                    className={`block h-3 w-3 border border-ink transition-colors ${
                      i === index ? 'bg-ink' : 'bg-transparent'
                    }`}
                    style={{ transitionDuration: reduced ? '0ms' : `${DUR.micro}ms` }}
                  />
                  <span className="sr-only">{f.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* The spec sheet. This is what the stack exists to deliver. */}
      <dl aria-live="polite" className="grid content-start gap-4 border border-ink p-5">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink/55">Material</dt>
          <dd className="mt-1 font-mono text-sm uppercase tracking-[0.08em] text-ink">
            {current.name}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink/55">Weight</dt>
          <dd className="mt-1 font-mono text-sm tabular-nums text-ink">{current.gsm} gsm</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink/55">Weave</dt>
          <dd className="mt-1 font-mono text-[11px] text-ink">{current.weave}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink/55">Stretch</dt>
          <dd className="mt-1 font-mono text-[11px] text-ink">{current.stretch}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink/55">
            Stitching on it
          </dt>
          <dd
            className={`mt-1 font-mono text-[11px] leading-relaxed ${
              verdict === 'lost' ? 'text-vermilion' : 'text-ink'
            }`}
          >
            {current.note}
          </dd>
        </div>
      </dl>
    </div>
  );
}
