// Shockwave — stagger by distance travelled, not by index
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface ShockwaveHandle {
  /** Fire a front from a point in the field's own coordinate space. */
  fire: (x: number, y: number) => void;
  /** Fire from the centre of any element inside the field. */
  fireFrom: (el: Element) => void;
}

export interface ShockwaveProps {
  children: ReactNode;
  /** Which descendants the front acts on. */
  selector?: string;
  /** Front speed, px per second. Low speeds read as a slow swell. */
  speed?: number;
  /** Thickness of the band, px. Wider = softer, more overlapping. */
  width?: number;
  /** Distance at which the front has spent itself, px. */
  reach?: number;
  /** `press` fires where you click; `hover` fires on entry; `none` is manual. */
  trigger?: 'press' | 'hover' | 'none';
  /** Called once as the front reaches each target — good for sound or haptics. */
  onArrive?: (el: HTMLElement, index: number) => void;
  className?: string;
}

interface Target {
  el: HTMLElement;
  x: number;
  y: number;
  hit: boolean;
}

interface Front {
  x: number;
  y: number;
  t0: number;
  targets: Target[];
}

/**
 * A wave that crosses a layout at a fixed speed, moving each element as it
 * arrives.
 *
 * Every stagger in common use is really `index * delay`: the sixth item waits
 * six steps whether it sits beside the first or across the page from it. That
 * is fine for a list and wrong for anything two-dimensional — a grid staggered
 * by index visibly sweeps in reading order no matter where you touched it.
 * Here the delay is geometry: each target's distance from the origin divided by
 * a speed in px/s, so the front spreads as a circle, arrives at near neighbours
 * first, and reads as a single physical event rather than a queue.
 *
 * Targets are written to imperatively as the CSS custom properties `--wave`
 * (0 → 1 as the band passes) and `--wave-dx` / `--wave-dy` (the unit vector
 * pointing away from the origin), so the field never re-renders and the motion
 * is entirely the consumer's to define. Multiple fronts overlap by taking the
 * strongest. Reduced motion skips the propagation and leaves `--wave` at 0.
 */
export const Shockwave = forwardRef<ShockwaveHandle, ShockwaveProps>(function Shockwave(
  {
    children,
    selector = '[data-wave]',
    speed = 1100,
    width = 220,
    reach = 2400,
    trigger = 'press',
    onArrive,
    className = '',
  },
  ref,
) {
  const box = useRef<HTMLDivElement>(null);
  const fronts = useRef<Front[]>([]);
  const raf = useRef(0);
  const reduced = useReducedMotion();
  const arriveRef = useRef(onArrive);
  arriveRef.current = onArrive;

  /** Measure at fire time: the layout may have moved since the last wave. */
  const measure = useCallback((): Target[] => {
    const root = box.current;
    if (!root) return [];
    const base = root.getBoundingClientRect();
    return Array.from(root.querySelectorAll<HTMLElement>(selector)).map((el) => {
      const r = el.getBoundingClientRect();
      return {
        el,
        x: r.left - base.left + r.width / 2,
        y: r.top - base.top + r.height / 2,
        hit: false,
      };
    });
  }, [selector]);

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
  }, []);

  const frame = useCallback(() => {
    const now = performance.now();
    const live: Front[] = [];
    const strongest = new Map<HTMLElement, { v: number; dx: number; dy: number }>();

    for (const front of fronts.current) {
      const radius = ((now - front.t0) / 1000) * speed;
      let alive = false;

      for (let i = 0; i < front.targets.length; i++) {
        const t = front.targets[i];
        const dx = t.x - front.x;
        const dy = t.y - front.y;
        const dist = Math.hypot(dx, dy);
        const delta = radius - dist;
        if (delta < -width) {
          alive = true; // front has not reached this one yet
          continue;
        }
        if (delta > width) {
          // Already passed: settle back to rest unless another front owns it.
          if (!strongest.has(t.el)) strongest.set(t.el, { v: 0, dx: 0, dy: 0 });
          continue;
        }

        alive = true;
        if (!t.hit && delta >= 0) {
          t.hit = true;
          arriveRef.current?.(t.el, i);
        }
        // Gaussian band, faded by how far the front has already travelled.
        const band = Math.exp(-((delta / (width * 0.5)) ** 2));
        const spent = Math.max(0, 1 - dist / reach);
        const v = band * spent;
        const prev = strongest.get(t.el);
        if (!prev || v > prev.v) {
          const len = dist || 1;
          strongest.set(t.el, { v, dx: dx / len, dy: dy / len });
        }
      }

      if (alive && radius < reach + width) live.push(front);
      else front.targets.forEach((t) => strongest.set(t.el, strongest.get(t.el) ?? { v: 0, dx: 0, dy: 0 }));
    }

    strongest.forEach((s, el) => {
      el.style.setProperty('--wave', s.v.toFixed(4));
      el.style.setProperty('--wave-dx', s.dx.toFixed(3));
      el.style.setProperty('--wave-dy', s.dy.toFixed(3));
    });

    fronts.current = live;
    if (live.length) raf.current = requestAnimationFrame(frame);
    else raf.current = 0;
  }, [reach, speed, width]);

  const fire = useCallback(
    (x: number, y: number) => {
      if (reduced) return;
      fronts.current.push({ x, y, t0: performance.now(), targets: measure() });
      if (!raf.current) raf.current = requestAnimationFrame(frame);
    },
    [frame, measure, reduced],
  );

  useImperativeHandle(
    ref,
    () => ({
      fire,
      fireFrom(el) {
        const root = box.current;
        if (!root) return;
        const base = root.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        fire(r.left - base.left + r.width / 2, r.top - base.top + r.height / 2);
      },
    }),
    [fire],
  );

  useEffect(() => stop, [stop]);

  const fireAt = (e: ReactPointerEvent<HTMLDivElement>) => {
    const base = e.currentTarget.getBoundingClientRect();
    fire(e.clientX - base.left, e.clientY - base.top);
  };

  return (
    <div
      ref={box}
      className={className}
      onPointerDown={trigger === 'press' ? fireAt : undefined}
      onPointerEnter={trigger === 'hover' ? fireAt : undefined}
    >
      {children}
    </div>
  );
});
