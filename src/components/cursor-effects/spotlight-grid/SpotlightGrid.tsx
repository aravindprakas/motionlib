// ui-4 — SpotlightGrid
import { useEffect, useRef, type ReactNode } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface SpotlightGridProps {
  cards: ReactNode[];
  /** Grid columns. Default 3. */
  columns?: number;
  /** Spotlight radius in px. Default 320. */
  radius?: number;
  className?: string;
}

/**
 * Grid where a radial spotlight + border glow follow the pointer. One
 * pointermove listener on the grid writes per-card `--mx`/`--my` CSS custom
 * properties; all rendering happens in CSS gradients — zero React re-renders
 * and no style recalcation beyond the custom properties.
 *
 * Border glow: each card's outer layer holds the strong gradient and an inner
 * panel sits 1px inset, so the glow only shows through the hairline ring.
 * Reduced motion / touch: plain hairline cards.
 */
export function SpotlightGrid({ cards, columns = 3, radius = 320, className = '' }: SpotlightGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || reduced || typeof window === 'undefined') return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const cardEls = Array.from(grid.querySelectorAll<HTMLElement>('[data-spot-card]'));

    const onMove = (e: PointerEvent) => {
      // Per-card coordinates: pointer position relative to each card, so a
      // single gradient definition works for every card.
      for (let i = 0; i < cardEls.length; i++) {
        const rect = cardEls[i].getBoundingClientRect();
        cardEls[i].style.setProperty('--mx', `${e.clientX - rect.left}px`);
        cardEls[i].style.setProperty('--my', `${e.clientY - rect.top}px`);
      }
    };
    const onEnter = () => grid.style.setProperty('--spot', '1');
    const onLeave = () => grid.style.setProperty('--spot', '0');

    grid.addEventListener('pointermove', onMove, { passive: true });
    grid.addEventListener('pointerenter', onEnter);
    grid.addEventListener('pointerleave', onLeave);
    return () => {
      grid.removeEventListener('pointermove', onMove);
      grid.removeEventListener('pointerenter', onEnter);
      grid.removeEventListener('pointerleave', onLeave);
    };
  }, [reduced, cards.length]);

  return (
    <div
      ref={gridRef}
      className={`grid gap-2 ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, ['--spot' as string]: 0 }}
    >
      {cards.map((card, i) => (
        <div
          key={i}
          data-spot-card
          className="relative border border-ink/15"
          style={
            reduced
              ? undefined
              : {
                  backgroundImage: `radial-gradient(${radius * 0.6}px circle at var(--mx, -999px) var(--my, -999px), rgba(255,77,35,0.9), transparent 70%)`,
                }
          }
        >
          {/* Inner panel sits 1px inset so the gradient reads as a border glow. */}
          <div className="relative m-px bg-paper">
            {!reduced && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                style={{
                  opacity: 'calc(var(--spot, 0))',
                  backgroundImage: `radial-gradient(${radius}px circle at var(--mx, -999px) var(--my, -999px), rgba(255,77,35,0.12), transparent 65%)`,
                }}
              />
            )}
            {card}
          </div>
        </div>
      ))}
    </div>
  );
}
