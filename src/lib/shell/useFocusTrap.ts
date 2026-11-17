import { useEffect, type RefObject } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** Visible, focusable descendants in DOM order. */
function tabbable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement,
  );
}

/**
 * Keyboard containment for a modal surface.
 *
 * Moves focus into `ref` on activation, wraps Tab and Shift+Tab at the ends of
 * the tab ring, and returns focus to whatever was focused before — which is the
 * half people skip, and the half that decides whether a keyboard user is left
 * stranded at the top of the document when the dialog closes.
 *
 * The tab ring is recomputed on each keypress rather than cached at open: the
 * contents of a dialog change (a form reveals a field, a step advances), and a
 * list captured on mount goes stale the moment they do.
 *
 * Focus is moved on the frame *after* activation so the entrance transition has
 * started — focusing an element mid-`scale(0.95)` makes some browsers scroll the
 * un-transformed box into view and jump the page.
 */
export function useFocusTrap(ref: RefObject<HTMLElement>, active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const root = ref.current;
    if (!root) return;

    const restore = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => {
      const first = tabbable(root)[0];
      (first ?? root).focus({ preventScroll: true });
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = tabbable(root);
      if (items.length === 0) {
        e.preventDefault();
        root.focus({ preventScroll: true });
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active_ = document.activeElement;
      if (e.shiftKey && (active_ === first || !root.contains(active_))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active_ === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown, true);
      restore?.focus?.({ preventScroll: true });
    };
  }, [ref, active]);
}
