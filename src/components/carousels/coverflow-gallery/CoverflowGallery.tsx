// ui-19 — CoverflowGallery
import { useState, type CSSProperties } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface CoverItem {
  caption: string;
  /** Optional image; falls back to a dashed slot. */
  image?: string;
}

export interface CoverflowGalleryProps {
  /** Covers to browse. Defaults to a five-image sample. */
  items?: CoverItem[];
  /** Cover shown first. Defaults to the middle item. */
  initialIndex?: number;
  className?: string;
}

const DEFAULT_ITEMS: CoverItem[] = [
  { caption: 'The hearth at full burn' },
  { caption: 'Dining room, dusk' },
  { caption: 'Cinder duck, plated' },
  { caption: 'The cellar wall' },
  { caption: 'Rooftop garden, June' },
];

/**
 * A coverflow: the chosen cover steps forward (translateZ) while the others
 * recede and angle away (rotateY + negative Z), dimming with a brightness
 * filter. Click a side cover or use the arrows to bring it to the front.
 *
 * Reduced motion: covers snap between positions instead of gliding.
 */
export function CoverflowGallery({ items = DEFAULT_ITEMS, initialIndex, className = '' }: CoverflowGalleryProps) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(initialIndex ?? Math.floor(items.length / 2));

  const transformFor = (i: number): CSSProperties => {
    const rel = i - index;
    const abs = Math.abs(rel);
    if (rel === 0) {
      return { transform: 'translateX(0px) translateZ(120px) rotateY(0deg)', opacity: 1, filter: 'brightness(1)', zIndex: 10 };
    }
    const dir = rel > 0 ? 1 : -1;
    return {
      transform: `translateX(${dir * (190 + abs * 120)}px) translateZ(${-110 - abs * 70}px) rotateY(${-dir * 48}deg)`,
      opacity: abs > 2 ? 0 : 1,
      filter: 'brightness(0.5)',
      zIndex: 10 - abs,
      pointerEvents: abs > 2 ? 'none' : 'auto',
    };
  };

  return (
    <div className={className}>
      <div
        className="relative h-[430px] overflow-hidden border border-ink bg-ink"
        style={{ perspective: '1400px' }}
      >
        <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
          {items.map((item, i) => (
            <div
              key={item.caption}
              onClick={() => setIndex(i)}
              className="absolute left-1/2 top-10 ml-[-160px] h-[300px] w-[320px] cursor-pointer"
              style={{
                transformStyle: 'preserve-3d',
                transition: reduced ? 'none' : 'transform 0.7s cubic-bezier(0.22,1,0.36,1), opacity 0.7s ease, filter 0.7s ease',
                ...transformFor(i),
              }}
            >
              <div className="h-full w-full overflow-hidden border border-bone/20">
                {item.image ? (
                  <img src={item.image} alt={item.caption} draggable={false} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center border border-dashed border-bone/20 p-4 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-bone/45">
                    {item.caption}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-6 text-center font-mono text-xs uppercase tracking-[0.2em] text-bone/60">
          {items[index].caption}
        </div>
      </div>

      <div className="mt-5 flex justify-center gap-2.5">
        <button
          type="button"
          aria-label="Previous photo"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          className="h-11 w-11 border border-ink text-lg text-ink transition-colors hover:border-vermilion hover:bg-vermilion"
        >
          ←
        </button>
        <button
          type="button"
          aria-label="Next photo"
          onClick={() => setIndex((i) => Math.min(items.length - 1, i + 1))}
          className="h-11 w-11 border border-ink text-lg text-ink transition-colors hover:border-vermilion hover:bg-vermilion"
        >
          →
        </button>
      </div>
    </div>
  );
}
