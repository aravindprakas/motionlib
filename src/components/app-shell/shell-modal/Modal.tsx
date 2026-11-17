// Modal — 300ms of blur behind, a 95%-scale zoom in front, and focus that comes back
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { usePresence } from '@/lib/shell/usePresence';
import { useFocusTrap } from '@/lib/shell/useFocusTrap';
import { useLockBodyScroll } from '@/lib/shell/useLockBodyScroll';
import { useShellPortal } from '@/lib/shell/PortalContext';

export type ModalSize = 'sm' | 'md' | 'lg';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Rendered under the title and wired to `aria-describedby`. */
  description?: string;
  children?: ReactNode;
  /** Action row, pinned to the bottom of the panel. */
  footer?: ReactNode;
  size?: ModalSize;
  /** Clicking the overlay closes. Turn off for destructive confirmations. */
  dismissOnOverlay?: boolean;
  /** Escape closes. Turn off only when something inside owns Escape. */
  dismissOnEscape?: boolean;
  container?: HTMLElement | null;
  className?: string;
}

const SIZE: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
};

const DURATION = 300;

/**
 * A dialog where the overlay and the panel are one gesture, on purpose.
 *
 * Both run 300ms `ease-out` off the same `data-state`, so the ground goes soft
 * at exactly the rate the panel arrives — the thing that makes a modal feel like
 * the page receded rather than like a box landed on it. The panel enters at
 * `scale-95` with a small upward translate: enough to read as approaching,
 * little enough that the text inside never looks like it is being resampled.
 *
 * `usePresence` mounts the panel one painted frame in its closed style before
 * flipping `data-state`, because a transition needs a start value that actually
 * rendered, and holds it mounted through the exit. Without that the entrance is
 * a hard cut and the exit does not exist — the two failures nearly every
 * hand-rolled modal ships with.
 *
 * The accessibility work is the part that is easy to skip and impossible to
 * retrofit. `role="dialog"` with `aria-modal`, the title wired through
 * `aria-labelledby` and the description through `aria-describedby`, Tab
 * contained inside the panel, and focus returned to whatever opened it — that
 * last one decides whether a keyboard user lands back on the button they pressed
 * or at the top of the document. The tab ring is recomputed on each keypress
 * rather than captured at open, because dialog contents change.
 *
 * Scroll behind the dialog is locked with the scrollbar gutter replaced as
 * padding, so the page does not shift sideways under the blur. The lock is
 * reference-counted, so a popover opened inside the modal does not release it
 * early.
 *
 * `backdrop-blur` is a genuine cost — it is a full-viewport filter — so it is
 * applied to one element that is composited once and never re-blurred during
 * the transition, and the overlay animates opacity only.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  dismissOnOverlay = true,
  dismissOnEscape = true,
  container,
  className = '',
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const themed = useShellPortal();
  const titleId = useId();
  const descId = useId();

  const presence = usePresence(open, DURATION);
  useLockBodyScroll(presence.mounted);
  useFocusTrap(panelRef, presence.mounted);

  useEffect(() => {
    if (!open || !dismissOnEscape) return;
    const onKeyDown = (e: Event) => {
      if ((e as globalThis.KeyboardEvent).key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, dismissOnEscape, onClose]);

  if (!presence.mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div
      data-state={presence.state}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6"
    >
      {/* Overlay. Opacity only — the blur is set once and never re-evaluated
          mid-transition, which is what keeps a full-viewport filter cheap. */}
      <div
        aria-hidden
        onClick={dismissOnOverlay ? onClose : undefined}
        data-state={presence.state}
        className={[
          'absolute inset-0 bg-gray-900/25 backdrop-blur-[6px] dark:bg-black/55',
          'opacity-0 data-[state=open]:opacity-100',
          'transition-opacity duration-300 ease-out',
          'motion-reduce:transition-none motion-reduce:opacity-100',
        ].join(' ')}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        data-state={presence.state}
        className={[
          'relative flex max-h-[calc(100vh-3rem)] w-full flex-col overflow-hidden outline-none',
          'rounded-[24px] border border-gray-100 bg-white dark:border-white/10 dark:bg-[#141417]',
          'shadow-[0_24px_80px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.7)]',
          'origin-center scale-95 translate-y-2 opacity-0',
          'data-[state=open]:scale-100 data-[state=open]:translate-y-0 data-[state=open]:opacity-100',
          'transition-all duration-300 ease-out',
          'motion-reduce:transition-none motion-reduce:scale-100 motion-reduce:translate-y-0 motion-reduce:opacity-100',
          SIZE[size],
          className,
        ].join(' ')}
      >
        <header className="flex items-start gap-4 px-6 pt-6">
          <div className="min-w-0 flex-1">
            <h2
              id={titleId}
              className="text-[19px] font-semibold tracking-[-0.025em] text-gray-900 dark:text-white"
            >
              {title}
            </h2>
            {description ? (
              <p
                id={descId}
                className="mt-1.5 text-[13.5px] leading-relaxed text-gray-500 dark:text-gray-400"
              >
                {description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-mr-1.5 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-[12px] text-gray-400 outline-none transition-all duration-200 ease-out hover:bg-gray-100 hover:text-gray-700 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-white/10 dark:hover:text-gray-200"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
              <path d="m4 4 8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {children ? (
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 text-[14px] leading-relaxed text-gray-600 dark:text-gray-300">
            {children}
          </div>
        ) : (
          <div className="h-5" />
        )}

        {footer ? (
          <footer className="flex shrink-0 items-center justify-end gap-2.5 border-t border-gray-100 px-6 py-4 dark:border-white/10">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    container ?? themed ?? document.body,
  );
}
