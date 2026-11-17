// ui-71 — GooeyBlob
import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { SET2 } from '@/lib/palette';

export interface GooeyBlobProps {
  children?: ReactNode;
  /** Gradient start colour. Default accent. */
  from?: string;
  /** Gradient end colour. Default violet. */
  to?: string;
  className?: string;
}

const SHAPES = [
  '42% 58% 63% 37% / 47% 38% 62% 53%',
  '63% 37% 41% 59% / 54% 64% 36% 46%',
  '38% 62% 56% 44% / 63% 41% 59% 37%',
  '55% 45% 35% 65% / 38% 57% 43% 62%',
];

/**
 * A single element whose `border-radius` is animated on a loop to read as an
 * organic, wobbling blob, then shoved toward the cursor and scaled on hover
 * with an elastic release. Zero SVG.
 *
 * Touch / reduced motion: the blob sits at its resting shape — the loop and the
 * pointer shove are skipped.
 * (Intentional exception to the transform-only rule: `border-radius` is the
 * effect here, kept isolated to this component.)
 */
export function GooeyBlob({ children = 'Squish', from = SET2.accent, to = SET2.violet, className = '' }: GooeyBlobProps) {
  const blobRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || typeof window === 'undefined') return;
    const blob = blobRef.current;
    if (!blob) return;

    let i = 0;
    const loop = () => {
      i = (i + 1) % SHAPES.length;
      gsap.to(blob, { borderRadius: SHAPES[i], duration: 2.4, ease: 'sine.inOut', onComplete: loop });
    };
    loop();

    const touch = window.matchMedia('(hover: none)').matches;
    const onMove = (e: PointerEvent) => {
      const r = blob.getBoundingClientRect();
      gsap.to(blob, {
        x: (e.clientX - r.left - r.width / 2) * 0.15,
        y: (e.clientY - r.top - r.height / 2) * 0.15,
        scale: 1.08,
        duration: 0.5,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    };
    const onLeave = () => {
      gsap.to(blob, { x: 0, y: 0, scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
    };
    if (!touch) {
      blob.addEventListener('pointermove', onMove);
      blob.addEventListener('pointerleave', onLeave);
    }

    return () => {
      gsap.killTweensOf(blob);
      blob.removeEventListener('pointermove', onMove);
      blob.removeEventListener('pointerleave', onLeave);
    };
  }, [reduced]);

  return (
    <div
      ref={blobRef}
      className={`grid h-[220px] w-[220px] flex-none cursor-pointer place-items-center text-[22px] font-semibold tracking-[-0.01em] text-cream will-change-transform ${className}`}
      style={{
        backgroundImage: `linear-gradient(150deg, ${from}, ${to})`,
        borderRadius: SHAPES[0],
      }}
    >
      {children}
    </div>
  );
}
