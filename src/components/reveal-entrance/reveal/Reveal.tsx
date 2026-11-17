// ui-59 — Reveal & Blink
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface RevealProps {
  children: ReactNode;
  /** Transition delay in ms — useful for staggering sibling reveals. Default 0. */
  delay?: number;
  className?: string;
}

/**
 * Fades and slides its child up the first time it scrolls into view
 * (IntersectionObserver, disconnects after firing — one-shot).
 *
 * Fix vs. the Store original: reduced motion now renders instantly visible
 * with no transition instead of still animating.
 */
export function Reveal({ children, delay = 0, className = '' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <div
      ref={ref}
      className={`${reduced ? '' : 'transition-all duration-700 ease-out'} ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      } ${className}`}
      style={reduced ? undefined : { transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
