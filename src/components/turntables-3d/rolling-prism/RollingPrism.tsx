// ui-14 — RollingPrism
import { useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface PrismFace {
  /** Heading line, e.g. a day or range. */
  day: string;
  /** Large value line, e.g. opening hours. */
  hours: string;
  /** Small footnote. */
  note: string;
}

export interface RollingPrismProps {
  /** Up to four faces on the rolling prism. Defaults to a week of hours. */
  faces?: PrismFace[];
  /** Face shown first. Defaults to today for the sample week, else 0. */
  initialFace?: number;
  className?: string;
}

const DEFAULT_FACES: PrismFace[] = [
  { day: 'Monday — Thursday', hours: '5pm — 11pm', note: 'kitchen closes at 10' },
  { day: 'Friday', hours: '5pm — 1am', note: 'late hearth menu after 11' },
  { day: 'Saturday', hours: '12pm — 1am', note: 'lunch service from noon' },
  { day: 'Sunday', hours: '12pm — 9pm', note: 'family roast, one seating' },
];

const DEPTH = 95; // half of the 190px face height

function todayFace(count: number): number {
  const d = new Date().getDay(); // 0 Sun … 6 Sat
  const idx = d === 0 ? 3 : d === 6 ? 2 : d === 5 ? 1 : 0;
  return Math.min(idx, count - 1);
}

/**
 * Opening hours on the four faces of a prism that rolls on its X axis, the way
 * an old split-flap sign would turn. Today's face is pre-selected.
 *
 * Reduced motion: faces cut instantly instead of rolling.
 */
export function RollingPrism({ faces = DEFAULT_FACES, initialFace, className = '' }: RollingPrismProps) {
  const reduced = useReducedMotion();
  const shown = faces.slice(0, 4);
  const [face, setFace] = useState(initialFace ?? todayFace(shown.length));

  return (
    <div className={`flex flex-col items-center justify-center gap-10 py-8 md:flex-row md:gap-16 ${className}`}>
      <div className="h-[190px] w-[420px] max-w-full" style={{ perspective: '900px' }}>
        <div
          className="relative h-full w-full"
          style={{
            transformStyle: 'preserve-3d',
            transform: `translateZ(-${DEPTH}px) rotateX(${face * -90}deg)`,
            transition: reduced ? 'none' : 'transform 0.75s cubic-bezier(0.6,0.05,0.2,1.2)',
          }}
        >
          {shown.map((f, i) => (
            <div
              key={f.day}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 border border-ink bg-bone"
              style={{
                transform: `rotateX(${i * 90}deg) translateZ(${DEPTH}px)`,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-vermilion">{f.day}</span>
              <span className="font-display text-[42px] font-medium leading-none text-ink">{f.hours}</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink/50">{f.note}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {shown.map((f, i) => (
          <button
            key={f.day}
            type="button"
            onClick={() => setFace(i)}
            className={`whitespace-nowrap border px-5 py-3 text-left font-mono text-[13px] uppercase tracking-[0.1em] transition-colors ${
              i === face ? 'border-vermilion bg-vermilion text-ink' : 'border-ink text-ink hover:border-vermilion'
            }`}
          >
            {f.day}
          </button>
        ))}
      </div>
    </div>
  );
}
