// ui-43 — TokenSpectrum
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

export interface TokenSpectrumProps {
  eyebrow?: string;
  title?: ReactNode;
  caption?: string;
  /** Ordered colour stops the background eases through on scroll. */
  colors?: string[];
  className?: string;
}

/**
 * Panel whose background colour is scrubbed across the accent ramp as it moves
 * through the viewport — the interpolation is driven by scroll progress, so it
 * eases cleanly from the first stop to the last and back.
 *
 * Reduced motion: the panel is painted with the first stop and never scrubs.
 */
export function TokenSpectrum({
  eyebrow = 'SPECTRUM',
  title = 'Five tokens, one continuous scroll.',
  caption = 'navy → accent → gold → green → violet',
  colors = [SET2.navy, SET2.accent, SET2.gold, SET2.green, SET2.violet],
  className = '',
}: TokenSpectrumProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const scrollerRef = useScroller();

  useGSAP(
    () => {
      const el = rootRef.current;
      if (!el || typeof window === 'undefined') return;
      if (reduced) {
        gsap.set(el, { backgroundColor: colors[0] });
        return;
      }
      const setBg = gsap.quickSetter(el, 'backgroundColor');
      ScrollTrigger.create({
        trigger: el,
        scroller: scrollerRef?.current ?? undefined,
        start: 'top 78%',
        end: 'bottom 20%',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress * (colors.length - 1);
          const i = Math.min(colors.length - 2, Math.floor(p));
          setBg(gsap.utils.interpolate(colors[i], colors[i + 1], p - i));
        },
      });
    },
    { scope: rootRef, dependencies: [reduced, colors.join(',')], revertOnUpdate: true },
  );

  return (
    <div
      ref={rootRef}
      className={`grid min-h-[78vh] content-center gap-4 bg-navy p-[clamp(28px,6vw,80px)] text-cream ${className}`}
    >
      <span className="font-mono text-xs font-bold tracking-[0.24em] opacity-70">{eyebrow}</span>
      <h3 className="m-0 text-[clamp(30px,6vw,84px)] font-semibold leading-[1.02] tracking-[-0.03em]">
        {title}
      </h3>
      <span className="font-mono text-[13px] uppercase tracking-[0.14em] opacity-60">{caption}</span>
    </div>
  );
}
