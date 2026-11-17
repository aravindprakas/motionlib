// ui-51 — ScrollRevealText
import { Fragment, useMemo, useRef, type ElementType } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScroller } from '@/lib/SmoothScroll';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface ScrollRevealTextProps {
  text: string;
  /** Element tag to render, e.g. 'h1', 'p'. Default 'h2'. */
  as?: ElementType;
  /** Split granularity. Default 'word'. */
  splitBy?: 'word' | 'char';
  /** Seconds between each unit. Default 0.045. */
  stagger?: number;
  /** ScrollTrigger start position. Default 'top 85%'. */
  start?: string;
  className?: string;
}

/**
 * Lightweight splitter — no SplitText dependency. Words are kept in
 * `whitespace-nowrap` groups so char-mode never breaks mid-word; each unit
 * sits inside an overflow-hidden mask span and slides up into place.
 *
 * Reduced motion: text renders fully visible — the fromTo tween (which sets
 * the hidden initial state) is simply never created.
 */
export function ScrollRevealText({
  text,
  as = 'h2',
  splitBy = 'word',
  stagger = 0.045,
  start = 'top 85%',
  className = '',
}: ScrollRevealTextProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const scrollerRef = useScroller();

  // Cast keeps JSX + ref typing simple while still rendering any tag.
  const Tag = as as 'div';

  const words = useMemo(
    () =>
      text
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => (splitBy === 'char' ? Array.from(w) : [w])),
    [text, splitBy],
  );

  useGSAP(
    () => {
      if (reduced || typeof window === 'undefined') return;
      const units = rootRef.current?.querySelectorAll<HTMLElement>('[data-reveal-unit]');
      if (!units || units.length === 0) return;

      gsap.fromTo(
        units,
        // 110% (not 100%) so descenders clear the mask before settling.
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power4.out',
          stagger,
          scrollTrigger: {
            trigger: rootRef.current,
            scroller: scrollerRef?.current ?? undefined,
            start,
            once: true,
          },
        },
      );
    },
    {
      scope: rootRef,
      dependencies: [reduced, text, splitBy, stagger, start],
      revertOnUpdate: true,
    },
  );

  return (
    <Tag ref={rootRef} className={className} aria-label={text}>
      {words.map((units, wi) => (
        <Fragment key={wi}>
          <span aria-hidden className="inline-block whitespace-nowrap">
            {units.map((unit, ui) => (
              // Outer span = mask (overflow hidden). The padding/negative-
              // margin pair gives descenders room without shifting layout.
              <span
                key={ui}
                className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom"
              >
                <span data-reveal-unit className="inline-block will-change-transform">
                  {unit}
                </span>
              </span>
            ))}
          </span>
          {wi < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  );
}
