// ui-103 — StarRating
import { useState } from 'react';
import { StarRating } from './StarRating';

export default function StarRatingDemo() {
  const [rating, setRating] = useState(3);

  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8">
      <div className="flex flex-col items-center gap-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">rate it</p>

        <div className="flex flex-col items-center gap-3">
          <StarRating value={rating} onChange={setRating} size={40} />
          <span className="font-mono text-xs uppercase tracking-widest text-ink/60">{rating} / 5 selected</span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink/60">
          read-only
          <StarRating defaultValue={4} readOnly size={18} />
        </div>

        <p className="max-w-md border-t border-ink pt-6 font-serif text-lg italic">
          Hover to preview, click to commit — controlled or uncontrolled, with a static read-only mode.
        </p>
      </div>
    </section>
  );
}
