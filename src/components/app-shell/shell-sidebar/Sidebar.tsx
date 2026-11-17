// Sidebar — 280px at rest, 320px under the pointer, 76px when you put it away
import { useId, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useCoarsePointer } from '@/lib/useSizeBand';
import { useSidebarState, type SidebarWidth } from '@/lib/shell/useSidebarState';
import { spring } from '@/lib/shell/tokens';

export interface SidebarItem {
  id: string;
  label: string;
  icon: ReactNode;
  /** Rendered as a pill on the right. Stays visible when collapsed, as a dot. */
  badge?: string | number;
  href?: string;
}

export interface SidebarGroup {
  id: string;
  label?: string;
  items: readonly SidebarItem[];
}

export interface SidebarProps {
  groups: readonly SidebarGroup[];
  activeId?: string;
  onSelect?: (id: string) => void;
  header?: ReactNode;
  footer?: ReactNode;
  /** Start collapsed to the icon rail. */
  defaultCollapsed?: boolean;
  /** Controlled expansion, if the app owns the state. */
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
}

const WIDTH: Record<SidebarWidth, string> = {
  collapsed: 'w-[76px]',
  resting: 'w-[280px]',
  peeked: 'w-[320px]',
};

/**
 * A rail with three widths, because two is not enough to be useful.
 *
 * Hover-only sidebars lose everything the moment the pointer leaves, so you
 * cannot read one while working somewhere else. Pin-only sidebars cost a click
 * every time you want a glance. Both live here and compose: 280px at rest,
 * 320px while the pointer is inside it, 76px when you collapse it — and peeking
 * a collapsed rail brings it to 280px without un-collapsing it, so letting go
 * returns it to where you left it rather than where you last hovered.
 *
 * The width transition is `transition-all duration-300
 * ease-[cubic-bezier(0.4,0,0.2,1)]` on the rail itself. Width is a layout
 * property — this is the one place in the set that animates one deliberately,
 * because a sidebar that widens by transform would slide over the content
 * instead of moving it, and the whole point of the gesture is that the page
 * makes room. The cost is bounded by `contain: layout paint`: the reflow stops
 * at the rail's own box and never reaches the main column.
 *
 * Labels cross-fade against that width with a shorter, offset transition so they
 * are gone before the rail is narrow enough to clip them — the detail that
 * separates a collapse that feels designed from one that looks like text being
 * cut off. `aria-hidden` follows the same state, so a screen reader is never
 * offered a label that is mid-fade.
 *
 * The active indicator is one `layoutId` element that travels between items, so
 * moving between sections is a continuous move rather than two cross-fades.
 * Keyboard focus entering the rail peeks it open — tabbing through labels you
 * cannot read is the failure this pattern usually ships with.
 */
