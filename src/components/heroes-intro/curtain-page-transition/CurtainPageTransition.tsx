// ui-117 — CurtainPageTransition
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface CurtainPageTransitionProps {
  /** Change this to play a cover → swap → reveal transition. */
  transitionKey: string | number;
  children: ReactNode;
  /** Vertical strips in the curtain. Default 5. */
  panelCount?: number;
  /** Curtain colour. Default near-black ink. */
  color?: string;
  /** Seconds for each half (cover / reveal). Default 0.6. */
  duration?: number;
  className?: string;
}

const EASE = [0.76, 0, 0.24, 1] as const;

type Phase = 'idle' | 'cover' | 'reveal';

/**
 * Page-transition curtain: vertical panels sweep up to cover the view, the
 * content swaps while hidden, then the panels continue upward to reveal it.
 *
 * Panels animate `y` between 100% → 0% → −100% (transform-only), staggered
 * left to right; the content swap happens exactly when the *last* panel
 * finishes covering. Reduced motion swaps content instantly.
 */
export function CurtainPageTransition({
  transitionKey,
  children,
  panelCount = 5,
  color = '#0c0b0e',
  duration = 0.6,
  className = '',
}: CurtainPageTransitionProps) {
  const [displayed, setDisplayed] = useState<ReactNode>(children);
  const [phase, setPhase] = useState<Phase>('idle');
  const latestChildren = useRef(children);
  const lastKey = useRef(transitionKey);
  const reduced = useReducedMotion();

  latestChildren.current = children;

  useEffect(() => {
    if (transitionKey === lastKey.current) {
      // Same view — keep content fresh without a transition.
      if (phase === 'idle') setDisplayed(latestChildren.current);
      return;
    }
    lastKey.current = transitionKey;
    if (reduced) {
      setDisplayed(latestChildren.current);
      return;
    }
    setPhase('cover');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transitionKey, reduced]);

  const stagger = 0.06;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {displayed}
      {phase !== 'idle' && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-50 flex">
          {Array.from({ length: panelCount }, (_, i) => (
            <motion.div
              key={i}
              initial={{ y: '100%' }}
              animate={{ y: phase === 'cover' ? '0%' : '-100%' }}
              transition={{ duration, ease: EASE, delay: i * stagger }}
              onAnimationComplete={() => {
                // The last panel drives the phase machine.
                if (i !== panelCount - 1) return;
                if (phase === 'cover') {
                  setDisplayed(latestChildren.current); // swap while hidden
                  setPhase('reveal');
                } else if (phase === 'reveal') {
                  setPhase('idle');
                }
              }}
              className="h-full flex-1 will-change-transform"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
