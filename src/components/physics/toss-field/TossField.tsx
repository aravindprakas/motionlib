// TossField — grab, fling, watch it land: momentum handed back to the pointer
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

interface Body {
  el: HTMLElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  spin: number;
  w: number;
  h: number;
  held: boolean;
  asleep: boolean;
}

interface FieldApi {
  register: (el: HTMLElement, seed: { x: number; y: number }) => () => void;
  grab: (el: HTMLElement, e: ReactPointerEvent) => void;
}

const FieldContext = createContext<FieldApi | null>(null);

export interface TossFieldProps {
  children: ReactNode;
  /** px/s². 0 turns the field into an air-hockey table. */
  gravity?: number;
  /** Wall bounce, 0 → 1. Above ~0.8 nothing ever settles. */
  restitution?: number;
  /** Fraction of speed kept per second in flight. */
  drag?: number;
  /** Resolve item-to-item overlap so thrown things knock into each other. */
  collide?: boolean;
  className?: string;
}

const SLEEP_SPEED = 12;

/**
 * A bounded space where its children can be picked up and thrown.
 *
 * The interesting half is the release. A drag that ends in a transition back to
 * a resting position throws away the one thing the pointer told you — how fast
 * it was moving and where it was headed — and every user notices, because they
 * flicked and the flick did nothing. Here the pointer's velocity, sampled over
 * the last few moves so a jittery final event cannot dominate it, becomes the
 * body's velocity, and from that moment a small integrator owns the element:
 * gravity, air drag, walls with restitution, and (optionally) collisions with
 * the other bodies, until everything is slow enough to sleep and the loop stops.
 *
 * State lives in refs and is written straight to `transform`, so a field of
 * fifty bodies re-renders React zero times. Under reduced motion things can
 * still be dragged, they simply stop dead where you drop them.
 */
