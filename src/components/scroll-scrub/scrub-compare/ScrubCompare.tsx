// ui-44 — ScrubCompare
import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScroller } from '@/lib/SmoothScroll';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface ScrubCompareProps {
  beforeLabel?: string;
  beforeWord?: string;
  afterLabel?: string;
  afterWord?: string;
  className?: string;
}

/**
 * Before/after reveal whose wipe is driven entirely by scroll progress: the
 * "after" pane is clipped from the left and a handle rides the seam, so the
 * comparison scrubs open and closed as you move through it.
 *
 * Reduced motion: the panes rest at a static 50/50 split.
 * (Uses `clip-path`, the same documented exception as ClipPathReveal.)
 */
export function ScrubCompare({
  beforeLabel = 'BEFORE',
  beforeWord = 'flat',
  afterLabel = 'AFTER',
  afterWord = 'alive',
  className = '',
}: ScrubCompareProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const afterRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const scrollerRef = useScroller();

  useGSAP(
    () => {
      const root = rootRef.current;
      const after = afterRef.current;
      const handle = handleRef.current;
      if (!root || !after || !handle) return;
      const apply = (reveal: number) => {
        after.style.clipPath = `inset(0 ${100 - reveal * 100}% 0 0)`;
        handle.style.left = `${reveal * 100}%`;
      };
      if (reduced) {
        apply(0.5);
        return;
      }
      ScrollTrigger.create({
        trigger: root,
        scroller: scrollerRef?.current ?? undefined,
        start: 'top 78%',
        end: 'bottom 30%',
        scrub: true,
        onUpdate: (self) => apply(gsap.utils.clamp(0, 1, self.progress)),
      });
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  return (
    <div ref={rootRef} className={`relative h-[64vh] overflow-hidden border border-navy-line ${className}`}>
      <div className="absolute inset-0 grid place-items-center bg-cream text-navy-soft">
        <span className="absolute left-[22px] top-[22px] font-mono text-[11px] font-bold tracking-[0.18em]">
          {beforeLabel}
        </span>
        <span className="text-[clamp(48px,12vw,150px)] font-bold tracking-[-0.04em]">{beforeWord}</span>
      </div>

      <div
        ref={afterRef}
        className="absolute inset-0 grid place-items-center bg-navy text-cream will-change-[clip-path]"
        style={{ clipPath: 'inset(0 100% 0 0)' }}
      >
        <span className="absolute right-[22px] top-[22px] font-mono text-[11px] font-bold tracking-[0.18em]">
          {afterLabel}
        </span>
        <span className="text-[clamp(48px,12vw,150px)] font-bold tracking-[-0.04em] text-coral">{afterWord}</span>
      </div>

      <div
        ref={handleRef}
        className="pointer-events-none absolute bottom-0 top-0 w-[2px] bg-coral"
        style={{ left: '0%' }}
      >
        <div className="absolute left-1/2 top-1/2 h-[38px] w-[38px] -translate-x-1/2 -translate-y-1/2 bg-coral" />
      </div>
    </div>
  );
}
