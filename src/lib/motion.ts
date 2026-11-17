import { useEffect, useState } from 'react';

/**
 * Shared motion tokens for the Showcase set. Kept as a small, dependency-free
 * module so the imported showcase pieces stay diff-able with upstream — same
 * pattern as @/lib/gsap and @/lib/palette.
 */

export const ease = {
  out: [0.22, 1, 0.36, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  smooth: [0.4, 0, 0.2, 1] as const,
};

export const spring = {
  soft: { type: 'spring' as const, stiffness: 200, damping: 26, mass: 0.9 },
  snappy: { type: 'spring' as const, stiffness: 420, damping: 32 },
  liquid: { type: 'spring' as const, stiffness: 260, damping: 22, mass: 1.1 },
};

export const dur = { micro: 0.16, std: 0.28, cinema: 0.9 };

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}
