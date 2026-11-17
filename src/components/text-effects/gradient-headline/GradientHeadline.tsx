// ui-57 — GradientHeadline
import { useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScroller } from '@/lib/SmoothScroll';
import { SET2 } from '@/lib/palette';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface GradientHeadlineProps {
  children: ReactNode;
  /** Gradient stops that live inside the letters. */
  colors?: string[];
  className?: string;
}

/**
 * Oversized headline with the token gradient clipped inside the glyphs; the
 * gradient's horizontal position is scrubbed by scroll, so the colours slide
 * through the letters as the block passes.
 *
 * Reduced motion: the gradient sits still at its resting position.
 * (Documented exception: animates `background-position`, not transform — the
 * effect is the gradient travelling behind a text clip mask.)
 */
export function GradientHeadline({
  children,
  colors = [SET2.navy, SET2.accent, SET2.gold, SET2.green, SET2.violet],
  className = '',
}: GradientHeadlineProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();
  const scrollerRef = useScroller();

  const gradient = `linear-gradient(115deg, ${colors.join(', ')})`;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reduced || typeof window === 'undefined') return;
      gsap.fromTo(
        el,
        { backgroundPositionX: '100%' },
        {
          backgroundPositionX: '0%',
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            scroller: scrollerRef?.current ?? undefined,
            start: 'top 88%',
            end: 'bottom 30%',
            scrub: true,
          },
        },
      );
    },
    { scope: ref, dependencies: [reduced, colors.join(',')], revertOnUpdate: true },
  );

  return (
    <h3
      ref={ref}
      className={`m-0 bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: gradient,
        backgroundSize: '220% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        willChange: 'background-position',
      }}
    >
      {children}
    </h3>
  );
}
