// BundleTally — bought-together items physically join the bundle
import { useCallback, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface BundleItem {
  name: string;
  price: number;
  hex: string;
  /** Product thumbnail. The flying clone carries it too. */
  src?: string;
  /** Locked into the bundle and not removable, e.g. the item being viewed. */
  fixed?: boolean;
}

export interface BundleTallyProps {
  items: BundleItem[];
  /** Discount applied once two or more optional items are added. Default 0.1. */
  bundleDiscount?: number;
  format?: (n: number) => string;
  className?: string;
}

interface Flight {
  id: number;
  hex: string;
  src?: string;
  from: DOMRect;
  to: DOMRect;
}

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

/**
 * Ticking an add-on sends its swatch across the panel and docks it onto the
 * bundle stack; the total re-tallies as it lands.
 *
 * Cross-sell blocks fail when the total silently updates somewhere the shopper
 * is not looking — they tick a box, the number three hundred pixels away
 * changes, and the connection is never made. Moving the thing itself draws the
 * shopper's eye along the exact path from cause to effect, so the new total
 * arrives already explained.
 *
 * A FLIP hop: both rects are measured once at the click, and a single fixed
 * clone is transformed between them. The clone is `position: fixed`, so it is
 * immune to the layout it is flying over, and it is discarded on transition
 * end — the DOM never accumulates. Reduced motion docks instantly.
 */
export function BundleTally({
  items,
  bundleDiscount = 0.1,
  format = inr,
  className = '',
}: BundleTallyProps) {
  const stackRef = useRef<HTMLDivElement>(null);
  const seq = useRef(0);
  const [picked, setPicked] = useState<number[]>(() =>
    items.map((it, i) => (it.fixed ? i : -1)).filter((i) => i >= 0),
  );
  const [flights, setFlights] = useState<Flight[]>([]);
  const reduced = useReducedMotion();

  const toggle = useCallback(
    (index: number, swatch: HTMLElement | null) => {
      const on = picked.includes(index);
      if (on) {
        setPicked((p) => p.filter((i) => i !== index));
        return;
      }
      setPicked((p) => [...p, index]);
      if (reduced || !swatch || !stackRef.current) return;

      const id = ++seq.current;
      setFlights((f) => [
        ...f,
        {
          id,
          hex: items[index].hex,
          src: items[index].src,
          from: swatch.getBoundingClientRect(),
          to: stackRef.current!.getBoundingClientRect(),
        },
      ]);
    },
    [picked, items, reduced],
  );

  const total = picked.reduce((a, i) => a + items[i].price, 0);
  const optional = picked.filter((i) => !items[i].fixed).length;
  const discount = optional >= 2 ? total * bundleDiscount : 0;

  return (
    <div className={`w-full max-w-xl ${className}`}>
      <div className="flex items-start justify-between gap-8 border-b border-ink pb-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em]">Bought together</p>
        {/* The bundle stack — the destination. */}
        <div ref={stackRef} className="flex h-10 items-center">
          {picked.length === 0 ? (
            <span className="font-mono text-[11px] text-ink/35">empty</span>
          ) : (
            picked.map((i, n) => (
              <span
                key={i}
                className="h-9 w-9 overflow-hidden border border-ink"
                style={{ background: items[i].hex, marginLeft: n === 0 ? 0 : -14, zIndex: n }}
              >
                {items[i].src && (
                  <img src={items[i].src} alt="" className="h-full w-full object-cover" />
                )}
              </span>
            ))
          )}
        </div>
      </div>

      <ul className="divide-y divide-ink/15">
        {items.map((it, i) => {
          const on = picked.includes(i);
          return (
            <li key={it.name} className="flex items-center gap-4 py-4">
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                aria-label={it.name}
                disabled={it.fixed}
                onClick={(e) =>
                  toggle(i, e.currentTarget.parentElement?.querySelector('[data-swatch]') ?? null)
                }
                className={`h-4 w-4 shrink-0 cursor-pointer border border-ink disabled:cursor-default ${
                  on ? 'bg-ink' : 'bg-transparent'
                }`}
              />
              <span
                data-swatch
                className="h-9 w-9 shrink-0 overflow-hidden border border-ink"
                style={{ background: it.hex, opacity: on ? 0.35 : 1, transition: 'opacity 200ms ease' }}
              >
                {it.src && <img src={it.src} alt="" className="h-full w-full object-cover" />}
              </span>
              <span className="min-w-0 flex-1 font-mono text-[11px] uppercase tracking-[0.14em]">
                {it.name}
                {it.fixed && <span className="ml-2 text-ink/40">this item</span>}
              </span>
              <span className="font-mono text-[11px] tabular-nums">{format(it.price)}</span>
            </li>
          );
        })}
      </ul>

      <div className="mt-2 flex items-baseline justify-between border-t border-ink pt-5">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/55">
            {picked.length} item{picked.length === 1 ? '' : 's'}
          </p>
          {discount > 0 && (
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
              Bundle −{format(discount)}
            </p>
          )}
        </div>
        <p key={total - discount} className="font-display text-3xl tabular-nums animate-[modal-fade-in_260ms_ease]">
          {format(total - discount)}
        </p>
      </div>

      {/* In-flight swatches. Fixed, so the page beneath is irrelevant. */}
      {flights.map((f) => (
        <span
          key={f.id}
          aria-hidden
          ref={(el) => {
            if (!el) return;
            requestAnimationFrame(() => {
              el.style.transform = `translate(${f.to.right - f.from.left - f.from.width}px, ${
                f.to.top - f.from.top + (f.to.height - f.from.height) / 2
              }px) scale(0.85)`;
              el.style.opacity = '0.9';
            });
          }}
          onTransitionEnd={() => setFlights((x) => x.filter((y) => y.id !== f.id))}
          className="pointer-events-none fixed z-50 border border-ink"
          style={{
            left: f.from.left,
            top: f.from.top,
            width: f.from.width,
            height: f.from.height,
            background: f.src ? `center / cover no-repeat url(${f.src}), ${f.hex}` : f.hex,
            transform: 'translate(0,0) scale(1)',
            transition: 'transform 480ms cubic-bezier(0.5,0,0.2,1), opacity 480ms ease-in',
          }}
        />
      ))}
    </div>
  );
}
