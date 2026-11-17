import { useRef, useState, type ReactNode } from 'react';
import { ScrollTrigger } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScroller } from '@/lib/SmoothScroll';

export interface ScrollStep {
  text: ReactNode;
  visual: ReactNode;
}

export interface StickyScrollStepsProps {
  steps: ScrollStep[];
  /** Which side the pinned visual sits on. Default 'left'. */
  side?: 'left' | 'right';
  className?: string;
}

/**
 * Scrollytelling: a sticky visual column updates as text steps scroll past.
 * Each step gets its own ScrollTrigger (against the ambient Lenis scroller)
 * whose center-band toggle drives the active index; visuals cross-fade with
 * an opacity transition. The visual column uses CSS `position: sticky`, which
 * needs no pin bookkeeping and stays correct under smooth scroll.
 *
 * Reduced motion: steps render stacked with their visual inline.
 */
export function StickyScrollSteps({ steps, side = 'left', className = '' }: StickyScrollStepsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const scrollerRef = useScroller();

  useGSAP(
    () => {
      if (reduced || typeof window === 'undefined') return;
      const root = rootRef.current;
      if (!root) return;
      root.querySelectorAll<HTMLElement>('[data-scroll-step]').forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          scroller: scrollerRef?.current ?? undefined,
          // A step "owns" the screen while its block crosses the middle band.
          start: 'top center',
          end: 'bottom center',
          onToggle: (self) => {
            if (self.isActive) setActive(i);
          },
        });
      });
    },
    { scope: rootRef, dependencies: [reduced, steps.length], revertOnUpdate: true },
  );

  if (reduced) {
    return (
      <div className={`flex flex-col gap-20 ${className}`}>
        {steps.map((step, i) => (
          <div key={i} className="grid gap-8 md:grid-cols-2">
            <div>{step.visual}</div>
            <div>{step.text}</div>
          </div>
        ))}
      </div>
    );
  }

  const visualCol = (
    <div className="sticky top-0 flex h-screen items-center justify-center">
      <div className="relative h-[52vh] w-full max-w-[480px]">
        {steps.map((step, i) => (
          <div
            key={i}
            aria-hidden={i !== active || undefined}
            className={`absolute inset-0 transition-opacity duration-500 ${
              i === active ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {step.visual}
          </div>
        ))}
      </div>
    </div>
  );

  const stepsCol = (
    <div>
      {steps.map((step, i) => (
        <div key={i} data-scroll-step className="flex min-h-[85vh] items-center">
          <div
            className={`transition-opacity duration-300 ${i === active ? 'opacity-100' : 'opacity-40'}`}
          >
            {step.text}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div ref={rootRef} className={`grid grid-cols-1 gap-10 md:grid-cols-2 ${className}`}>
      {side === 'left' ? (
        <>
          {visualCol}
          {stepsCol}
        </>
      ) : (
        <>
          {stepsCol}
          {visualCol}
        </>
      )}
    </div>
  );
}
