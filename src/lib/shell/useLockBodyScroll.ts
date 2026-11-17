import { useLayoutEffect } from 'react';

let locks = 0;
let restore: (() => void) | null = null;

/**
 * Freeze the page behind an overlay without the layout shifting.
 *
 * Setting `overflow: hidden` removes the scrollbar, the content gets that width
 * back, and everything on the page jumps a few pixels sideways — visible, and
 * exactly the wrong impression under a dialog that is otherwise animating
 * smoothly. The gutter is measured and replaced as padding.
 *
 * Locks are reference-counted: nested overlays (a popover inside a modal) each
 * take one, and the page is only released when the last of them lets go.
 */
export function useLockBodyScroll(active: boolean): void {
  useLayoutEffect(() => {
    if (!active) return;

    if (locks === 0) {
      const body = document.body;
      const gutter = window.innerWidth - document.documentElement.clientWidth;
      const prevOverflow = body.style.overflow;
      const prevPadding = body.style.paddingRight;
      body.style.overflow = 'hidden';
      if (gutter > 0) {
        const current = parseFloat(window.getComputedStyle(body).paddingRight) || 0;
        body.style.paddingRight = `${current + gutter}px`;
      }
      restore = () => {
        body.style.overflow = prevOverflow;
        body.style.paddingRight = prevPadding;
      };
    }
    locks += 1;

    return () => {
      locks -= 1;
      if (locks === 0) {
        restore?.();
        restore = null;
      }
    };
  }, [active]);
}
