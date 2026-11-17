// Popover — mounts one frame closed so the 200ms entrance has something to run from
import {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { useDisclosure } from '@/lib/shell/useDisclosure';
import { usePresence } from '@/lib/shell/usePresence';
import { useAnchoredPosition, type Align, type Side } from '@/lib/shell/useAnchoredPosition';
import { useShellPortal } from '@/lib/shell/PortalContext';

export interface PopoverProps {
  /** A single focusable element. Gets the aria wiring and the click handler. */
  trigger: ReactElement;
  children: ReactNode;
  side?: Side;
  align?: Align;
  offset?: number;
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** `menu` adds arrow-key roving and closes on activation. */
  role?: 'dialog' | 'menu';
  /** Portal target. Defaults to the nearest themed container, else the body. */
  container?: HTMLElement | null;
  className?: string;
}

export interface PopoverItemProps {
  children: ReactNode;
  onSelect?: () => void;
  icon?: ReactNode;
  /** Right-aligned hint — a shortcut, a count. */
  meta?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
}

const DURATION = 200;

const ITEM_SELECTOR = '[data-popover-item]:not([aria-disabled="true"])';

/**
 * A dropdown that actually animates in, which takes more care than it looks.
 *
 * `data-[state=open]:scale-100` only produces a transition if the element spent
 * at least one painted frame at `scale-95` first. Mount it already open and the
 * browser has nothing to interpolate from, so the entrance is a hard cut — the
 * single most common reason a popover "has a transition" in the CSS and no
 * animation on screen. `usePresence` owns that: mount closed, double-rAF, then
 * flip `data-state`, and hold the element mounted through the 200ms exit before
 * unmounting.
 *
 * 200ms is not arbitrary either. A dropdown is a response to a click that has
 * already happened, so the animation is confirmation, not spectacle; past about
 * 250ms it stops feeling like the menu opened and starts feeling like it had to
 * be fetched.
 *
 * `transform-origin` is resolved from where the panel actually landed, not
 * declared up front. `useAnchoredPosition` tries the requested side, flips if it
 * does not fit, shifts along the cross axis to stay on screen, and reports the
 * corner nearest the trigger — so a menu that flipped above the button grows
 * from its bottom edge instead of appearing to come from somewhere else. The
 * panel is `position: fixed` and moved by transform only, so tracking the anchor
 * on scroll never triggers layout.
 *
 * Portalled to the body, so no ancestor's `overflow` or stacking context can
 * clip it. Escape closes, click-outside closes, focus returns to the trigger,
 * and `role="menu"` adds arrow-key roving with Home/End.
 */
export function Popover({
  trigger,
  children,
  side = 'bottom',
  align = 'end',
  offset = 8,
  open: controlled,
  defaultOpen,
  onOpenChange,
  role = 'dialog',
  container,
  className = '',
}: PopoverProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const themed = useShellPortal();

  const disclosure = useDisclosure({ open: controlled, defaultOpen, onOpenChange });
  const { open, onClose, toggle } = disclosure;
  const presence = usePresence(open, DURATION);
  const position = useAnchoredPosition(anchorRef, panelRef, {
    side,
    align,
    offset,
    enabled: presence.mounted,
  });

  // Dismissal. Pointerdown rather than click, so a drag that starts outside
  // closes on the way down instead of on release somewhere unrelated.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      onClose();
    };
    const onKeyDown = (e: Event) => {
      if ((e as globalThis.KeyboardEvent).key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  // Focus the panel once it is up, and hand focus back to the trigger on close.
  useEffect(() => {
    if (!presence.mounted) return;
    if (presence.state !== 'open') return;
    const first = panelRef.current?.querySelector<HTMLElement>(ITEM_SELECTOR);
    (first ?? panelRef.current)?.focus({ preventScroll: true });
  }, [presence.mounted, presence.state]);

  const restore = useRef(false);
  useEffect(() => {
    if (open) {
      restore.current = true;
      return;
    }
    if (restore.current) {
      restore.current = false;
      anchorRef.current?.querySelector<HTMLElement>('button,a,[tabindex]')?.focus({
        preventScroll: true,
      });
    }
  }, [open]);

  const onPanelKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (role !== 'menu') return;
      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(ITEM_SELECTOR));
      if (items.length === 0) return;
      const index = items.indexOf(document.activeElement as HTMLElement);

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const step = e.key === 'ArrowDown' ? 1 : -1;
        const next = (index + step + items.length) % items.length;
        items[next].focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        items[0].focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        items[items.length - 1].focus();
      }
    },
    [role],
  );

  const triggerEl = cloneElement(trigger, {
    'aria-haspopup': role === 'menu' ? 'menu' : 'dialog',
    'aria-expanded': open,
    'aria-controls': presence.mounted ? panelId : undefined,
    onClick: (e: ReactMouseEvent) => {
      trigger.props.onClick?.(e);
      if (!e.defaultPrevented) toggle();
    },
  });

  return (
    <>
      <span ref={anchorRef} className="inline-flex">
        {triggerEl}
      </span>

      {presence.mounted && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={panelRef}
              id={panelId}
              role={role}
              tabIndex={-1}
              data-state={presence.state}
              onKeyDown={onPanelKeyDown}
              style={{
                position: 'fixed',
                left: 0,
                top: 0,
                transform: 'translate3d(' + position.x + 'px,' + position.y + 'px,0)',
                transformOrigin: position.origin,
                visibility: position.ready ? 'visible' : 'hidden',
              }}
              className={[
                'z-[60] min-w-[220px] overflow-hidden outline-none',
                'rounded-[18px] border border-gray-100 bg-white/95 backdrop-blur-xl',
                'shadow-[0_16px_48px_rgba(0,0,0,0.12)]',
                'dark:border-white/10 dark:bg-[#141417]/95 dark:shadow-[0_16px_48px_rgba(0,0,0,0.6)]',
                'scale-95 opacity-0 data-[state=open]:scale-100 data-[state=open]:opacity-100',
                'transition-all duration-200 ease-out',
                'motion-reduce:transition-none motion-reduce:scale-100 motion-reduce:opacity-100',
                className,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {children}
            </div>,
            container ?? themed ?? document.body,
          )
        : null}
    </>
  );
}

/** A row inside a `role="menu"` popover. Focusable, and part of the roving ring. */
export function PopoverItem({
  children,
  onSelect,
  icon,
  meta,
  danger = false,
  disabled = false,
}: PopoverItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      data-popover-item
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={disabled ? undefined : onSelect}
      className={[
        'flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-[13.5px] outline-none',
        'transition-colors duration-150 ease-out',
        'focus-visible:bg-gray-50 dark:focus-visible:bg-white/[0.06]',
        disabled
          ? 'cursor-not-allowed text-gray-300 dark:text-gray-600'
          : danger
            ? 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10'
            : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/[0.06]',
      ].join(' ')}
    >
      {icon ? <span className="grid h-4 w-4 shrink-0 place-items-center opacity-70">{icon}</span> : null}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {meta ? <span className="shrink-0 text-[11px] text-gray-400 dark:text-gray-500">{meta}</span> : null}
    </button>
  );
}

/** Hairline between groups of items. */
export function PopoverSeparator() {
  return <div role="separator" className="my-1 h-px bg-gray-100 dark:bg-white/10" />;
}
