// ConsensusRating — two products with the same 4.2, and nothing else in common
import { useState } from 'react';
import { ConsensusRating, type ConsensusPoint } from './ConsensusRating';

/** Twelve months of averages, so the drift trace has something to say. */
const rising: ConsensusPoint[] = [
  3.4, 3.5, 3.6, 3.6, 3.8, 3.9, 3.9, 4.0, 4.1, 4.1, 4.2, 4.2,
].map((avg, i) => ({ at: new Date(2025, 8 + i, 1), avg }));

const falling: ConsensusPoint[] = [
  4.8, 4.8, 4.7, 4.6, 4.6, 4.5, 4.4, 4.4, 4.3, 4.3, 4.2, 4.2,
].map((avg, i) => ({ at: new Date(2025, 8 + i, 1), avg }));

export default function ConsensusRatingDemo() {
  const [mine, setMine] = useState<number | null>(null);

  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-8 px-6 md:px-10">
      <p className="max-w-xl font-mono text-xs uppercase leading-relaxed tracking-[0.24em]">
        both of these average 4.2 — drag either rail and watch your one vote move it
      </p>

      <div className="grid gap-10 md:grid-cols-2">
        <figure className="border border-ink p-5">
          <figcaption className="mb-4 flex items-baseline justify-between">
            <span className="font-display text-sm font-bold uppercase tracking-tight">
              Field Jacket · No. 4
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-55">
              consensus
            </span>
          </figcaption>
          <ConsensusRating
            distribution={[38, 46, 180, 720, 1010]}
            history={rising}
            step={0.5}
            onChange={setMine}
          />
          <p className="mt-4 border-t border-ink/20 pt-3 font-serif text-sm italic leading-snug opacity-75">
            Tight spread, climbing for a year. The score is a summary of agreement.
          </p>
        </figure>

        <figure className="border border-ink p-5">
          <figcaption className="mb-4 flex items-baseline justify-between">
            <span className="font-display text-sm font-bold uppercase tracking-tight">
              Field Jacket · No. 7
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-55">
              consensus
            </span>
          </figcaption>
          <ConsensusRating
            distribution={[402, 118, 96, 340, 1038]}
            history={falling}
            step={0.5}
          />
          <p className="mt-4 border-t border-ink/20 pt-3 font-serif text-sm italic leading-snug opacity-75">
            Same 4.2, split down the middle and sliding. The score is an average of an argument.
          </p>
        </figure>
      </div>

      <div className="flex flex-wrap items-center gap-6 border-t border-ink pt-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-55">
          read-only, sidebar width:
        </span>
        <div className="w-56">
          <ConsensusRating distribution={[2, 3, 9, 41, 96]} readOnly drift={false} />
        </div>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.2em] opacity-55">
          your rating: {mine ?? '—'}
        </span>
      </div>
    </section>
  );
}
