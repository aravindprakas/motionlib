// ui-12 — CylinderCarousel
import { useRef, useState, type PointerEvent } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface CarouselCategory {
  /** Roman numeral shown on the panel. */
  roman: string;
  name: string;
  /** Small count line, e.g. "6 dishes". */
  count: string;
  /** Description shown in the side panel. */
  blurb: string;
  /** [label, price] rows shown in the side panel. */
  dishes: [string, string][];
}

export interface CylinderCarouselProps {
  /** Panels arranged around the cylinder. Defaults to a six-section menu. */
  categories?: CarouselCategory[];
  /** Cylinder radius in px. Default 215. */
  radius?: number;
  className?: string;
}

const DEFAULT_CATEGORIES: CarouselCategory[] = [
  { roman: 'I', name: 'To Begin', count: '6 dishes', blurb: 'Small plates from the raw bar and the hearth, meant for the middle of the table.', dishes: [['Ember beets, smoked yogurt', '14'], ['Oysters, charred lemon', '21'], ['Sourdough & cultured butter', '7']] },
  { roman: 'II', name: 'From the Fire', count: '5 dishes', blurb: 'Everything here finishes over white oak coals on the open hearth.', dishes: [['Cinder duck, charred plum', '34'], ['Hearth lamb shoulder', '36'], ['Whole sea bream, fennel', '32']] },
  { roman: 'III', name: 'Garden', count: '4 dishes', blurb: 'From our rooftop beds and growers within forty miles of the kitchen.', dishes: [['Grilled hispi, anchovy cream', '13'], ['New potatoes, lovage', '9'], ['Bitter leaves, walnut', '11']] },
  { roman: 'IV', name: 'Sweet', count: '4 dishes', blurb: 'A short list. Each one built around a single idea, finished tableside.', dishes: [['Burnt honey tart', '12'], ['Chocolate & bay leaf', '13'], ['Poached quince, almond', '11']] },
  { roman: 'V', name: 'Cellar', count: '80 bottles', blurb: 'Low-intervention growers, heavy on the Loire, Jura and old-vine Spain.', dishes: [['By the glass', 'from 9'], ['Sommelier pairing', '55'], ['Zero-proof pairing', '32']] },
  { roman: 'VI', name: 'Hearth Bar', count: '7 drinks', blurb: 'Smoked, stirred and spritzed — cocktails that borrow from the kitchen.', dishes: [['Ember old fashioned', '15'], ['Bay leaf martini', '14'], ['Quince spritz', '12']] },
];

/**
 * Menu sections laid out around a rotating 3D cylinder. Drag it like a lazy
 * susan (pointer) or use the arrows; on release it snaps to the nearest panel
 * and the active section's dishes appear alongside.
 *
 * Reduced motion: the ring snaps instantly instead of easing.
 */
export function CylinderCarousel({
  categories = DEFAULT_CATEGORIES,
  radius = 215,
  className = '',
}: CylinderCarouselProps) {
  const reduced = useReducedMotion();
  const N = categories.length;
  const STEP = 360 / N;
  const [angle, setAngle] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef({ startX: 0, startAngle: 0, moved: false });

  const active = ((Math.round(-angle / STEP) % N) + N) % N;
  const snap = (a: number) => Math.round(a / STEP) * STEP;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    drag.current = { startX: e.clientX, startAngle: angle, moved: false };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    setAngle(drag.current.startAngle + dx * 0.35);
  };
  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    setAngle((a) => snap(a));
  };

  const cat = categories[active];

  return (
    <div className={`grid items-center gap-10 md:grid-cols-[1fr_320px] ${className}`}>
      <div
        className="grid h-[380px] touch-pan-y select-none place-items-center"
        style={{ perspective: '1300px', cursor: dragging ? 'grabbing' : 'grab' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="relative h-[300px] w-[230px]"
          style={{
            transformStyle: 'preserve-3d',
            transform: `translateZ(-${radius}px) rotateY(${angle}deg)`,
            transition: dragging || reduced ? 'none' : 'transform 0.8s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          {categories.map((c, i) => {
            const on = i === active;
            return (
              <div
                key={c.name}
                className={`absolute inset-0 flex flex-col border p-6 transition-colors duration-300 ${
                  on ? 'border-vermilion bg-vermilion text-ink' : 'border-ink bg-bone text-ink'
                }`}
                style={{
                  transform: `rotateY(${i * STEP}deg) translateZ(${radius}px)`,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                <span className={`font-mono text-sm ${on ? 'text-ink/70' : 'text-vermilion'}`}>{c.roman}</span>
                <h3 className="mb-2 mt-auto font-display text-3xl font-medium leading-[1.05]">{c.name}</h3>
                <span className={`font-mono text-[11px] uppercase tracking-[0.14em] ${on ? 'text-ink/70' : 'text-ink/55'}`}>
                  {c.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-1.5 font-display text-3xl font-medium text-ink">{cat.name}</h3>
        <p className="mb-5 text-[13.5px] leading-relaxed text-ink/60">{cat.blurb}</p>
        <ul className="mb-6">
          {cat.dishes.map(([n, p]) => (
            <li key={n} className="flex items-baseline justify-between gap-3.5 border-b border-ink/15 py-2.5 text-sm text-ink">
              <span>{n}</span>
              <span className="font-display font-semibold text-vermilion">{p}</span>
            </li>
          ))}
        </ul>
        <div className="flex gap-2.5">
          <button
            type="button"
            aria-label="Previous section"
            onClick={() => setAngle(snap(angle) + STEP)}
            className="h-11 w-11 border border-ink text-lg text-ink transition-colors hover:bg-vermilion hover:border-vermilion"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next section"
            onClick={() => setAngle(snap(angle) - STEP)}
            className="h-11 w-11 border border-ink text-lg text-ink transition-colors hover:bg-vermilion hover:border-vermilion"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
