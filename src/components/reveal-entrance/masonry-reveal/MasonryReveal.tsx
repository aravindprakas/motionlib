// ui-61 — MasonryReveal
import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScroller } from '@/lib/SmoothScroll';
import { SET2 } from '@/lib/palette';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface MasonryTile {
  label: string;
  color: string;
  tall?: boolean;
}

export interface MasonryRevealProps {
  tiles?: MasonryTile[];
  className?: string;
}

const DEFAULT_TILES: MasonryTile[] = [
  { label: 'Atelier', color: SET2.navy, tall: true },
  { label: 'Field notes', color: SET2.accent },
  { label: 'Process', color: SET2.green },
  { label: 'Archive', color: SET2.violet, tall: true },
  { label: 'Studio', color: SET2.gold },
  { label: 'Index', color: SET2.navy700 },
];

/**
 * Masonry gallery whose tiles uncrop from the top on a staggered clip-path
 * reveal as each batch enters view (ScrollTrigger.batch on the ambient
 * scroller). Layout is a plain CSS multi-column flow.
 *
 * Reduced motion: every tile is shown fully un-cropped from the start.
 * (Uses `clip-path`, the same documented exception as ClipPathReveal.)
 */
export function MasonryReveal({ tiles = DEFAULT_TILES, className = '' }: MasonryRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const scrollerRef = useScroller();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const els = root.querySelectorAll<HTMLElement>('[data-ms]');
      if (reduced) {
        gsap.set(els, { clipPath: 'inset(0 0 0% 0)' });
        return;
      }
      gsap.set(els, { clipPath: 'inset(0 0 100% 0)' });
      ScrollTrigger.batch(els, {
        scroller: scrollerRef?.current ?? undefined,
        start: 'top 88%',
        onEnter: (batch) =>
          gsap.to(batch, {
            clipPath: 'inset(0 0 0% 0)',
            duration: 0.9,
            ease: 'power3.out',
            stagger: { each: 0.08, from: 'start' },
            overwrite: true,
          }),
      });
    },
    { scope: rootRef, dependencies: [reduced, tiles], revertOnUpdate: true },
  );

  return (
    <div ref={rootRef} className={`columns-1 [column-gap:16px] min-[520px]:columns-2 min-[820px]:columns-3 ${className}`}>
      {tiles.map((t, i) => (
        <div
          key={i}
          data-ms
          className={`mb-4 grid break-inside-avoid content-end p-6 text-lg font-semibold tracking-[-0.01em] text-cream will-change-[clip-path,transform] ${
            t.tall ? 'h-[300px]' : 'h-[200px]'
          }`}
          style={{ background: t.color, clipPath: 'inset(0 0 100% 0)' }}
        >
          <span className="opacity-90">{t.label}</span>
        </div>
      ))}
    </div>
  );
}
