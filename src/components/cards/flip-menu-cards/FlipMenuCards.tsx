// ui-81 — FlipMenuCards
import { useState, type KeyboardEvent } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface FlipDish {
  /** Course label shown small on the front. */
  course: string;
  name: string;
  price: string;
  /** Story shown on the back. */
  blurb: string;
  /** Key ingredients, rendered as chips on the back. */
  ings: string[];
}

export interface FlipMenuCardsProps {
  /** Cards to render. Defaults to a three-course sample. */
  dishes?: FlipDish[];
  className?: string;
}

const DEFAULT_DISHES: FlipDish[] = [
  {
    course: 'First course',
    name: 'Smoked Trout Rillette',
    price: '16',
    blurb: 'River trout smoked over applewood, folded with crème fraîche and pickled shallot, served on charred sourdough.',
    ings: ['Trout', 'Applewood', 'Shallot', 'Sourdough'],
  },
  {
    course: 'Second course',
    name: 'Hearth Lamb Shoulder',
    price: '36',
    blurb: 'Twelve-hour lamb shoulder over white beans, salsa verde and a glaze of its own roasting juices.',
    ings: ['Lamb', 'White bean', 'Salsa verde', 'Rosemary'],
  },
  {
    course: 'To finish',
    name: 'Chocolate & Bay Leaf',
    price: '13',
    blurb: 'Dark chocolate cremeux infused with bay, olive oil sponge, smoked sea salt.',
    ings: ['70% cacao', 'Bay leaf', 'Olive oil', 'Sea salt'],
  },
];

function FlipCard({ dish, reduced }: { dish: FlipDish; reduced: boolean }) {
  const [flipped, setFlipped] = useState(false);
  const toggle = () => setFlipped((f) => !f);
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <div style={{ perspective: '1100px' }} className="h-[320px]">
      <div
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        onClick={toggle}
        onKeyDown={onKey}
        className="relative h-full w-full cursor-pointer outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-vermilion"
        style={{
          transformStyle: 'preserve-3d',
          transition: reduced ? 'none' : 'transform 0.7s cubic-bezier(0.4,0.2,0.2,1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        <div
          className="absolute inset-0 flex flex-col border border-ink bg-bone p-7 text-ink"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <p className="mb-auto font-mono text-[11px] uppercase tracking-[0.2em] text-vermilion">{dish.course}</p>
          <h3 className="mb-3 font-display text-3xl font-medium uppercase leading-[1.05] tracking-tight">{dish.name}</h3>
          <div className="flex items-center justify-between border-t border-ink pt-4">
            <span className="font-display text-2xl font-semibold text-vermilion">{dish.price}</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink/55">Tap to flip</span>
          </div>
        </div>
        <div
          className="absolute inset-0 flex flex-col border border-ink bg-vermilion p-7 text-ink"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <h4 className="mb-2.5 font-display text-2xl font-medium">{dish.name}</h4>
          <p className="mb-[18px] text-[13.5px] leading-relaxed text-ink/80">{dish.blurb}</p>
          <ul className="mt-auto flex flex-wrap gap-2">
            {dish.ings.map((i) => (
              <li key={i} className="border border-ink/35 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.06em]">
                {i}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * Typographic menu cards that rotate on click/Enter to reveal the dish story
 * and key ingredients. Backface-hidden front/back faces share one
 * `preserve-3d` card.
 *
 * Reduced motion: the flip is instant (no 0.7s spin).
 */
export function FlipMenuCards({ dishes = DEFAULT_DISHES, className = '' }: FlipMenuCardsProps) {
  const reduced = useReducedMotion();
  return (
    <div className={`grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {dishes.map((d) => (
        <FlipCard key={d.name} dish={d} reduced={reduced} />
      ))}
    </div>
  );
}
