// ui-60 — ClipPathReveal
import { useRef, type ReactNode } from 'react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScroller } from '@/lib/SmoothScroll';

export type ClipRevealDirection = 'up' | 'left' | 'right';

export interface ClipPathRevealProps {
  children: ReactNode;
  /** Direction the wipe travels. Default 'up'. */
  direction?: ClipRevealDirection;
  /** Seconds. Default 1.1. */
  duration?: number;
  /** ScrollTrigger start. Default 'top 80%'. */
  start?: string;
  className?: string;
}

// Starting inset per direction — the collapsed edge is where content appears
// from: 'up' starts fully hidden behind the bottom edge and wipes upward.
const FROM_CLIP: Record<ClipRevealDirection, string> = {
  up: 'inset(100% 0% 0% 0%)',
  left: 'inset(0% 0% 0% 100%)', // hidden at the right, wipes leftward
  right: 'inset(0% 100% 0% 0%)', // hidden at the left, wipes rightward
};

/**
 * Reveals its child with an animated clip-path inset wipe the first time it
 * enters the viewport. Clip-path is paint-only (no layout), and the inner
 * content counter-scales slightly so the reveal reads as a curtain, not a
 * stretch. Reduced motion renders unclipped.
 */
export function ClipPathReveal({
  children,
  direction = 'up',
  duration = 1.1,
  start = 'top 80%',
  className = '',
}: ClipPathRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const scrollerRef = useScroller();

  useGSAP(
    () => {
      if (reduced || typeof window === 'undefined') return;
      const el = rootRef.current;
      const inner = el?.firstElementChild as HTMLElement | null;
      if (!el || !inner) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          scroller: scrollerRef?.current ?? undefined,
          start,
          once: true,
        },
      });
      tl.fromTo(
        el,
        { clipPath: FROM_CLIP[direction] },
        { clipPath: 'inset(0% 0% 0% 0%)', duration, ease: 'power4.inOut' },
      ).fromTo(inner, { scale: 1.15 }, { scale: 1, duration, ease: 'power4.inOut' }, 0);
    },
    { scope: rootRef, dependencies: [reduced, direction, duration, start], revertOnUpdate: true },
  );

  return (
    <div ref={rootRef} className={`will-change-[clip-path] ${className}`}>
      <div className="h-full w-full will-change-transform">{children}</div>
    </div>
  );
}
