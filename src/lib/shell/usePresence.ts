import { useEffect, useRef, useState } from 'react';

export type PresenceState = 'open' | 'closed';

export interface Presence {
  /** Keep rendering while true — spans the exit transition. */
  mounted: boolean;
  /** Drives `data-state`, which the CSS transition keys off. */
  state: PresenceState;
}

/**
 * Mount/unmount lifecycle for CSS-driven enter and exit.
 *
 * A `data-[state=open]:` transition needs two things React will not give you
 * for free: the element must exist in the DOM for one frame in its *closed*
 * style before flipping to open (otherwise the browser has nothing to
 * interpolate from and the entrance is a hard cut), and it must survive its own
 * exit before unmounting. This owns both.
 *
 * Entry uses a double rAF rather than a timeout — the first frame commits the
 * initial style, the second flips the attribute — so the transition starts on a
 * real painted frame instead of racing the compositor. Exit is a timer matched
 * to `duration`, cleared on re-open so a fast open/close/open never unmounts
 * mid-flight.
 */
export function usePresence(open: boolean, duration = 200): Presence {
  const [mounted, setMounted] = useState(open);
  const [state, setState] = useState<PresenceState>(open ? 'open' : 'closed');
  const timer = useRef<number>();
  const frames = useRef<number[]>([]);

  useEffect(() => {
    const clearFrames = () => {
      frames.current.forEach(cancelAnimationFrame);
      frames.current = [];
    };

    if (open) {
      window.clearTimeout(timer.current);
      setMounted(true);
      clearFrames();
      frames.current.push(
        requestAnimationFrame(() => {
          frames.current.push(requestAnimationFrame(() => setState('open')));
        }),
      );
    } else {
      clearFrames();
      setState('closed');
      timer.current = window.setTimeout(() => setMounted(false), duration);
    }

    return clearFrames;
  }, [open, duration]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { mounted, state };
}
