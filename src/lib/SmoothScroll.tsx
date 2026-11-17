import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { useReducedMotion } from './useReducedMotion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Ref to the scrollable wrapper element. Scroll-driven components read this
 * so their ScrollTriggers / framer `useScroll` target the Lenis-driven
 * container instead of the window.
 */
const ScrollerContext = createContext<RefObject<HTMLDivElement> | null>(null);

export function useScroller(): RefObject<HTMLDivElement> | null {
  return useContext(ScrollerContext);
}

export interface SmoothScrollProps {
  children: ReactNode;
  className?: string;
}

/**
 * Lenis provider for an isolated scroll area.
 *
 * Wiring (per spec): Lenis drives the native scrollTop of `wrapper`, GSAP's
 * ticker drives Lenis' rAF, and every Lenis scroll event pushes a
 * ScrollTrigger.update so pin/scrub stay perfectly in sync.
 *
 * Reduced motion: Lenis is skipped entirely — native scrolling remains, and
 * consumers render their own static fallbacks.
 */
export function SmoothScroll({ children, className = '' }: SmoothScrollProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    if (reduced) {
      // Native scroll; still refresh so ScrollTriggers measure this scroller.
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({ wrapper, content });
    lenis.on('scroll', ScrollTrigger.update);

    // GSAP ticker time is in seconds; Lenis expects milliseconds.
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    // Lenis owns frame pacing — disable GSAP's lag smoothing so scrub values
    // never jump after a dropped frame.
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [reduced]);

  return (
    <ScrollerContext.Provider value={wrapperRef}>
      <div
        ref={wrapperRef}
        className={`h-full overflow-y-auto overflow-x-hidden ${className}`}
      >
        <div ref={contentRef}>{children}</div>
      </div>
    </ScrollerContext.Provider>
  );
}
