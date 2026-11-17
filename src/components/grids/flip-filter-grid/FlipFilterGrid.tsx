// ui-77 — FlipFilterGrid
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { gsap, Flip } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface FlipFilterItem {
  id: string;
  category: string;
  content: ReactNode;
}

export interface FlipFilterGridProps {
  items: FlipFilterItem[];
  /** Filter buttons. Derived from item categories when omitted. */
  filters?: string[];
  /** Per-card stagger in seconds. Default 0.03. */
  stagger?: number;
  /** Grid columns. Default 3. */
  columns?: number;
  className?: string;
}

/**
 * Filterable grid whose cards glide to their new positions via GSAP Flip
 * (free plugin): capture state → toggle `display` classes → `Flip.from()`.
 *
 * Flip capture detail: cards are hidden with `display: none` rather than
 * unmounted, because Flip's onEnter/onLeave diffing needs the elements to
 * exist in both states. Reduced motion swaps instantly (no Flip call).
 */
export function FlipFilterGrid({
  items,
  filters,
  stagger = 0.03,
  columns = 3,
  className = '',
}: FlipFilterGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const flipState = useRef<ReturnType<typeof Flip.getState> | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [active, setActive] = useState('all');
  const reduced = useReducedMotion();

  const allFilters = filters ?? ['all', ...Array.from(new Set(items.map((i) => i.category)))];

  function select(filter: string) {
    if (filter === active) return;
    if (!reduced && gridRef.current) {
      // 1. Record where every card is *before* the DOM changes.
      flipState.current = Flip.getState(gridRef.current.querySelectorAll('[data-flip-card]'));
    }
    setActive(filter);
  }

  // 2. After React applies the new display classes, animate from the record.
  useLayoutEffect(() => {
    const state = flipState.current;
    const grid = gridRef.current;
    if (!state || reduced || !grid) return;
    flipState.current = null;
    tlRef.current?.kill();

    // Prevent grid collapse while Flip positions cards absolutely:
    // lock the height, then release it when the animation completes.
    const gridHeight = grid.getBoundingClientRect().height;
    grid.style.minHeight = `${gridHeight}px`;

    tlRef.current = Flip.from(state, {
      duration: 0.55,
      ease: 'power3.inOut',
      stagger,
      absolute: true, // take cards out of flow while they travel
      onEnter: (els) =>
        gsap.fromTo(els, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.92, duration: 0.3, ease: 'power2.in' }),
      onComplete: () => {
        if (grid) grid.style.minHeight = '';
      },
    }) as gsap.core.Timeline;
  }, [active, stagger, reduced]);

  useLayoutEffect(
    () => () => {
      tlRef.current?.kill();
    },
    [],
  );

  return (
    <div className={className}>
      <div className="flex w-max flex-wrap border border-ink/15" role="tablist" aria-label="Filters">
        {allFilters.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={active === f}
            onClick={() => select(f)}
            className={`cursor-pointer border-r border-ink/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.08em] last:border-r-0 ${
              active === f ? 'bg-ink text-paper' : 'hover:text-accent'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div
        ref={gridRef}
        className="mt-4 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            data-flip-card
            className={`will-change-transform ${active !== 'all' && item.category !== active ? 'hidden' : ''}`}
          >
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
}
