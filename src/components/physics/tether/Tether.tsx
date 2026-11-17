// Tether — real rope between two DOM nodes, simulated and drawn every frame
import { useEffect, useRef, type ReactNode } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface TetherLink {
  /** `data-anchor` value of the node the rope starts at. */
  from: string;
  /** `data-anchor` value of the node it ends at. */
  to: string;
  /** Extra rope length as a fraction of the initial gap. 0 = taut, 0.5 = lazy. */
  slack?: number;
  segments?: number;
  width?: number;
  /** Any CSS colour; inherits `currentColor` by default. */
  color?: string;
}

export interface TetherFieldProps {
  children: ReactNode;
  links: TetherLink[];
  /** px/s². Set 0 for a zero-gravity cable that only reacts to movement. */
  gravity?: number;
  /** Velocity kept per frame. Below ~0.9 the rope feels wet. */
  damping?: number;
  /** Constraint relaxation passes. More = stiffer rope, more work. */
  iterations?: number;
  /** Pointer influence radius in px. 0 disables pointer deflection. */
  pointerRadius?: number;
  className?: string;
}

/** Spread onto any element to make it a rope endpoint. */
export function anchor(id: string) {
  return { 'data-anchor': id } as const;
}

interface Rope {
  link: TetherLink;
  x: Float64Array;
  y: Float64Array;
  px: Float64Array;
  py: Float64Array;
  restLen: number;
  ready: boolean;
}

const DT = 1 / 60;

/**
 * Hangs a simulated rope between two elements and keeps it hanging while they
 * move.
 *
 * Connector lines in UI are almost always geometry — a bezier recomputed from
 * two rectangles, which snaps instantly and has no memory of where it just was.
 * A rope has both. This runs a Verlet solver (integrate, then relax the distance
 * constraints a few passes) over a chain of points pinned to the two anchors, so
 * the cable sags under gravity, whips when you drag an endpoint, goes taut when
 * the gap exceeds its length, and swings past the mark before settling. None of
 * that is keyframed; it falls out of the solver, which is why it holds up under
 * movement no timeline could have anticipated.
 *
 * Anchors are found by `data-anchor` and re-measured every frame, so it does not
 * care how they move — drag, CSS transition, layout reflow. The field is one rAF
 * loop writing `points` on one polyline per rope, and reduced motion draws the
 * same ropes as a static quadratic sag.
 */
