// IntentField — reacts to where the pointer is going, not where it is
import { useEffect, useRef, type ReactNode } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface IntentFieldProps {
  children: ReactNode;
  /** Which descendants can be aimed at. Each needs a `data-intent` id. */
  selector?: string;
  /** Seconds of travel projected ahead. Longer = commits earlier, guesses more. */
  lookahead?: number;
  /** Half-angle of the intent cone, radians. Wider forgives sloppier aim. */
  cone?: number;
  /** px/s below which the pointer is judged to be browsing, not aiming. */
  minSpeed?: number;
  /** Confidence at which a target is declared the destination. */
  threshold?: number;
  /** Fires when the predicted destination changes — prefetch, warm, pre-open. */
  onPredict?: (id: string | null, confidence: number) => void;
  /** Draw the trajectory and cone the prediction is actually using. */
  debug?: boolean;
  className?: string;
}

interface Target {
  el: HTMLElement;
  id: string;
  cx: number;
  cy: number;
  half: number;
  score: number;
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * Scores every target by where the pointer is heading and hands each one its own
 * confidence as a CSS variable, before contact.
 *
 * Hover is a report of arrival. Magnetic and proximity effects improve on it
 * slightly by reading distance, but they are still symmetric: a cursor sitting
 * still an inch away and a cursor tearing past at 2000px/s look identical to
 * them. Aim is not symmetric — it has a direction and a speed, and people commit
 * to a target long before they reach it. This samples the pointer's recent path,
 * derives a velocity vector, and scores each target on three things: how well it
 * sits inside the heading cone, how close the projected line passes to it, and
 * whether it is reachable inside the lookahead horizon. The winner is announced
 * through `onPredict` — early enough to prefetch a route, open a submenu, or
 * decode an image before the click that was always coming.
 *
 * Every target receives `--intent` (0 → 1) and `--intent-x` / `--intent-y`, the
 * unit vector pointing back at the pointer, so elements can lean into an
 * approach. Confidence rises fast and falls slowly, so a target does not flicker
 * while the pointer wobbles. Reduced motion suppresses the variables but still
 * reports predictions, since prefetching is not motion.
 */
export function IntentField({
  children,
  selector = '[data-intent]',
  lookahead = 0.45,
  cone = 0.7,
  minSpeed = 130,
  threshold = 0.2,
  onPredict,
  debug = false,
  className = '',
}: IntentFieldProps) {
  const box = useRef<HTMLDivElement>(null);
  const rayRef = useRef<SVGLineElement>(null);
  const spotRef = useRef<SVGCircleElement>(null);
  const predictRef = useRef(onPredict);
  predictRef.current = onPredict;
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = box.current;
    if (!root) return;

    let targets: Target[] = [];
    const measure = () => {
      const base = root.getBoundingClientRect();
      targets = Array.from(root.querySelectorAll<HTMLElement>(selector)).map((el) => {
        const r = el.getBoundingClientRect();
        const prev = targets.find((t) => t.el === el);
        return {
          el,
          id: el.dataset.intent ?? '',
          cx: r.left - base.left + r.width / 2,
          cy: r.top - base.top + r.height / 2,
          half: Math.max(r.width, r.height) / 2,
          score: prev?.score ?? 0,
        };
      });
    };
    measure();

    const trail: { x: number; y: number; t: number }[] = [];
    let inside = false;
    let winner: string | null = null;
    let raf = 0;

    const cosCone = Math.cos(cone);

    const frame = () => {
      const now = performance.now();
      const last = trail[trail.length - 1];
      // Anything older than 90ms is history, not heading.
      while (trail.length > 1 && now - trail[0].t > 90) trail.shift();
      const first = trail[0];

      let vx = 0;
      let vy = 0;
      let speed = 0;
      if (inside && first && last && last !== first && now - last.t < 120) {
        const dt = Math.max(8, last.t - first.t) / 1000;
        vx = (last.x - first.x) / dt;
        vy = (last.y - first.y) / dt;
        speed = Math.hypot(vx, vy);
      }

      const aiming = speed > minSpeed;
      const ux = aiming ? vx / speed : 0;
      const uy = aiming ? vy / speed : 0;

      let best: Target | null = null;
      let live = false;

      for (const t of targets) {
        let raw = 0;
        if (aiming && last) {
          const dx = t.cx - last.x;
          const dy = t.cy - last.y;
          const dist = Math.hypot(dx, dy) || 0.0001;
          const along = dx * ux + dy * uy; // travel needed along the heading
          if (along > 0) {
            const align = along / dist;
            if (align > cosCone) {
              // How near the projected line passes, relative to the target's size.
              const perp = Math.abs(dx * uy - dy * ux);
              const hit = clamp01(1 - perp / (t.half + 70));
              const coneScore = (align - cosCone) / (1 - cosCone);
              const eta = along / speed;
              const reachable = clamp01(1 - eta / lookahead);
              raw = coneScore * hit * reachable;
            }
          }
        }
        // Fast attack, slow release: certainty should not flicker on a wobble.
        t.score += (raw - t.score) * (raw > t.score ? 0.4 : 0.12);
        if (t.score < 0.002) t.score = 0;
        if (t.score > 0) live = true;
        if (!best || t.score > best.score) best = t;

        if (!reduced) {
          const dx = (last?.x ?? t.cx) - t.cx;
          const dy = (last?.y ?? t.cy) - t.cy;
          const len = Math.hypot(dx, dy) || 1;
          t.el.style.setProperty('--intent', t.score.toFixed(3));
          t.el.style.setProperty('--intent-x', (dx / len).toFixed(3));
          t.el.style.setProperty('--intent-y', (dy / len).toFixed(3));
        }
      }

      const next = best && best.score >= threshold ? best.id : null;
      if (next !== winner) {
        for (const t of targets) {
          if (t.id === next) t.el.dataset.intentState = 'predicted';
          else delete t.el.dataset.intentState;
        }
        winner = next;
        predictRef.current?.(next, best?.score ?? 0);
      }

      if (debug && last) {
        const ray = rayRef.current;
        const spot = spotRef.current;
        const tipX = last.x + ux * speed * lookahead;
        const tipY = last.y + uy * speed * lookahead;
        if (ray) {
          ray.setAttribute('x1', String(last.x));
          ray.setAttribute('y1', String(last.y));
          ray.setAttribute('x2', String(tipX));
          ray.setAttribute('y2', String(tipY));
          ray.setAttribute('opacity', aiming ? '0.9' : '0');
        }
        if (spot) {
          spot.setAttribute('cx', String(tipX));
          spot.setAttribute('cy', String(tipY));
          spot.setAttribute('opacity', aiming ? '0.9' : '0');
        }
      }

      // Keep spinning while the pointer is in play or anything is still cooling.
      if (inside || live) raf = requestAnimationFrame(frame);
      else raf = 0;
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onEnter = () => {
      inside = true;
      measure();
      wake();
    };
    const onMove = (e: PointerEvent) => {
      const base = root.getBoundingClientRect();
      trail.push({ x: e.clientX - base.left, y: e.clientY - base.top, t: performance.now() });
      if (trail.length > 12) trail.shift();
      inside = true;
      wake();
    };
    const onLeave = () => {
      inside = false;
      trail.length = 0;
      wake();
    };

    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    window.addEventListener('scroll', measure, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener('pointerenter', onEnter);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      ro.disconnect();
      window.removeEventListener('scroll', measure);
    };
  }, [selector, lookahead, cone, minSpeed, threshold, debug, reduced]);

  return (
    <div ref={box} className={'relative ' + className}>
      {debug && (
        <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full" aria-hidden>
          <line ref={rayRef} stroke="currentColor" strokeWidth={1} strokeDasharray="4 4" opacity={0} />
          <circle ref={spotRef} r={7} fill="none" stroke="currentColor" strokeWidth={1.5} opacity={0} />
        </svg>
      )}
      {children}
    </div>
  );
}
