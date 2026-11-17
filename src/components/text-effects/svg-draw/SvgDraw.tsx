// ui-55 — SvgDraw
import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface SvgDrawProps {
  /** Per-path draw duration in seconds. Default 2. */
  duration?: number;
  /** Stagger between paths in seconds. Default 0.1. */
  stagger?: number;
  /** Replay the draw whenever it scrolls back into view. Default false (once). */
  repeat?: boolean;
  className?: string;
  /** Fires once the whole word has finished drawing. */
  onComplete?: () => void;
}

/**
 * Self-drawing SVG wordmark ("days"). Every stroke is normalised to its own
 * length via stroke-dasharray/offset, then GSAP animates the offset from full
 * length to 0 so the letters appear to be written on. Triggered on first view.
 *
 * Reduced motion: renders the finished, fully-drawn mark with no animation.
 */
export function SvgDraw({
  duration = 2,
  stagger = 0.1,
  repeat = false,
  className = '',
  onComplete,
}: SvgDrawProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const paths = Array.from(svg.querySelectorAll<SVGGeometryElement>('.line'));

    // Prime every stroke: dash length === path length, offset hidden.
    paths.forEach((p) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = reduced ? '0' : `${len}`;
    });

    if (reduced) {
      onComplete?.();
      return;
    }

    const ctx = gsap.context(() => {
      gsap.to(paths, {
        strokeDashoffset: 0,
        duration,
        ease: 'power2.inOut',
        stagger,
        onComplete,
        scrollTrigger: {
          trigger: svg,
          start: 'top 80%',
          toggleActions: repeat ? 'restart none none reset' : 'play none none none',
        },
      });
    }, svg);

    return () => ctx.revert();
  }, [duration, stagger, repeat, reduced, onComplete]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 520 165"
      className={className}
      style={{ width: 'clamp(280px, 60vw, 720px)' }}
    >
      <g stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5">
        {/* d */}
        <circle className="line" cx="72" cy="82" r="50" />
        <path className="line" d="M 122 82 V 26 A 18 18 0 0 1 158 26 V 138" />
        {/* a */}
        <circle className="line" cx="182" cy="82" r="50" />
        <path className="line" d="M 232 26 V 138" />
        {/* y */}
        <path className="line" d="M 232 36 L 272 98" />
        <path className="line" d="M 312 36 L 272 98 L 252 132 Q 232 155 200 143" />
        {/* o */}
        <circle className="line" cx="360" cy="82" r="50" />
        {/* s */}
        <path
          className="line"
          d="M 448 52 C 448 24, 404 24, 404 58 C 404 88, 452 76, 452 108 C 452 140, 404 140, 404 122"
        />
      </g>
    </svg>
  );
}