export function TossField({
  children,
  gravity = 1800,
  restitution = 0.55,
  drag = 0.55,
  collide = true,
  className = '',
}: TossFieldProps) {
  const box = useRef<HTMLDivElement>(null);
  const bodies = useRef<Body[]>([]);
  const raf = useRef(0);
  const reduced = useReducedMotion();
  const opts = useRef({ gravity, restitution, drag, collide, reduced });
  opts.current = { gravity, restitution, drag, collide, reduced };

  const write = (b: Body) => {
    b.el.style.transform = `translate3d(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px, 0) rotate(${b.angle.toFixed(2)}deg)`;
  };

  const step = useRef<() => void>(() => {});
  step.current = () => {
    const root = box.current;
    if (!root) return;
    const { gravity: g, restitution: e, drag: dragK, collide: doCollide, reduced: still } = opts.current;
    const W = root.clientWidth;
    const H = root.clientHeight;
    const dt = 1 / 60;
    let awake = false;

    for (const b of bodies.current) {
      if (b.held) {
        awake = true;
        continue;
      }
      if (b.asleep || still) continue;

      b.vy += g * dt;
      const keep = Math.pow(dragK, dt);
      b.vx *= keep;
      b.vy *= keep;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.angle += b.spin * dt;
      b.spin *= Math.pow(0.4, dt);

      // Walls. Horizontal contact also scrubs off spin, like a ball on a cushion.
      if (b.x < 0) {
        b.x = 0;
        b.vx = -b.vx * e;
        b.spin *= -0.5;
      } else if (b.x + b.w > W) {
        b.x = W - b.w;
        b.vx = -b.vx * e;
        b.spin *= -0.5;
      }
      if (b.y < 0) {
        b.y = 0;
        b.vy = -b.vy * e;
      } else if (b.y + b.h > H) {
        b.y = H - b.h;
        b.vy = -b.vy * e;
        b.vx *= 0.86;
        b.spin *= 0.7;
      }

      // With gravity off nothing ever rests on the floor, so speed alone decides.
      const grounded = g === 0 || b.y + b.h >= H - 0.5;
      if (grounded && Math.hypot(b.vx, b.vy) < SLEEP_SPEED && Math.abs(b.spin) < 4) {
        b.vx = b.vy = b.spin = 0;
        b.asleep = true;
      } else {
        awake = true;
      }
      write(b);
    }

    // Separate overlapping pairs along their shallowest axis and trade momentum.
    if (doCollide && !still) {
      const list = bodies.current;
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const a = list[i];
          const b = list[j];
          const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
          const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
          if (ox <= 0 || oy <= 0) continue;

          const axisX = ox < oy;
          const sign = axisX ? Math.sign(b.x - a.x) || 1 : Math.sign(b.y - a.y) || 1;
          const push = (axisX ? ox : oy) / 2;
          const shiftA = a.held ? 0 : b.held ? push * 2 : push;
          const shiftB = b.held ? 0 : a.held ? push * 2 : push;

          if (axisX) {
            a.x -= sign * shiftA;
            b.x += sign * shiftB;
            const rel = (b.vx - a.vx) * (1 + e) * 0.5;
            if (!a.held) a.vx += rel;
            if (!b.held) b.vx -= rel;
          } else {
            a.y -= sign * shiftA;
            b.y += sign * shiftB;
            const rel = (b.vy - a.vy) * (1 + e) * 0.5;
            if (!a.held) a.vy += rel;
            if (!b.held) b.vy -= rel;
          }
          a.asleep = b.asleep = false;
          awake = true;
          write(a);
          write(b);
        }
      }
    }

    raf.current = awake ? requestAnimationFrame(() => step.current()) : 0;
  };

  const wake = () => {
    if (!raf.current) raf.current = requestAnimationFrame(() => step.current());
  };

  const api = useMemo<FieldApi>(
    () => ({
      register(el, seed) {
        const root = box.current;
        const W = root?.clientWidth ?? 0;
        const H = root?.clientHeight ?? 0;
        const body: Body = {
          el,
          x: seed.x * Math.max(0, W - el.offsetWidth),
          y: seed.y * Math.max(0, H - el.offsetHeight),
          vx: 0,
          vy: 0,
          angle: 0,
          spin: 0,
          w: el.offsetWidth,
          h: el.offsetHeight,
          held: false,
          asleep: false,
        };
        bodies.current.push(body);
        write(body);
        wake();
        return () => {
          bodies.current = bodies.current.filter((b) => b !== body);
        };
      },

      grab(el, e) {
        const body = bodies.current.find((b) => b.el === el);
        const root = box.current;
        if (!body || !root) return;
        el.setPointerCapture(e.pointerId);
        body.held = true;
        body.asleep = false;
        body.spin = 0;

        const base = root.getBoundingClientRect();
        const offX = e.clientX - base.left - body.x;
        const offY = e.clientY - base.top - body.y;
        // A short history, so one stuttering last event cannot define the throw.
        const trail: { x: number; y: number; t: number }[] = [
          { x: e.clientX, y: e.clientY, t: performance.now() },
        ];

        const move = (ev: PointerEvent) => {
          body.x = ev.clientX - base.left - offX;
          body.y = ev.clientY - base.top - offY;
          write(body);
          trail.push({ x: ev.clientX, y: ev.clientY, t: performance.now() });
          if (trail.length > 6) trail.shift();
        };

        const up = () => {
          el.removeEventListener('pointermove', move);
          el.removeEventListener('pointerup', up);
          el.removeEventListener('pointercancel', up);
          body.held = false;

          const now = performance.now();
          const first = trail.find((p) => now - p.t < 90) ?? trail[0];
          const last = trail[trail.length - 1];
          const dt = Math.max(16, last.t - first.t) / 1000;
          if (!opts.current.reduced) {
            body.vx = (last.x - first.x) / dt;
            body.vy = (last.y - first.y) / dt;
            body.spin = Math.max(-900, Math.min(900, body.vx * 0.35));
          }
          wake();
        };

        el.addEventListener('pointermove', move);
        el.addEventListener('pointerup', up);
        el.addEventListener('pointercancel', up);
        wake();
      },
    }),
    [],
  );

  useEffect(() => {
    const root = box.current;
    if (!root) return;
    // Keep bodies inside the box when it changes size, then let them settle.
    const ro = new ResizeObserver(() => {
      const W = root.clientWidth;
      const H = root.clientHeight;
      for (const b of bodies.current) {
        b.w = b.el.offsetWidth;
        b.h = b.el.offsetHeight;
        b.x = Math.max(0, Math.min(b.x, W - b.w));
        b.y = Math.max(0, Math.min(b.y, H - b.h));
        b.asleep = false;
        write(b);
      }
      wake();
    });
    ro.observe(root);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
  }, []);

  return (
    <FieldContext.Provider value={api}>
      <div ref={box} className={'relative overflow-hidden ' + className}>
        {children}
      </div>
    </FieldContext.Provider>
  );
}

export interface TossItemProps {
  children: ReactNode;
  /** Start position as a fraction of the free space, 0 → 1 on each axis. */
  x?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
}

/** A body in the field. Anything can be one — text, an image, a whole card. */
export function TossItem({ children, x = 0.5, y = 0, className = '', style }: TossItemProps) {
  const field = useContext(FieldContext);
  const el = useRef<HTMLDivElement>(null);
  const seed = useRef({ x, y });

  useEffect(() => {
    if (!field || !el.current) return;
    return field.register(el.current, seed.current);
  }, [field]);

  return (
    <div
      ref={el}
      onPointerDown={(e) => {
        e.preventDefault();
        if (el.current) field?.grab(el.current, e);
      }}
      className={'absolute left-0 top-0 cursor-grab touch-none select-none active:cursor-grabbing ' + className}
      style={{ willChange: 'transform', ...style }}
    >
      {children}
    </div>
  );
}
