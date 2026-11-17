// ui-58 — ReadingHighlight
import { useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScroller } from '@/lib/SmoothScroll';
import { SET2 } from '@/lib/palette';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface ReadingHighlightProps {
  text: string;
  /** Colour of words already read. Default navy ink. */
  inkColor?: string;
  /** Colour of words not yet reached. Default hairline navy. */
  dimColor?: string;
  /** Colour of the word currently under the reading head. Default accent. */
  hotColor?: string;
  className?: string;
}

/**
 * Sentence whose words ignite in turn as you scroll: a reading head sweeps
 * through on scroll progress — words behind it settle to ink, the word under it
 * flares in the accent, words ahead stay dim.
 *
 * Reduced motion: the whole sentence renders in the read (ink) colour.
 */
export function ReadingHighlight({
  text,
  inkColor = SET2.ink,
  dimColor = SET2.line,
  hotColor = SET2.accent,
  className = '',
}: ReadingHighlightProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();
  const scrollerRef = useScroller();
  const words = useMemo(() => text.trim().split(/\s+/), [text]);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || typeof window === 'undefined') return;
      const spans = el.querySelectorAll<HTMLElement>('[data-w]');
      if (reduced) {
        spans.forEach((s) => (s.style.color = inkColor));
        return;
      }
      ScrollTrigger.create({
        trigger: el,
        scroller: scrollerRef?.current ?? undefined,
        start: 'top 75%',
        end: 'bottom 55%',
        scrub: true,
        onUpdate: (self) => {
          const lead = self.progress * spans.length;
          spans.forEach((s, i) => {
            s.style.color = i < lead - 0.5 ? inkColor : i < lead + 0.5 ? hotColor : dimColor;
          });
        },
      });
    },
    { scope: ref, dependencies: [reduced, text, inkColor, dimColor, hotColor], revertOnUpdate: true },
  );

  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <span key={i} data-w style={{ color: dimColor, transition: 'color 0.1s linear' }}>
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </p>
  );
}
