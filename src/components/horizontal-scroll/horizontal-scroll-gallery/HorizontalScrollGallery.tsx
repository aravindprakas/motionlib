// ui-32 — HorizontalScrollGallery
import { useRef, type ReactNode } from 'react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScroller } from '@/lib/SmoothScroll';

export interface HorizontalScrollGalleryProps {
  /** Panels for the horizontal track. */
  panels: ReactNode[];
  /** Keep the pin's scroll space (ScrollTrigger pinSpacing). Default true. */
  pinSpacing?: boolean;
  className?: string;
}

/**
 * Pins a full-height section while vertical scroll translates the panel row
 * horizontally, releasing when the last panel is reached.
 *
 * Pin/scrub range: the hidden track width (row.scrollWidth − viewport width)
 * doubles as the pin distance, so 1px of vertical scroll = 1px of horizontal
 * travel — the scrub feels 1:1. Rides the ambient Lenis scroller.
 *
 * Reduced motion / touch: native overflow-x scrolling with snap points.
 */
export function HorizontalScrollGallery({
  panels,
  pinSpacing = true,
  className = '',
}: HorizontalScrollGalleryProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const scrollerRef = useScroller();

  useGSAP(
    () => {
      if (reduced || typeof window === 'undefined') return;
      const wrap = wrapRef.current;
      const track = trackRef.current;
      const row = rowRef.current;
      if (!wrap || !track || !row) return;
      const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (!fine) return; // touch keeps native swipe + snap

      track.style.overflow = 'hidden'; // GSAP drives x; disable native x-scroll
      const getX = () => row.scrollWidth - wrap.clientWidth;
      gsap.to(row, {
        x: () => -getX(),
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          scroller: scrollerRef?.current ?? undefined,
          start: 'top top',
          end: () => '+=' + getX(),
          pin: true,
          pinSpacing,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      return () => {
        track.style.overflow = '';
      };
    },
    { scope: wrapRef, dependencies: [reduced, panels.length, pinSpacing], revertOnUpdate: true },
  );

  return (
    <div ref={wrapRef} className={`flex h-screen items-center ${className}`}>
      <div ref={trackRef} className="w-full snap-x snap-mandatory overflow-x-auto">
        <div ref={rowRef} className="flex w-max items-center gap-4 px-6 will-change-transform">
          {panels.map((panel, i) => (
            <div key={i} className="shrink-0 snap-start">
              {panel}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
