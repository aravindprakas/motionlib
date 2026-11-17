// ui-53 — VariableFontMorph
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScroller } from '@/lib/SmoothScroll';

export interface VariableFontMorphProps {
  /** The display text. Default 'WEIGHT & SPACE'. */
  text?: string;
  /** Weight range mapped over scroll progress. Defaults 300 → 800. */
  fromWeight?: number;
  toWeight?: number;
  className?: string;
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Font weight + tracking morph over scroll progress; hover (fine pointers)
 * snaps to bold. Requires a variable font with a wght axis — the preview app
 * loads Space Grotesk 300..700 as a variable font for exactly this.
 *
 * Note: font-weight is inherently not a transform — this is a typographic
 * effect and the morphing element is isolated so nothing else reflows.
 *
 * Fixes vs. the Store original: text is a prop, the trigger rides the
 * ambient Lenis scroller, reduced motion renders static.
 */
export function VariableFontMorph({
  text = 'WEIGHT & SPACE',
  fromWeight = 300,
  toWeight = 800,
  className = '',
}: VariableFontMorphProps) {
  const wordRef = useRef<HTMLDivElement>(null);
  const fineRef = useRef(false);
  const reduced = useReducedMotion();
  const scrollerRef = useScroller();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    fineRef.current = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }, []);

  useGSAP(
    () => {
      if (reduced || typeof window === 'undefined') return;
      const word = wordRef.current;
      if (!word) return;
      ScrollTrigger.create({
        trigger: word,
        scroller: scrollerRef?.current ?? undefined,
        start: 'top 90%',
        end: 'bottom 20%',
        scrub: true,
        onUpdate: (self) => {
          const p = clamp(self.progress, 0, 1);
          word.style.fontWeight = String(Math.round(lerp(fromWeight, toWeight, p)));
          word.style.letterSpacing = `${lerp(-0.02, 0.04, p)}em`;
        },
      });
    },
    { scope: wordRef, dependencies: [reduced, fromWeight, toWeight], revertOnUpdate: true },
  );

  function handleEnter() {
    if (!fineRef.current || reduced || !wordRef.current) return;
    gsap.to(wordRef.current, { fontWeight: toWeight, letterSpacing: '0.04em', duration: 0.3, overwrite: true });
  }

  function handleLeave() {
    if (!fineRef.current || reduced || !wordRef.current) return;
    gsap.to(wordRef.current, { fontWeight: fromWeight, letterSpacing: '-0.02em', duration: 0.3, overwrite: true });
  }

  return (
    <div
      ref={wordRef}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      className={`text-[clamp(2.6rem,9vw,6rem)] leading-[0.9] tracking-[-0.02em] ${className}`}
      style={{ fontWeight: reduced ? 500 : fromWeight }}
    >
      {text}
    </div>
  );
}
