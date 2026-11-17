// ui-11 — TiltMenuCards
import { useRef, useState, type PointerEvent } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface TiltDish {
  name: string;
  /** One-line description. */
  sub: string;
  /** Price string (unit-agnostic). */
  price: string;
  /** Small category tag. */
  tag: string;
  /** Optional dish image; falls back to a dashed slot. */
  image?: string;
}

export interface TiltMenuCardsProps {
  /** Cards to render. Defaults to a three-course sample. */
  dishes?: TiltDish[];
  /** Max edge tilt (~14°) scaled by this. 0 disables. Default 1. */
  intensity?: number;
  className?: string;
}

const DEFAULT_DISHES: TiltDish[] = [
  { name: 'Ember Beets', sub: 'Coal-roasted beets, smoked yogurt, dill oil, rye crumble.', price: '14', tag: 'Starter' },
  { name: 'Cinder Duck', sub: 'Dry-aged breast, charred plum, black garlic jus.', price: '34', tag: 'Main' },
  { name: 'Burnt Honey Tart', sub: 'Caramelised honey custard, bee pollen, crème fraîche.', price: '12', tag: 'Dessert' },
];

function TiltMenuCard({ dish, intensity }: { dish: TiltDish; intensity: number }) {
  const reduced = useReducedMotion();
  const active = !reduced && intensity > 0;
  const ref = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !active) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (0.5 - py) * 14 * intensity;
    const ry = (px - 0.5) * 14 * intensity;
    el.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    el.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
    el.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = 'rotateX(0deg) rotateY(0deg)';
    setLive(false);
  };

  return (
    <div
      style={{ perspective: '900px' }}
      onPointerMove={onMove}
      onPointerEnter={() => active && setLive(true)}
      onPointerLeave={onLeave}
    >
      <div
        ref={ref}
        className="relative h-full border border-bone/10 bg-ink p-[26px] text-bone"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.5s cubic-bezier(0.22,1,0.36,1)',
          willChange: 'transform',
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: live ? 1 : 0,
            background:
              'radial-gradient(380px 280px at var(--gx,50%) var(--gy,50%), rgba(236,230,216,0.16), transparent 65%)',
          }}
        />
        <div className="mb-5 grid place-items-center" style={{ transform: 'translateZ(34px)' }}>
          <div
            className="h-[170px] w-[170px] overflow-hidden border border-bone/15"
            style={{ borderRadius: '50%' }}
          >
            {dish.image ? (
              <img src={dish.image} alt={dish.name} draggable={false} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center border border-dashed border-bone/20 p-4 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-bone/45">
                {dish.name}
              </div>
            )}
          </div>
        </div>
        <h3 className="mb-1.5 font-display text-2xl font-medium" style={{ transform: 'translateZ(48px)' }}>
          {dish.name}
        </h3>
        <p
          className="mb-[18px] text-[13.5px] leading-relaxed text-bone/55"
          style={{ transform: 'translateZ(40px)' }}
        >
          {dish.sub}
        </p>
        <div className="flex items-center justify-between" style={{ transform: 'translateZ(60px)' }}>
          <span className="font-display text-xl font-semibold text-vermilion">{dish.price}</span>
          <span className="border border-bone/25 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/55">
            {dish.tag}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * A row of pointer-tilt cards. Each card pivots toward the cursor (rotateX/Y)
 * with a tracked radial glare, and its photo, name and price sit on separate
 * translateZ planes for parallax depth.
 *
 * Reduced motion / intensity 0: cards stay flat with no glare.
 */
export function TiltMenuCards({ dishes = DEFAULT_DISHES, intensity = 1, className = '' }: TiltMenuCardsProps) {
  return (
    <div className={`grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {dishes.map((d) => (
        <TiltMenuCard key={d.name} dish={d} intensity={intensity} />
      ))}
    </div>
  );
}
