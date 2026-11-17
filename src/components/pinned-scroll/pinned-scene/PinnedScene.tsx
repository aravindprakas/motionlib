// ui-36 — PinnedScene
import { useRef, type ReactNode } from 'react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScroller } from '@/lib/SmoothScroll';

export interface PinnedSceneProps {
  /** Static column that stays put while the steps scrub. */
  aside?: ReactNode;
  /** Steps that cross-fade as the user scrolls through the pinned range. */
  steps: ReactNode[];
  className?: string;
}

/**
 * Pins a full-height panel while its steps cross-fade (opacity + y only),
 * scrubbed one viewport-height per step against the ambient Lenis scroller.
 *
 * Fixes vs. the Store original: steps/aside are props instead of hardcoded,
 * it pins inside the page's smooth-scroll context rather than a nested
 * scrollbox, and reduced-motion/touch renders a plain stacked list.
 */
export function PinnedScene({ aside, steps, className = '' }: PinnedSceneProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const scrollerRef = useScroller();

  useGSAP(
    () => {
      if (reduced || typeof window === 'undefined') return;
      const stage = stageRef.current;
      if (!stage) return;
      const els = gsap.utils.toArray<HTMLElement>('[data-pinned-step]', stage);
      if (els.length < 2) return;

      gsap.set(els, { opacity: 0, y: 30 });
      gsap.set(els[0], { opacity: 1, y: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          scroller: scrollerRef?.current ?? undefined,
          start: 'top top',
          // one viewport-height of scroll per transition
          end: `+=${(els.length - 1) * 100}%`,
          pin: true,
          scrub: true,
          anticipatePin: 1,
        },
      });
      els.forEach((el, i) => {
        if (i === 0) return;
        tl.to(els[i - 1], { opacity: 0, y: -30, duration: 0.5 }).to(
          el,
          { opacity: 1, y: 0, duration: 0.5 },
          '<',
        );
      });
    },
    { scope: stageRef, dependencies: [reduced, steps.length], revertOnUpdate: true },
  );

  if (reduced) {
    return (
      <div className={`flex flex-col gap-16 px-6 py-16 ${className}`}>
        {aside && <div className="max-w-sm">{aside}</div>}
        {steps.map((step, i) => (
          <div key={i}>{step}</div>
        ))}
      </div>
    );
  }

  return (
    <div ref={stageRef} className={`flex h-screen items-center gap-10 px-6 ${className}`}>
      {aside && <div className="w-2/5 shrink-0">{aside}</div>}
      <div className="relative min-h-[50%] flex-1">
        {steps.map((step, i) => (
          <div key={i} data-pinned-step className="absolute inset-0 flex flex-col justify-center will-change-transform">
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}
