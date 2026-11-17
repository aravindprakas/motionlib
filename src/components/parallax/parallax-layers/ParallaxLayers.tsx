// ui-39 — ParallaxLayers
import { useRef, type ReactNode } from 'react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScroller } from '@/lib/SmoothScroll';

export interface ParallaxLayersProps {
  /**
   * Layer elements. Any descendant with `data-depth="0.2"` translates at that
   * fraction of the scroll distance (higher = faster = feels closer).
   */
  children: ReactNode;
  className?: string;
}

/**
 * Multi-depth parallax frame — each `[data-depth]` layer translates on
 * yPercent (transform-only) as the frame scrolls past, scrubbed by
 * ScrollTrigger against the ambient Lenis scroller.
 *
 * Fixes vs. the Store original: rides the page's smooth-scroll context via
 * `useScroller()` instead of nesting its own scrollbox (no double scrollbars),
 * layers are children instead of hardcoded, cleanup via useGSAP.
 */
export function ParallaxLayers({ children, className = '' }: ParallaxLayersProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const scrollerRef = useScroller();

  useGSAP(
    () => {
      if (reduced || typeof window === 'undefined') return;
      const box = boxRef.current;
      if (!box) return;
      const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const damp = fine ? 1 : 0.4; // soften depth on touch

      box.querySelectorAll<HTMLElement>('[data-depth]').forEach((layer) => {
        const depth = parseFloat(layer.dataset.depth || '0') * damp;
        gsap.to(layer, {
          // depth 0.2 → layer travels 20% of its height over the full pass
          yPercent: -depth * 100,
          ease: 'none',
          scrollTrigger: {
            trigger: box,
            scroller: scrollerRef?.current ?? undefined,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });
    },
    { scope: boxRef, dependencies: [reduced], revertOnUpdate: true },
  );

  return (
    <div ref={boxRef} className={`relative overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
