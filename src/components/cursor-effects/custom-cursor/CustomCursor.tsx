// ui-1 — CustomCursor
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface CustomCursorProps {
  /**
   * Zone content. Any descendant with a `data-cursor` attribute makes the
   * cursor grow (and, with blend modes, invert what's beneath it).
   */
  children: ReactNode;
  /** Dot diameter in px. Default 16. */
  size?: number;
  /** mix-blend-mode for the dot. Default 'difference'. */
  blend?: CSSProperties['mixBlendMode'];
  /** Lerp factor per frame, 0–1 — higher follows tighter. Default 0.2. */
  lerp?: number;
  /** Grow multiplier over `[data-cursor]` targets. Default 3. */
  growScale?: number;
  className?: string;
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Custom cursor that lerps toward the pointer with a single pointer listener
 * and one rAF loop (running only while the pointer is inside the zone). Grows
 * over `[data-cursor]` targets via event delegation — no per-target listeners,
 * no React re-renders on move. Scoped to its zone so it plays nicely inside
 * the preview shell; lift the listeners to `window` for a whole-page cursor.
 *
 * Reduced motion or coarse pointers: renders children with the native cursor.
 */
export function CustomCursor({
  children,
  size = 16,
  blend = 'difference',
  lerp = 0.2,
  growScale = 3,
  className = '',
}: CustomCursorProps) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [inside, setInside] = useState(false);
  const [grow, setGrow] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setEnabled(window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduced);
  }, [reduced]);

  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone || !enabled) return;

    // Hoisted, mutated in place — no allocation in the loop.
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;
    let running = false;

    const tick = () => {
      if (!running) return;
      current.x = mix(current.x, target.x, lerp);
      current.y = mix(current.y, target.y, lerp);
      const dot = dotRef.current;
      if (dot) dot.style.transform = `translate(${current.x}px, ${current.y}px) translate(-50%, -50%)`;
      frame = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const rect = zone.getBoundingClientRect();
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
    };
    const onEnter = (e: PointerEvent) => {
      const rect = zone.getBoundingClientRect();
      current.x = target.x = e.clientX - rect.left;
      current.y = target.y = e.clientY - rect.top;
      running = true;
      frame = requestAnimationFrame(tick);
    };
    const onLeave = () => {
      running = false;
      cancelAnimationFrame(frame);
    };
    // Delegation: one listener decides grow state from the hovered target.
    const onOver = (e: PointerEvent) => {
      setGrow(!!(e.target as HTMLElement).closest('[data-cursor]'));
    };

    zone.addEventListener('pointermove', onMove, { passive: true });
    zone.addEventListener('pointerenter', onEnter);
    zone.addEventListener('pointerleave', onLeave);
    zone.addEventListener('pointerover', onOver);
    return () => {
      running = false;
      cancelAnimationFrame(frame);
      zone.removeEventListener('pointermove', onMove);
      zone.removeEventListener('pointerenter', onEnter);
      zone.removeEventListener('pointerleave', onLeave);
      zone.removeEventListener('pointerover', onOver);
    };
  }, [enabled, lerp]);

  return (
    <div
      ref={zoneRef}
      onPointerEnter={() => setInside(true)}
      onPointerLeave={() => setInside(false)}
      className={`relative overflow-hidden ${enabled ? '[cursor:none]' : ''} ${className}`}
    >
      {children}
      {enabled && (
        <div
          ref={dotRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 bg-white transition-[width,height,opacity] duration-200 will-change-transform"
          style={{
            width: grow ? size * growScale : size,
            height: grow ? size * growScale : size,
            mixBlendMode: blend,
            opacity: inside ? 1 : 0,
          }}
        />
      )}
    </div>
  );
}
