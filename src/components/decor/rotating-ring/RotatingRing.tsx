// ui-114 — RotatingRing
import { useEffect, useId, useRef } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScroller } from '@/lib/SmoothScroll';

export interface RotatingRingProps {
  /** Text set around the circular path (repeat it so it wraps evenly). */
  text?: string;
  /** Glyph in the middle. Default '★'. */
  glyph?: string;
  /** Degrees advanced per frame while on screen. Default 0.24. */
  speed?: number;
  className?: string;
}

/**
 * Type set on a circular SVG path, rotated by a rAF loop that only advances
 * while the badge is on screen (IntersectionObserver rooted on the ambient
 * scroller), with a fixed glyph pinned in the centre.
 *
 * Reduced motion: the ring is rendered but never rotates.
 */
export function RotatingRing({
  text = 'ALWAYS MOVING · ALWAYS MOVING · ALWAYS MOVING · ',
  glyph = '★',
  speed = 0.24,
  className = '',
}: RotatingRingProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();
  const scrollerRef = useScroller();
  const pathId = `ring-${useId().replace(/:/g, '')}`;

  useEffect(() => {
    if (reduced) return;
    const svg = svgRef.current;
    const host = svg?.parentElement;
    if (!svg || !host) return;
    let raf = 0;
    let rot = 0;
    let visible = true;
    const frame = () => {
      if (visible) {
        rot += speed;
        svg.style.transform = `rotate(${rot}deg)`;
      }
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver((en) => (visible = en[0].isIntersecting), {
      root: scrollerRef?.current ?? null,
      threshold: 0,
    });
    io.observe(host);
    frame();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [reduced, speed, scrollerRef]);

  return (
    <div className={`relative grid h-[240px] w-[240px] flex-none place-items-center ${className}`}>
      <svg
        ref={svgRef}
        viewBox="0 0 240 240"
        aria-hidden
        className="absolute inset-0 h-full w-full origin-center will-change-transform"
      >
        <defs>
          <path id={pathId} d="M120,120 m-92,0 a92,92 0 1,1 184,0 a92,92 0 1,1 -184,0" />
        </defs>
        <text className="fill-navy font-mono text-base font-bold tracking-[0.16em]">
          <textPath href={`#${pathId}`} startOffset="0">
            {text}
          </textPath>
        </text>
      </svg>
      <span className="text-[52px] text-coral">{glyph}</span>
    </div>
  );
}
