// ui-16 — DraggableInertiaSlider
import { useEffect, useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface DraggableInertiaSliderProps {
  items: ReactNode[];
  /** Gap between items in px. Default 16. */
  gap?: number;
  /** Snap to the nearest item edge after the momentum decays. Default false. */
  snap?: boolean;
  className?: string;
}

/**
 * Infinite, draggable slider with momentum — no paid InertiaPlugin. Items are
 * rendered 3× and the raw drag offset is wrapped modulo one copy's width, so
 * the loop never shows an edge.
 *
 * Inertia math: on release, velocity decays exponentially
 * (v *= e^(−dt/τ), τ = 0.35s) inside one rAF loop, integrating into the same
 * motion value the drag writes to. With `snap`, once the projected rest point
 * is known the remaining distance is retargeted to the nearest item edge.
 * Reduced motion: native overflow-x scrolling.
 */
export function DraggableInertiaSlider({
  items,
  gap = 16,
  snap = false,
  className = '',
}: DraggableInertiaSliderProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const chunkRef = useRef<HTMLDivElement>(null);
  const chunkWidth = useRef(1);
  const slotWidth = useRef(1);
  const rafRef = useRef(0);
  const reduced = useReducedMotion();

  const x = useMotionValue(0);
  // Wrap into (-chunkWidth, 0] — with 3 copies the seam is never visible.
  const wrapped = useTransform(x, (v) => {
    const w = chunkWidth.current;
    return ((v % w) + w) % w === 0 ? 0 : -(((-v % w) + w) % w);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const measure = () => {
      const chunk = chunkRef.current;
      if (!chunk) return;
      chunkWidth.current = Math.max(1, chunk.offsetWidth + gap);
      slotWidth.current = Math.max(1, chunkWidth.current / Math.max(1, items.length));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      cancelAnimationFrame(rafRef.current);
    };
  }, [gap, items.length]);

  const stopInertia = () => cancelAnimationFrame(rafRef.current);

  const onPan = (_: PointerEvent, info: PanInfo) => {
    x.set(x.get() + info.delta.x);
  };

  const onPanEnd = (_: PointerEvent, info: PanInfo) => {
    let v = info.velocity.x; // px/s
    const tau = 0.35; // decay time constant (s)

    // Projected travel of an exponential decay = v * τ. Used to pick the
    // snap target up front so the decay lands exactly on an item edge.
    let target: number | null = null;
    if (snap) {
      const rest = x.get() + v * tau;
      target = Math.round(rest / slotWidth.current) * slotWidth.current;
    }

    let lastT = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;

      if (target !== null) {
        // Critically-damped approach to the snap target.
        const next = x.get() + (target - x.get()) * Math.min(1, dt * 8);
        x.set(next);
        if (Math.abs(target - next) < 0.5) {
          x.set(target);
          return;
        }
      } else {
        v *= Math.exp(-dt / tau);
        x.set(x.get() + v * dt);
        if (Math.abs(v) < 20) return;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  if (reduced) {
    return (
      <div className={`overflow-x-auto ${className}`}>
        <div className="flex w-max" style={{ gap }}>
          {items.map((item, i) => (
            <div key={i} className="shrink-0">
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`cursor-grab touch-pan-y overflow-hidden active:cursor-grabbing ${className}`}>
      <motion.div
        ref={rowRef}
        onPointerDown={stopInertia}
        onPan={onPan}
        onPanEnd={onPanEnd}
        style={{ x: wrapped, gap }}
        className="flex w-max select-none will-change-transform"
      >
        {[0, 1, 2].map((copy) => (
          <div
            key={copy}
            ref={copy === 0 ? chunkRef : undefined}
            aria-hidden={copy > 0 || undefined}
            className="flex shrink-0"
            style={{ gap }}
          >
            {items.map((item, i) => (
              <div key={i} className="shrink-0">
                {item}
              </div>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
