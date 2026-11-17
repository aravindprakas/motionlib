import { useEffect, useRef, useState, type RefObject } from 'react';
import { useScroller } from '@/lib/SmoothScroll';

export type ScrollDirection = 'up' | 'down';

export interface ScrollState {
  /** Within `threshold` px of the top. The header's transparent state. */
  atTop: boolean;
  /** Past `threshold` px. The header's condensed / bordered state. */
  condensed: boolean;
  /** Last committed travel direction, debounced by `directionDelta`. */
  direction: ScrollDirection;
}

export interface UseScrollStateOptions {
  /** px of travel before `condensed` flips true. */
  threshold?: number;
  /** px of travel in one direction before `direction` flips. Kills jitter. */
  directionDelta?: number;
  /**
   * Optional element that receives `--scroll-progress` (0→1 through the
   * document) as a CSS custom property, written every frame *outside* React.
   */
  progressTarget?: RefObject<HTMLElement>;
}

const DEFAULTS: Required<Omit<UseScrollStateOptions, 'progressTarget'>> = {
  threshold: 8,
  directionDelta: 6,
};

/**
 * Scroll position as *discrete state*, not as a number.
 *
 * A header that re-renders on every scroll event is the single most common way
 * to lose the frame budget on an otherwise cheap page: 60 renders a second of a
 * subtree that only ever needed to know one boolean. This hook watches the
 * scroller and commits to React only when a value a consumer can actually
 * branch on *changes* — crossing the threshold, or reversing direction by more
 * than `directionDelta`. Steady scrolling in one direction re-renders zero
 * times.
 *
 * The continuous channel is still available, but it never goes through React:
 * `progressTarget` gets `--scroll-progress` written straight to its style each
 * frame, for a progress rule or a scrubbed blur that wants per-pixel fidelity.
 *
 * Reads are rAF-coalesced with cancel-and-request (a frame requested while the
 * tab is hidden may never run, and a stored-id guard would wedge the handler
 * shut for the rest of the session), and the listener is passive so it can
 * never block the scroll thread. Under `SmoothScroll` the Lenis wrapper is the
 * scroller; standalone it falls back to the window.
 */
export function useScrollState(options: UseScrollStateOptions = {}): ScrollState {
  const { threshold, directionDelta } = { ...DEFAULTS, ...options };
  const { progressTarget } = options;
  const scroller = useScroller();

  const [state, setState] = useState<ScrollState>({
    atTop: true,
    condensed: false,
    direction: 'up',
  });
  const committed = useRef(state);
  // Where the current run of travel started — direction only flips once the
  // pointer has moved `directionDelta` away from this pivot.
  const pivot = useRef(0);
  const last = useRef(0);

  useEffect(() => {
    const el = scroller?.current ?? null;
    const source: HTMLElement | Window = el ?? window;
    let frame = 0;

    const measure = () => {
      const y = el ? el.scrollTop : window.scrollY;
      const max = el
        ? el.scrollHeight - el.clientHeight
        : document.documentElement.scrollHeight - window.innerHeight;

      if (progressTarget?.current) {
        progressTarget.current.style.setProperty(
          '--scroll-progress',
          max > 0 ? (y / max).toFixed(4) : '0',
        );
      }

      const condensed = y > threshold;
      let direction = committed.current.direction;
      if (y > last.current) {
        if (direction === 'up') pivot.current = last.current;
        if (y - pivot.current > directionDelta) direction = 'down';
      } else if (y < last.current) {
        if (direction === 'down') pivot.current = last.current;
        if (pivot.current - y > directionDelta) direction = 'up';
      }
      last.current = y;

      const next: ScrollState = { atTop: y <= threshold, condensed, direction };
      const prev = committed.current;
      if (
        next.atTop !== prev.atTop ||
        next.condensed !== prev.condensed ||
        next.direction !== prev.direction
      ) {
        committed.current = next;
        setState(next);
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    measure();
    source.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      source.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [scroller, threshold, directionDelta, progressTarget]);

  return state;
}