export function Sidebar({
  groups,
  activeId,
  onSelect,
  header,
  footer,
  defaultCollapsed = false,
  expanded,
  onExpandedChange,
  className = '',
}: SidebarProps) {
  const reduced = useReducedMotion();
  const coarse = useCoarsePointer();
  const indicatorId = useId();

  const rail = useSidebarState({
    defaultOpen: !defaultCollapsed,
    open: expanded,
    onOpenChange: onExpandedChange,
    hoverEnabled: !coarse,
  });

  const showLabels = rail.width !== 'collapsed';

  return (
    <aside
      {...rail.handlers}
      data-width={rail.width}
      style={{ contain: 'layout paint' }}
      className={[
        'group/rail relative flex h-full shrink-0 flex-col overflow-hidden',
        'border-r border-gray-100 bg-white dark:border-white/10 dark:bg-white/[0.02]',
        'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
        'motion-reduce:transition-none',
        WIDTH[rail.width],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex h-16 shrink-0 items-center gap-3 px-[18px]">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[13px] font-semibold text-white">
          {header ?? 'A'}
        </div>
        <span
          aria-hidden={!showLabels}
          className={
            'min-w-0 flex-1 truncate text-[14px] font-semibold tracking-[-0.02em] transition-all duration-200 ease-out motion-reduce:transition-none ' +
            (showLabels ? 'opacity-100 delay-100' : 'translate-x-2 opacity-0 delay-0')
          }
        >
          Aperture
        </span>
      </div>

      <nav aria-label="Sections" className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-2">
        {groups.map((group) => (
          <div key={group.id} className="mb-5 last:mb-0">
            {group.label ? (
              <p
                aria-hidden={!showLabels}
                className={
                  'mb-1.5 h-4 truncate px-3 text-[10px] font-medium uppercase tracking-[0.18em] text-gray-400 transition-all duration-200 ease-out dark:text-gray-500 motion-reduce:transition-none ' +
                  (showLabels ? 'opacity-100 delay-100' : 'translate-x-2 opacity-0')
                }
              >
                {group.label}
              </p>
            ) : null}

            <ul className="space-y-0.5">
              {group.items.map((entry) => {
                const active = entry.id === activeId;
                return (
                  <li key={entry.id} className="relative">
                    <a
                      href={entry.href ?? '#'}
                      aria-current={active ? 'page' : undefined}
                      title={showLabels ? undefined : entry.label}
                      onClick={(e) => {
                        if (!entry.href) e.preventDefault();
                        onSelect?.(entry.id);
                      }}
                      className={[
                        'relative z-10 flex h-11 items-center gap-3 rounded-[14px] px-[13px] outline-none',
                        'transition-colors duration-200 ease-out',
                        'focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
                        'focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0b0b0d]',
                        active
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
                      ].join(' ')}
                    >
                      <span className="grid h-5 w-5 shrink-0 place-items-center">{entry.icon}</span>

                      <span
                        aria-hidden={!showLabels}
                        className={
                          'min-w-0 flex-1 truncate text-[13.5px] font-medium transition-all duration-200 ease-out motion-reduce:transition-none ' +
                          (showLabels ? 'opacity-100 delay-100' : 'translate-x-2 opacity-0 delay-0')
                        }
                      >
                        {entry.label}
                      </span>

                      {entry.badge != null ? (
                        showLabels ? (
                          <span className="tnum shrink-0 rounded-[999px] bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 transition-opacity duration-200 dark:bg-white/10 dark:text-gray-300">
                            {entry.badge}
                          </span>
                        ) : (
                          <span
                            aria-hidden
                            className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-[999px] bg-indigo-500"
                          />
                        )
                      ) : null}
                    </a>

                    {active ? (
                      <motion.span
                        aria-hidden
                        layoutId={indicatorId}
                        transition={reduced ? { duration: 0 } : spring.layout}
                        className="absolute inset-0 rounded-[14px] bg-gray-100 dark:bg-white/10"
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-gray-100 p-3 dark:border-white/10">
        {footer}
        <button
          type="button"
          onClick={rail.toggle}
          aria-expanded={rail.expanded}
          aria-label={rail.expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          className="mt-2 flex h-10 w-full items-center gap-3 rounded-[14px] px-[13px] text-gray-400 outline-none transition-colors duration-200 hover:bg-gray-50 hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-white/5 dark:hover:text-gray-200"
        >
          <svg
            viewBox="0 0 20 20"
            className={
              'h-5 w-5 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none ' +
              (rail.expanded ? '' : 'rotate-180')
            }
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden
          >
            <path d="M11.5 5.5 7 10l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 4v12" strokeLinecap="round" opacity="0.45" />
          </svg>
          <span
            aria-hidden={!showLabels}
            className={
              'truncate text-[12.5px] font-medium transition-all duration-200 ease-out motion-reduce:transition-none ' +
              (showLabels ? 'opacity-100 delay-100' : 'translate-x-2 opacity-0 delay-0')
            }
          >
            Collapse
          </span>
        </button>
      </div>
    </aside>
  );
}
