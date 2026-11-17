// HoopStage — put the design where it will actually sit, at the size it will actually be
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { DesignArt } from '@/lib/DesignArt';
import {
  DESIGNS,
  DUR,
  GARMENTS,
  MOTION,
  type EmbroideryDesign,
  type Garment,
  type PlacementZone,
} from '@/lib/embroidery';

export interface Placement {
  /**
   * Centre of the design in the garment's viewBox units — the same space the
   * silhouette and its zones are authored in, converted to percentages only at
   * the moment of rendering.
   */
  x: number;
  y: number;
  /** Finished width on the cloth, in millimetres. */
  widthMm: number;
  /** Snapped zone, or null when placed freely. */
  zoneId: string | null;
}

export interface HoopStageProps {
  design?: EmbroideryDesign;
  garment?: Garment;
  value?: Placement;
  onChange?: (placement: Placement) => void;
  /** Distance in garment viewBox units within which a drag snaps to a zone. */
  snapRadius?: number;
  className?: string;
}

const NUDGE_MM = 2;
const NUDGE_COARSE_MM = 10;

/** Keeps the design's centre inside the garment box with a little margin. */
const clamp = (v: number, max: number) => Math.max(max * 0.04, Math.min(max * 0.96, v));

/**
 * Placement, at true scale, on the garment it is going onto.
 *
 * Placement is the decision customers get wrong most often and complain about
 * most expensively, because "left chest" is a phrase, not a size. A 90mm crest
 * and a 260mm back piece are the same words on an order form and completely
 * different garments in the post. Here the design is drawn against the
 * silhouette at its real proportion of a real chest width, so a design that is
 * too big for a zone *looks* too big before anyone pays for it, and the zone
 * ceiling is enforced rather than described.
 *
 * The drag is the fast path, not the only path: every zone is also a button,
 * the hoop takes arrow keys in 2mm steps (10mm with Shift), and the current
 * position is announced. Nothing here is reachable by pointer alone.
 *
 * During a drag, position is written straight to the element's transform and
 * React is not told — one style write per pointer event, no re-render, no
 * layout. State is committed once on release, which is also the only moment the
 * snap transition is allowed to run.
 */
