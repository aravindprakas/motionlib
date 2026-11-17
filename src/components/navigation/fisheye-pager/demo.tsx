// FisheyePager — 9,412 pages on one bar; drag down while scrubbing to change gear
import { useState } from 'react';
import { FisheyePager } from './FisheyePager';

const START = new Date(2001, 0, 1).getTime();
const DAY = 864e5;

/** An archive: one page per day since 2001. */
const stampFor = (page: number) =>
  new Date(START + page * DAY).toLocaleDateString(undefined, { month: 'short', year: '2-digit' });

const HEADLINES = [
  'The kerning was the argument all along',
  'Notes on a workshop that refuses to grow',
  'Everything we removed in the third year',
  'A dye lot that would not repeat',
  'Against the ellipsis in pagination',
];

export default function FisheyePagerDemo() {
  const [big, setBig] = useState(4207);
  const [small, setSmall] = useState(7);

  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-12 px-6 md:px-10">
      <p className="max-w-xl font-mono text-xs uppercase leading-relaxed tracking-[0.24em]">
        drag the rail sideways to scrub; pull down while dragging for 10× and 100×
      </p>

      <div>
        <FisheyePager
          count={9412}
          page={big}
          onChange={setBig}
          stamp={stampFor}
          preview={(p) => HEADLINES[p % HEADLINES.length]}
        />
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] opacity-55">
          daily archive since january 2001 — {stampFor(big)} · the far buckets still hold their
          honest share of the bar, so you can see how deep in you are
        </p>
      </div>

      <div className="grid gap-10 border-t border-ink pt-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div>
          <FisheyePager count={38} page={small} onChange={setSmall} />
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] opacity-55">
            a short range — the lens simply shows all of it
          </p>
        </div>

        {/* Same component, sidebar width: the radius collapses on its own. */}
        <div>
          <FisheyePager count={9412} defaultPage={4207} stamp={stampFor} />
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] opacity-55">
            288px wide — three legible pages, same rail
          </p>
        </div>
      </div>
    </section>
  );
}
