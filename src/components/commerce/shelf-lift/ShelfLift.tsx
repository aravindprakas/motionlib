// ShelfLift — a product grid that acknowledges the cursor before it arrives
import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface ShelfItem {
  name: string;
  price: string;
  /** Fallback colour behind the shot. */
  hex: string;
  /** Product image. Falls back to the flat colour when absent. */
  src?: string;
  meta?: string;
}

export interface ShelfLiftProps {
  items: ShelfItem[];
  /** Pointer influence radius in px. Default 260. */
  radius?: number;
  /** Peak lift in px. Default 6. */
  lift?: number;
  className?: string;
}

/**
 * Cards sit on hairline shelves. As the pointer approaches, a card rises a few
 * pixels and its shelf tightens under it — proportional to proximity, so the
 * whole grid responds continuously instead of snapping on `:hover`.
 *
 * The point is pre-hover feedback: a shopper scanning a grid learns which card
 * they are about to commit to a frame or two before they get there, which is
 * the difference between a grid that feels responsive and one that feels late.
 *
 * One pointer listener on the grid — not one per card — with the work coalesced
 * into a single rAF, writing two CSS custom properties per card. Nothing enters
 * React state, so a 40-card grid costs the same as a 4-card one. Under reduced
 * motion the listener is never attached.
 */
export function ShelfLift({ items, radius = 260, lift = 6, className = '' }: ShelfLiftProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || reduced) return;

    const cards = Array.from(grid.querySelectorAll<HTMLElement>('[data-card]'));
    let raf = 0;
    let px = 0;
    let py = 0;

    // Centres are cached and only refreshed on resize — reading them per move
    // would force a layout flush on every pointer event.
    let centres: Array<[number, number]> = [];
    const recentre = () => {
      centres = cards.map((c) => {
        const r = c.getBoundingClientRect();
        return [r.left + r.width / 2, r.top + r.height / 2];
      });
    };

    const paint = () => {
      raf = 0;
      for (let i = 0; i < cards.length; i++) {
        const [cx, cy] = centres[i];
        const d = Math.hypot(px - cx, py - cy);
        const f = Math.max(0, 1 - d / radius);
        // Ease the falloff so the near field is decisive and the far field calm.
        const e = f * f;
        cards[i].style.setProperty('--lift', `${(-lift * e).toFixed(2)}px`);
        cards[i].style.setProperty('--near', e.toFixed(3));
      }
    };

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      px = -9999;
      py = -9999;
      if (!raf) raf = requestAnimationFrame(paint);
    };

    recentre();
    const ro = new ResizeObserver(recentre);
    ro.observe(grid);
    window.addEventListener('scroll', recentre, { passive: true });
    grid.addEventListener('pointermove', onMove);
    grid.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('scroll', recentre);
      grid.removeEventListener('pointermove', onMove);
      grid.removeEventListener('pointerleave', onLeave);
    };
  }, [items, radius, lift, reduced]);

  return (
    <div ref={gridRef} className={`grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 ${className}`}>
      {items.map((it) => (
        <article key={it.name} data-card className="group cursor-pointer">
          <div
            className="aspect-[3/4] overflow-hidden border border-ink transition-transform duration-200 ease-out"
            style={{ background: it.hex, transform: 'translate3d(0, var(--lift, 0px), 0)' }}
          >
            {it.src && (
              <img src={it.src} alt={it.name} className="h-full w-full object-cover" loading="lazy" />
            )}
          </div>
          {/* The shelf: a hairline that darkens and draws inward as you near. */}
          <div className="relative mt-2 h-px w-full bg-ink/15">
            <div
              className="absolute inset-y-0 left-1/2 -translate-x-1/2 bg-accent"
              style={{
                width: 'calc(var(--near, 0) * 100%)',
                height: 'calc(1px + var(--near, 0) * 1px)',
              }}
            />
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em]">{it.name}</p>
            <p className="font-mono text-[11px]">{it.price}</p>
          </div>
          {it.meta && <p className="mt-1 text-[11px] text-ink/50">{it.meta}</p>}
        </article>
      ))}
    </div>
  );
}