export function HoopStage({
  design = DESIGNS[0],
  garment = GARMENTS[0],
  value,
  onChange,
  snapRadius = 22,
  className = '',
}: HoopStageProps) {
  const reduced = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const hoopRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const origin = useRef({ x: 0, y: 0 });
  const from = useRef<{ x: number; y: number } | null>(null);
  const [, , gw, gh] = garment.viewBox.split(/\s+/).map(Number);

  const [internal, setInternal] = useState<Placement>(() => {
    const zone = garment.zones[0];
    return { x: zone.x, y: zone.y, widthMm: Math.min(design.widthMm, zone.maxWidthMm), zoneId: zone.id };
  });
  const placement = value ?? internal;

  const commit = useCallback(
    (next: Placement) => {
      // Where it is *now*, captured before React moves it. Every route into a
      // new placement — drag, zone button, arrow key — settles the same way.
      const hoop = hoopRef.current;
      if (hoop) {
        const r = hoop.getBoundingClientRect();
        from.current = { x: r.left, y: r.top };
      }
      if (value === undefined) setInternal(next);
      onChange?.(next);
    },
    [value, onChange],
  );

  /** Design width as a percentage of the garment box — the true-scale link. */
  const widthPct = (placement.widthMm / garment.widthMm) * 100;
  const aspect = design.heightMm / design.widthMm;
  const zone = garment.zones.find((z) => z.id === placement.zoneId) ?? null;
  const oversize = zone ? placement.widthMm > zone.maxWidthMm : false;

  /** Client pixels → garment units. One rect read per event, no writes before it. */
  const pointFrom = (e: ReactPointerEvent) => {
    const stage = stageRef.current;
    if (!stage) return null;
    const r = stage.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    return {
      x: clamp(((e.clientX - r.left) / r.width) * gw, gw),
      y: clamp(((e.clientY - r.top) / r.height) * gh, gh),
    };
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    dragging.current = true;
    origin.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
    const hoop = hoopRef.current;
    if (hoop) hoop.style.transition = 'none';
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const hoop = hoopRef.current;
    if (!hoop) return;
    // Transform only, so a drag is composited: no layout, no React, one write.
    const dx = e.clientX - origin.current.x;
    const dy = e.clientY - origin.current.y;
    hoop.style.transform = `translate(-50%,-50%) translate3d(${dx}px,${dy}px,0)`;
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    const p = pointFrom(e);
    if (!p) {
      hoopRef.current?.style.removeProperty('transform');
      return;
    }

    let nearest: PlacementZone | null = null;
    let nearestDistance = Infinity;
    for (const z of garment.zones) {
      const d = Math.hypot(z.x - p.x, z.y - p.y);
      if (d < nearestDistance) {
        nearest = z;
        nearestDistance = d;
      }
    }

    // commit() captures the dragged position for the settle; the inline
    // transform has to come off in the same tick so the effect measures clean.
    if (nearest && nearestDistance <= snapRadius) {
      commit({
        x: nearest.x,
        y: nearest.y,
        widthMm: Math.min(placement.widthMm, nearest.maxWidthMm),
        zoneId: nearest.id,
      });
    } else {
      commit({ ...placement, x: p.x, y: p.y, zoneId: null });
    }
    hoopRef.current?.style.removeProperty('transform');
  };

  const nudge = (dx: number, dy: number, coarse: boolean) => {
    const mm = coarse ? NUDGE_COARSE_MM : NUDGE_MM;
    // Millimetres are the unit the customer is thinking in; convert once, here.
    const step = (mm / garment.widthMm) * gw;
    commit({
      ...placement,
      x: clamp(placement.x + dx * step, gw),
      y: clamp(placement.y + dy * step, gh),
      zoneId: null,
    });
  };

  const toZone = (id: string) => {
    const z = garment.zones.find((g) => g.id === id);
    if (!z) return;
    commit({ x: z.x, y: z.y, widthMm: Math.min(placement.widthMm, z.maxWidthMm), zoneId: z.id });
  };

  /**
   * FLIP: the new position is already committed, so measure the gap the commit
   * created, jump back across it with a transform, and release. What animates
   * is a transform on one element — `left`/`top` only ever get set, never
   * transitioned.
   */
  useLayoutEffect(() => {
    const hoop = hoopRef.current;
    const prev = from.current;
    from.current = null;
    if (!hoop || !prev || reduced) return;
    const now = hoop.getBoundingClientRect();
    const dx = prev.x - now.x;
    const dy = prev.y - now.y;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
    hoop.style.transition = 'none';
    hoop.style.transform = `translate(-50%,-50%) translate3d(${dx}px,${dy}px,0)`;
    const id = requestAnimationFrame(() => {
      hoop.style.transition = `transform ${DUR.emphasis}ms ${MOTION.settle}`;
      hoop.style.transform = '';
    });
    return () => cancelAnimationFrame(id);
  }, [placement, reduced]);

  const settle = reduced ? 'none' : `width ${DUR.std}ms ${MOTION.fabric}`;

  return (
    <div className={`grid gap-6 md:grid-cols-[minmax(0,1fr)_260px] ${className}`}>
      <div
        ref={stageRef}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative touch-none select-none border border-ink bg-bone"
      >
        <svg
          viewBox={garment.viewBox}
          aria-hidden
          className="block h-auto w-full"
          style={{ aspectRatio: '200 / 240' }}
        >
          <path d={garment.path} fill="#e2dbcb" stroke="#0c0b0e" strokeWidth="1.2" strokeLinejoin="round" />
          {garment.detail && (
            <path d={garment.detail} fill="none" stroke="#0c0b0e" strokeWidth="0.6" opacity="0.35" />
          )}
        </svg>

        {/* Zone targets. Visible while dragging, so the snap is predictable. */}
        {garment.zones.map((z) => (
          <span
            key={z.id}
            aria-hidden
            className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 border border-dashed transition-opacity ${
              placement.zoneId === z.id ? 'border-accent opacity-100' : 'border-ink/40 opacity-45'
            }`}
            style={{
              left: `${(z.x / gw) * 100}%`,
              top: `${(z.y / gh) * 100}%`,
              width: `${(z.maxWidthMm / garment.widthMm) * 100}%`,
              aspectRatio: '1',
              transitionDuration: reduced ? '0ms' : `${DUR.std}ms`,
            }}
          />
        ))}

        <div
          ref={hoopRef}
          className="absolute -translate-x-1/2 -translate-y-1/2 [&[data-dragging]]:transition-none"
          style={{
            left: `${(placement.x / gw) * 100}%`,
            top: `${(placement.y / gh) * 100}%`,
            width: `${widthPct}%`,
            transition: settle,
          }}
        >
          <button
            type="button"
            onPointerDown={onPointerDown}
            onKeyDown={(e) => {
              const map: Record<string, [number, number]> = {
                ArrowLeft: [-1, 0],
                ArrowRight: [1, 0],
                ArrowUp: [0, -1],
                ArrowDown: [0, 1],
              };
              const d = map[e.key];
              if (!d) return;
              e.preventDefault();
              nudge(d[0], d[1], e.shiftKey);
            }}
            aria-label={`Design placement. ${zone ? zone.label : 'Free position'}, ${Math.round(placement.widthMm)} millimetres wide. Use arrow keys to move, Shift plus arrow for larger steps.`}
            className="block w-full cursor-grab touch-none border border-dashed border-ink/50 bg-transparent p-0 active:cursor-grabbing focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            style={{ aspectRatio: `1 / ${aspect}` }}
          >
            <DesignArt design={design} grain={false} className="block h-full w-full" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink/55">Placement</p>
          <ul className="mt-3 grid list-none grid-cols-2 gap-px border border-ink bg-ink p-0 md:grid-cols-1">
            {garment.zones.map((z) => (
              <li key={z.id}>
                <button
                  type="button"
                  onClick={() => toZone(z.id)}
                  aria-pressed={placement.zoneId === z.id}
                  className={`flex min-h-[44px] w-full items-baseline justify-between gap-3 px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.14em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent ${
                    placement.zoneId === z.id ? 'bg-ink text-bone' : 'bg-bone text-ink/70 hover:text-ink'
                  }`}
                  style={{ transitionDuration: reduced ? '0ms' : `${DUR.micro}ms` }}
                >
                  {z.label}
                  <span className="tabular-nums opacity-60">≤{z.maxWidthMm}mm</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <label
            htmlFor="hoop-size"
            className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.24em] text-ink/55"
          >
            Width
            <span className="tabular-nums text-ink">{Math.round(placement.widthMm)} mm</span>
          </label>
          <input
            id="hoop-size"
            type="range"
            min={30}
            max={zone ? zone.maxWidthMm : 300}
            step={1}
            value={Math.round(placement.widthMm)}
            onChange={(e) => commit({ ...placement, widthMm: Number(e.target.value) })}
            className="mt-3 w-full accent-vermilion"
          />
          <p className="mt-2 font-mono text-[10px] leading-relaxed text-ink/50">
            {zone
              ? `${zone.label} takes up to ${zone.maxWidthMm}mm.`
              : 'Free placement — drag onto a marked zone to constrain it.'}
          </p>
        </div>

        <p
          aria-live="polite"
          className={`font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] ${
            oversize ? 'text-vermilion' : 'text-ink/55'
          }`}
        >
          {oversize
            ? `Too wide for ${zone?.label}. Reduce to ${zone?.maxWidthMm}mm.`
            : `${zone ? zone.label : 'Free position'} · ${Math.round(placement.widthMm)}×${Math.round(placement.widthMm * aspect)} mm`}
        </p>
      </div>
    </div>
  );
}
