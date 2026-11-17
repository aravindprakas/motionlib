// ui-6 — PointerTrail
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { SET2_RAMP } from '@/lib/palette';

export interface PointerTrailProps {
  /** Colour cycle for the chips. */
  colors?: string[];
  /** Minimum ms between spawned chips. Default 36. */
  throttle?: number;
  hint?: string;
  className?: string;
}

/**
 * Field that drops a fading, rotating chip along the pointer path — chips are
 * spawned on a time throttle, tween out to nothing, then remove themselves, so
 * the DOM never accumulates. Colours cycle through the accent ramp.
 *
 * Reduced motion: the field renders with its hint and spawns nothing.
 */
export function PointerTrail({
  colors = SET2_RAMP,
  throttle = 36,
  hint = 'leave a trail of tokens',
  className = '',
}: PointerTrailProps) {
  const padRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || typeof window === 'undefined') return;
    const pad = padRef.current;
    if (!pad) return;

    let ci = 0;
    let last = 0;
    const live = new Set<HTMLElement>();

    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - last < throttle) return;
      last = now;
      const r = pad.getBoundingClientRect();
      const bit = document.createElement('span');
      bit.className = 'pointer-events-none absolute left-0 top-0 h-[26px] w-[26px] will-change-transform';
      bit.style.background = colors[ci % colors.length];
      ci++;
      pad.appendChild(bit);
      live.add(bit);
      gsap.set(bit, {
        x: e.clientX - r.left - 13,
        y: e.clientY - r.top - 13,
        scale: 1,
        opacity: 1,
        rotation: gsap.utils.random(-40, 40),
      });
      gsap.to(bit, {
        scale: 0.2,
        opacity: 0,
        rotation: '+=60',
        duration: 0.9,
        ease: 'power2.out',
        onComplete: () => {
          bit.remove();
          live.delete(bit);
        },
      });
    };

    pad.addEventListener('pointermove', onMove);
    return () => {
      pad.removeEventListener('pointermove', onMove);
      live.forEach((b) => {
        gsap.killTweensOf(b);
        b.remove();
      });
      live.clear();
    };
  }, [reduced, throttle, colors]);

  return (
    <div
      ref={padRef}
      className={`relative grid h-[64vh] touch-none place-items-center overflow-hidden border border-navy-line bg-navy/[0.03] ${className}`}
    >
      <span className="pointer-events-none z-[1] font-mono text-[13px] uppercase tracking-[0.16em] text-navy-soft">
        {hint}
      </span>
    </div>
  );
}
