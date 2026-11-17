// ui-56 — LetterStagger
import { useMemo, useRef, type ElementType } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScroller } from '@/lib/SmoothScroll';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface LetterStaggerProps {
  text: string;
  /** Element tag to render. Default 'h3'. */
  as?: ElementType;
  /** Seconds between each glyph. Default 0.022. */
  stagger?: number;
  /** ScrollTrigger start position. Default 'top 82%'. */
  start?: string;
  /** Fraction of glyphs randomly tinted with the accent. Default 0.12. */
  hotChance?: number;
  className?: string;
}

/**
 * Headline that assembles itself glyph-by-glyph: each character rises from
 * below with its own beat on a `power4.out` stagger when the block enters view.
 * A small random fraction of glyphs are tinted with the accent token.
 *
 * Reduced motion: the text renders in place — the `from` tween that sets the
 * hidden initial state is simply never created.
 */
export function LetterStagger({
  text,
  as = 'h3',
  stagger = 0.022,
  start = 'top 82%',
  hotChance = 0.12,
  className = '',
}: LetterStaggerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const scrollerRef = useScroller();
  const Tag = as as 'div';

  // Hot positions are chosen once per text so they stay stable across renders.
  const chars = useMemo(
    () => Array.from(text).map((c) => ({ c, hot: c !== ' ' && Math.random() < hotChance })),
    [text, hotChance],
  );

  useGSAP(
    () => {
      if (reduced || typeof window === 'undefined') return;
      const glyphs = rootRef.current?.querySelectorAll<HTMLElement>('[data-ch]');
      if (!glyphs || glyphs.length === 0) return;
      gsap.from(glyphs, {
        yPercent: 120,
        opacity: 0,
        duration: 0.7,
        ease: 'power4.out',
        stagger: { each: stagger, from: 'start' },
        scrollTrigger: {
          trigger: rootRef.current,
          scroller: scrollerRef?.current ?? undefined,
          start,
          once: true,
        },
      });
    },
    { scope: rootRef, dependencies: [reduced, text, stagger, start], revertOnUpdate: true },
  );

  return (
    <Tag ref={rootRef} className={className} aria-label={text}>
      {chars.map(({ c, hot }, i) =>
        c === ' ' ? (
          <span key={i} aria-hidden className="inline-block w-[0.32em]" />
        ) : (
          <span
            key={i}
            data-ch
            aria-hidden
            className={`inline-block will-change-transform ${hot ? 'text-coral' : ''}`}
          >
            {c}
          </span>
        ),
      )}
    </Tag>
  );
}
