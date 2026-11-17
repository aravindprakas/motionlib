// ui-35 — StackingCards
import { useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScroller } from '@/lib/SmoothScroll';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface StackingCardsProps {
  /** Card contents, in stacking order (first = bottom of the stack). */
  cards: ReactNode[];
  /**
   * How much each covered card shrinks per card stacked above it
   * (0.05 = 5% per level). Default 0.06.
   */
  scaleStep?: number;
  /** Vertical offset in px per card so stacked top edges stay visible. Default 16. */
  offset?: number;
  className?: string;
}

/**
 * Pinned "sticky stack": the section pins for (n−1) viewport-heights while a
 * scrubbed timeline slides each card up over the previous one. Covered cards
 * scale down cumulatively and dim under an ink overlay — transform/opacity
 * only, so the whole effect stays compositor-friendly.
 *
 * Reduced motion: cards render as a plain vertical list, no pin.
 */
export function StackingCards({
  cards,
  scaleStep = 0.06,
  offset = 16,
  className = '',
}: StackingCardsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const scrollerRef = useScroller();

  useGSAP(
    () => {
      if (reduced || typeof window === 'undefined') return;
      const root = rootRef.current;
      if (!root) return;
      const els = gsap.utils.toArray<HTMLElement>('[data-stack-card]', root);
      const dims = gsap.utils.toArray<HTMLElement>('[data-stack-dim]', root);
      if (els.length < 2) return;

      // Resting offset: card i sits offset*i px lower, so when everything is
      // stacked the top edges of covered cards peek out like a paper stack.
      els.forEach((el, i) => {
        gsap.set(el, { y: i * offset, transformOrigin: 'center top' });
      });
      // All cards except the first start one viewport below (yPercent stacks
      // additively with the y offset above).
      gsap.set(els.slice(1), { yPercent: 120 });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          scroller: scrollerRef?.current ?? undefined,
          // Pin for one viewport-height of scroll per incoming card.
          start: 'top top',
          end: `+=${(els.length - 1) * 100}%`,
          pin: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Step i (one timeline second each, scrub maps it to scroll distance):
      // card i slides in; every card below it takes one more scale/dim step,
      // so the deepest card keeps shrinking as the stack grows.
      els.forEach((_, i) => {
        if (i === 0) return;
        const at = i - 1;
        tl.fromTo(els[i], { yPercent: 120 }, { yPercent: 0, duration: 1 }, at);
        for (let j = 0; j < i; j++) {
          const level = i - j; // how many cards now cover card j
          tl.to(els[j], { scale: 1 - scaleStep * level, duration: 1 }, at);
          tl.to(dims[j], { opacity: Math.min(0.5, 0.16 * level), duration: 1 }, at);
        }
      });
    },
    {
      scope: rootRef,
      dependencies: [reduced, cards.length, scaleStep, offset],
      revertOnUpdate: true,
    },
  );

  if (reduced) {
    return (
      <div className={`flex flex-col gap-8 px-[7%] py-12 ${className}`}>
        {cards.map((card, i) => (
          <div key={i} className="min-h-[70vh] border border-ink bg-bone">
            {card}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={rootRef} className={`relative h-screen overflow-hidden ${className}`}>
      {cards.map((card, i) => (
        <div
          key={i}
          data-stack-card
          className="absolute inset-x-0 top-[6vh] mx-auto h-[70vh] w-[86%] border border-ink bg-bone will-change-transform"
          style={{ zIndex: i + 1 }}
        >
          <div className="h-full w-full">{card}</div>
          {/* Dim overlay — opacity-only, no filter, no repaint of card content. */}
          <div
            data-stack-dim
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-ink opacity-0"
          />
        </div>
      ))}
    </div>
  );
}
