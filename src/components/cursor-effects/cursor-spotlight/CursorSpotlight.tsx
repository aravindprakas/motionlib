// ui-2 — CursorSpotlight
import { useEffect, useRef, type ReactNode } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface CursorSpotlightProps {
  children?: ReactNode;
  /** Spotlight diameter in px. Default 384. */
  size?: number;
  className?: string;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Dark panel where a blurred accent blob eases toward the cursor and
 * re-centers on leave. Pointer-fine + reduced-motion guarded.
 *
 * Fixes vs. the Store original: the blob is positioned with `transform`
 * instead of animating `left`/`top` (compositor-only), content is a prop
 * instead of hardcoded, and the rAF loop only runs while the pointer is
 * inside (plus a settle window) instead of forever.
 */
export function CursorSpotlight({ children, size = 384, className = '' }: CursorSpotlightProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const box = boxRef.current;
    const blob = blobRef.current;
    if (!box || !blob || typeof window === 'undefined') return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine || reduced) return;

    // Normalized 0..1 coordinates; objects hoisted, mutated in place.
    const target = { x: 0.5, y: 0.5 };
    const current = { x: 0.5, y: 0.5 };
    let frame = 0;
    let running = false;

    const apply = () => {
      const w = box.clientWidth;
      const h = box.clientHeight;
      blob.style.transform = `translate(${current.x * w - size / 2}px, ${current.y * h - size / 2}px)`;
    };

    const tick = () => {
      current.x = lerp(current.x, target.x, 0.1);
      current.y = lerp(current.y, target.y, 0.1);
      apply();
      // Stop once settled — no idle rAF burn.
      if (Math.abs(current.x - target.x) + Math.abs(current.y - target.y) < 0.001) {
        running = false;
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const ensureLoop = () => {
      if (!running) {
        running = true;
        frame = requestAnimationFrame(tick);
      }
    };

    const onMove = (e: PointerEvent) => {
      const rect = box.getBoundingClientRect();
      target.x = (e.clientX - rect.left) / rect.width;
      target.y = (e.clientY - rect.top) / rect.height;
      ensureLoop();
    };
    const onLeave = () => {
      target.x = 0.5;
      target.y = 0.5;
      ensureLoop();
    };

    apply();
    box.addEventListener('pointermove', onMove);
    box.addEventListener('pointerleave', onLeave);
    return () => {
      box.removeEventListener('pointermove', onMove);
      box.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(frame);
    };
  }, [reduced, size]);

  return (
    <div
      ref={boxRef}
      className={`relative flex items-center justify-center overflow-hidden border border-ink bg-ink text-paper ${className}`}
    >
      <div
        ref={blobRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 opacity-85 blur-[30px] will-change-transform"
        style={{
          width: size,
          height: size,
          background: 'radial-gradient(circle, var(--color-accent), transparent 65%)',
          transform: 'translate(-9999px, -9999px)',
        }}
      />
      <div className="relative z-10 mix-blend-exclusion">{children}</div>
    </div>
  );
}