export function TetherField({
  children,
  links,
  gravity = 1500,
  damping = 0.97,
  iterations = 8,
  pointerRadius = 120,
  className = '',
}: TetherFieldProps) {
  const box = useRef<HTMLDivElement>(null);
  const lines = useRef<(SVGPolylineElement | null)[]>([]);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = box.current;
    if (!root) return;

    const centre = (id: string) => {
      const el = root.querySelector<HTMLElement>('[data-anchor="' + id + '"]');
      if (!el) return null;
      const base = root.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return { x: r.left - base.left + r.width / 2, y: r.top - base.top + r.height / 2 };
    };

    const ropes: Rope[] = links.map((link) => {
      const n = Math.max(4, link.segments ?? 20);
      return {
        link,
        x: new Float64Array(n),
        y: new Float64Array(n),
        px: new Float64Array(n),
        py: new Float64Array(n),
        restLen: 0,
        ready: false,
      };
    });

    const draw = (rope: Rope, index: number) => {
      const line = lines.current[index];
      if (!line) return;
      let d = '';
      for (let i = 0; i < rope.x.length; i++) {
        d += rope.x[i].toFixed(1) + ',' + rope.y[i].toFixed(1) + ' ';
      }
      line.setAttribute('points', d.trim());
    };

    /** Lay a rope out straight between its anchors and fix its length. */
    const seed = (rope: Rope, a: { x: number; y: number }, b: { x: number; y: number }) => {
      const n = rope.x.length;
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        rope.x[i] = rope.px[i] = a.x + (b.x - a.x) * t;
        rope.y[i] = rope.py[i] = a.y + (b.y - a.y) * t;
      }
      const gap = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
      rope.restLen = (gap * (1 + (rope.link.slack ?? 0.3))) / (n - 1);
      rope.ready = true;
    };

    /** Static fallback: a plain quadratic sag, no simulation. */
    const drawStatic = () => {
      ropes.forEach((rope, index) => {
        const a = centre(rope.link.from);
        const b = centre(rope.link.to);
        if (!a || !b) return;
        const n = rope.x.length;
        const sag = Math.hypot(b.x - a.x, b.y - a.y) * (rope.link.slack ?? 0.3) * 0.9;
        for (let i = 0; i < n; i++) {
          const t = i / (n - 1);
          rope.x[i] = a.x + (b.x - a.x) * t;
          rope.y[i] = a.y + (b.y - a.y) * t + Math.sin(t * Math.PI) * sag;
        }
        draw(rope, index);
      });
    };

    if (reduced) {
      drawStatic();
      const ro = new ResizeObserver(drawStatic);
      ro.observe(root);
      return () => ro.disconnect();
    }

    const onMove = (e: PointerEvent) => {
      const base = root.getBoundingClientRect();
      pointer.current = { x: e.clientX - base.left, y: e.clientY - base.top };
    };
    const onLeave = () => {
      pointer.current = null;
    };
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);

    let raf = 0;
    const frame = () => {
      for (let index = 0; index < ropes.length; index++) {
        const rope = ropes[index];
        const a = centre(rope.link.from);
        const b = centre(rope.link.to);
        if (!a || !b) continue;
        if (!rope.ready) seed(rope, a, b);

        const n = rope.x.length;
        // Rope length eases toward "current gap + slack" instead of being fixed
        // at whatever the layout happened to be on the first frame. A fixed
        // length is more honest physics and worse in a browser: seed while a
        // font is still loading, or resize the container, and the cable is
        // permanently taut. At 4% a frame it lags fast movement — so a hard drag
        // still snaps the rope tight — while absorbing layout over about a second.
        const gap = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
        const target = (gap * (1 + (rope.link.slack ?? 0.3))) / (n - 1);
        rope.restLen += (target - rope.restLen) * 0.04;
        // Verlet integration: the position pair carries its own velocity.
        for (let i = 1; i < n - 1; i++) {
          const vx = (rope.x[i] - rope.px[i]) * damping;
          const vy = (rope.y[i] - rope.py[i]) * damping;
          rope.px[i] = rope.x[i];
          rope.py[i] = rope.y[i];
          rope.x[i] += vx;
          rope.y[i] += vy + gravity * DT * DT;
        }

        // The pointer shoulders the rope aside rather than grabbing it.
        const p = pointer.current;
        if (p && pointerRadius > 0) {
          for (let i = 1; i < n - 1; i++) {
            const dx = rope.x[i] - p.x;
            const dy = rope.y[i] - p.y;
            const d = Math.hypot(dx, dy);
            if (d < pointerRadius && d > 0.001) {
              const push = (pointerRadius - d) / pointerRadius;
              rope.x[i] += (dx / d) * push * 6;
              rope.y[i] += (dy / d) * push * 6;
            }
          }
        }

        // Relax: pin the ends to the anchors, then even out segment lengths.
        for (let pass = 0; pass < iterations; pass++) {
          rope.x[0] = a.x;
          rope.y[0] = a.y;
          rope.x[n - 1] = b.x;
          rope.y[n - 1] = b.y;
          for (let i = 0; i < n - 1; i++) {
            const dx = rope.x[i + 1] - rope.x[i];
            const dy = rope.y[i + 1] - rope.y[i];
            const d = Math.hypot(dx, dy) || 0.0001;
            // Rope, not spring: a segment can only ever be pulled shorter. Letting
            // slack segments push apart is what turns a hanging cable into a
            // permanently buzzing zigzag — gravity alone should shape the sag.
            if (d <= rope.restLen) continue;
            const shift = ((d - rope.restLen) / d) * 0.5;
            const ox = dx * shift;
            const oy = dy * shift;
            if (i !== 0) {
              rope.x[i] += ox;
              rope.y[i] += oy;
            }
            if (i + 1 !== n - 1) {
              rope.x[i + 1] -= ox;
              rope.y[i + 1] -= oy;
            }
          }
        }

        draw(rope, index);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
    };
  }, [links, gravity, damping, iterations, pointerRadius, reduced]);

  return (
    <div ref={box} className={'relative ' + className}>
      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        {links.map((link, i) => (
          <polyline
            key={link.from + '-' + link.to + '-' + i}
            ref={(el) => {
              lines.current[i] = el;
            }}
            fill="none"
            stroke={link.color ?? 'currentColor'}
            strokeWidth={link.width ?? 2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
      {children}
    </div>
  );
}
