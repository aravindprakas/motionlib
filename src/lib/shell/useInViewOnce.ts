import { useEffect, useState, type RefObject } from 'react';
import { useScroller } from '@/lib/SmoothScroll';

export interface UseInViewOnceOptions {
  /** Fraction of the element that must be visible. */
  amount?: number;
  /** Shrink/grow the observation box, e.g. '0px 0px -12% 0px'. */
  margin?: string;
  /** Skip observation entirely and report visible immediately. */
  disabled?: boolean;
}

/**
 * One-shot intersection. Fires once, then disconnects.
 *
 * Entrance animations are the one case where a *stateful* observer is wrong:
 * re-playing a reveal because the user scrolled back up is not a feature, it is
 * a page that will not sit still. This latches true and stops observing, so the
 * cost after first paint is exactly zero.
 *
 * The observer is rooted on the ambient Lenis scroller when there is one — an
 * observer left rooted on the viewport inside a scrolled container fires on
 * mount for everything, which is the usual reason a staggered reveal appears to
 * have already happened by the time you reach it.
 */
export function useInViewOnce(
  ref: RefObject<Element>,
  { amount = 0.2, margin = '0px 0px -10% 0px', disabled = false }: UseInViewOnceOptions = {},
): boolean {
  const scroller = useScroller();
  const [seen, setSeen] = useState(disabled);

  useEffect(() => {
    if (disabled || seen) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { root: scroller?.current ?? null, rootMargin: margin, threshold: amount },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, scroller, amount, margin, disabled, seen]);

  return seen;
}
