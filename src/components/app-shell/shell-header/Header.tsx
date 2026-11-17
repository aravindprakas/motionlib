// Header — 64px of chrome that changes state on scroll, not on every frame of it
import { useId, useRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScrollState } from '@/lib/shell/useScrollState';
import { useDisclosure } from '@/lib/shell/useDisclosure';
import { spring } from '@/lib/shell/tokens';

export interface HeaderNavItem {
  id: string;
  label: string;
  href?: string;
}

export interface HeaderProps {
  brand: ReactNode;
  items?: readonly HeaderNavItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  /** Right-hand slot — buttons, an avatar, a popover trigger. */
  actions?: ReactNode;
  /** Slide the bar out of the way while scrolling down, back in on the way up. */
  hideOnScrollDown?: boolean;
  /** Draw a 2px reading-progress rule along the bottom edge. */
  progress?: boolean;
  className?: string;
}

/**
 * A sticky bar whose state is three booleans, so it re-renders about four times
 * in a full-page scroll instead of four hundred.
 *
 * That is the whole design. `useScrollState` watches the scroller and commits to
 * React only when something a consumer can branch on actually changes — crossing
 * the 8px threshold, or reversing direction by more than 6px. Everything
 * continuous stays out of React entirely: the progress rule is a
 * `--scroll-progress` custom property written straight to this node inside a
 * rAF, and `scaleX` reads it in CSS. The rule tracks the scroll per-pixel and
 * costs React nothing.
 *
 * The transition is one `transition-all duration-300 ease-in-out` across
 * background, border, shadow and transform, so the bar settling into its
 * condensed state reads as one gesture rather than four properties finishing at
 * different times. `backdrop-blur-xl` over a 70% ground is what keeps the
 * content underneath legible as it passes without the bar going opaque and
 * flattening the page.
 *
 * `hideOnScrollDown` is the reason direction is debounced at all: an undebounced
 * direction flag makes the bar flicker on the sub-pixel jitter of a trackpad,
 * which is worse than not having the behaviour.
 */
export function Header({
  brand,
  items = [],
  activeId,
  onSelect,
  actions,
  hideOnScrollDown = false,
  progress = false,
  className = '',
}: HeaderProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const menu = useDisclosure();
  const indicatorId = useId();

  const { atTop, condensed, direction } = useScrollState({
    threshold: 8,
    directionDelta: 6,
    progressTarget: progress ? ref : undefined,
  });

  const hidden = hideOnScrollDown && direction === 'down' && condensed && !menu.open;

  return (
    <header
      ref={ref}
      data-state={atTop ? 'top' : 'scrolled'}
      className={[
        'sticky top-0 z-50 h-16 w-full',
        'backdrop-blur-xl bg-white/70 dark:bg-black/70',
        'transition-all duration-300 ease-in-out',
        condensed
          ? 'border-b border-gray-200/70 shadow-[0_1px_24px_rgba(0,0,0,0.06)] dark:border-white/10 dark:shadow-[0_1px_24px_rgba(0,0,0,0.5)]'
          : 'border-b border-transparent shadow-none',
        hidden ? '-translate-y-full' : 'translate-y-0',
        'motion-reduce:transition-none motion-reduce:translate-y-0',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5 md:px-8">
        <div className="flex shrink-0 items-center gap-2.5 text-[15px] font-semibold tracking-[-0.02em]">
          {brand}
        </div>

        {items.length > 0 ? (
          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {items.map((item) => {
                const active = item.id === activeId;
                return (
                  <li key={item.id} className="relative">
                    <a
                      href={item.href ?? '#'}
                      aria-current={active ? 'page' : undefined}
                      onClick={(e) => {
                        if (!item.href) e.preventDefault();
                        onSelect?.(item.id);
                      }}
                      className={[
                        'relative z-10 inline-flex h-9 items-center rounded-[999px] px-3.5 text-[13px] font-medium',
                        'outline-none transition-colors duration-200 ease-out',
                        'focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
                        'focus-visible:ring-offset-white dark:focus-visible:ring-offset-black',
                        active
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
                      ].join(' ')}
                    >
                      {item.label}
                    </a>
                    {active ? (
                      <motion.span
                        aria-hidden
                        layoutId={indicatorId}
                        transition={reduced ? { duration: 0 } : spring.layout}
                        className="absolute inset-0 rounded-[999px] bg-gray-100 dark:bg-white/10"
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : null}

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {actions}

          {items.length > 0 ? (
            <button
              type="button"
              onClick={menu.toggle}
              aria-expanded={menu.open}
              aria-label={menu.open ? 'Close menu' : 'Open menu'}
              className="grid h-10 w-10 place-items-center rounded-[12px] text-gray-600 outline-none transition-colors duration-200 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-gray-300 dark:hover:bg-white/10 md:hidden"
            >
              <span className="relative block h-3.5 w-4">
                <span
                  className={
                    'absolute left-0 block h-[1.5px] w-4 bg-current transition-all duration-300 ease-in-out motion-reduce:transition-none ' +
                    (menu.open ? 'top-1.5 rotate-45' : 'top-0')
                  }
                />
                <span
                  className={
                    'absolute left-0 top-1.5 block h-[1.5px] w-4 bg-current transition-opacity duration-200 ease-in-out motion-reduce:transition-none ' +
                    (menu.open ? 'opacity-0' : 'opacity-100')
                  }
                />
                <span
                  className={
                    'absolute left-0 block h-[1.5px] w-4 bg-current transition-all duration-300 ease-in-out motion-reduce:transition-none ' +
                    (menu.open ? 'top-1.5 -rotate-45' : 'top-3')
                  }
                />
              </span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Reading progress. `--scroll-progress` is written outside React by
          useScrollState, so this rule is per-pixel accurate at zero render cost. */}
      {progress ? (
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-gradient-to-r from-indigo-500 to-fuchsia-500"
          style={{ transform: 'scaleX(var(--scroll-progress, 0))' }}
        />
      ) : null}

      {/* Mobile sheet. Height, not display — a display swap cannot be animated,
          and grid-template-rows animates without measuring the content. */}
      {items.length > 0 ? (
        <div
          className={
            'grid overflow-hidden border-b border-gray-200/70 bg-white/90 backdrop-blur-xl transition-all duration-300 ease-in-out dark:border-white/10 dark:bg-black/90 md:hidden motion-reduce:transition-none ' +
            (menu.open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')
          }
        >
          <nav aria-label="Primary mobile" className="min-h-0 overflow-hidden">
            <ul className="px-5 py-2">
              {items.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href ?? '#'}
                    aria-current={item.id === activeId ? 'page' : undefined}
                    onClick={(e) => {
                      if (!item.href) e.preventDefault();
                      onSelect?.(item.id);
                      menu.onClose();
                    }}
                    className={
                      'block rounded-[12px] px-3 py-2.5 text-[14px] font-medium transition-colors duration-200 ' +
                      (item.id === activeId
                        ? 'bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400')
                    }
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
