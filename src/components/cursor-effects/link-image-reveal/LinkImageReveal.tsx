// ui-5 — LinkImageReveal
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface LinkImageRevealItem {
  label: string;
  /** CSS background for the floating preview plate (gradient, image url(...), etc.). */
  swatch: string;
  onClick?: () => void;
}

export interface LinkImageRevealProps {
  items: LinkImageRevealItem[];
  className?: string;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Hovering a link floats a preview plate that trails the cursor.
 * Pointer-fine only; on touch and reduced motion the links render plain.
 *
 * Fixes vs. the Store original: links are a prop instead of hardcoded, and
 * the plate is positioned with `transform` instead of animating `left`/`top`.
 */
export function LinkImageReveal({ items, className = '' }: LinkImageRevealProps) {
  const plateRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || reduced) return;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };
    const tick = () => {
      current.x = lerp(current.x, target.x, 0.15);
      current.y = lerp(current.y, target.y, 0.15);
      const plate = plateRef.current;
      if (plate) {
        plate.style.transform = `translate(${current.x}px, ${current.y}px) translate(-50%, -50%)`;
      }
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return (
    <div className={`relative flex flex-col ${className}`}>
      {items.map((item, i) => (
        <a
          key={item.label}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            item.onClick?.();
          }}
          onPointerEnter={() => setActive(i)}
          onPointerLeave={() => setActive(null)}
          className="group relative w-max py-2 text-2xl font-medium tracking-[-0.02em]"
        >
          {item.label}
          <span className="absolute bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-[450ms] ease-[cubic-bezier(.76,0,.24,1)] group-hover:scale-x-100" />
        </a>
      ))}
      {!reduced && (
        <div
          ref={plateRef}
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-30 h-40 w-60 border border-ink transition-opacity duration-300 will-change-transform"
          style={{
            opacity: active === null ? 0 : 1,
            backgroundImage: active === null ? undefined : items[active].swatch,
          }}
        />
      )}
    </div>
  );
}
