// ChronoRail — drag the rail, then pull compression to 0 and watch the gaps appear
import { useState } from 'react';
import { ChronoRail, type ChronoItem } from './ChronoRail';

/** Deliberately uneven: a sparse first two years, then a dense final quarter. */
const RELEASES: ChronoItem[] = [
  { id: 'r1', at: '2021-03-04', label: 'First commit', meta: 'v0.1.0', body: 'One route, one font, no build step worth the name.' },
  { id: 'r2', at: '2021-11-19', label: 'Public beta', meta: 'v0.4.0', body: 'Opened to forty studios. The feedback was mostly about the cursor.' },
  { id: 'r3', at: '2022-06-02', label: 'Editor rewrite', meta: 'v0.9.0', body: 'Threw out the tree walker. Kept the keybindings.' },
  { id: 'r4', at: '2023-01-27', label: 'Version one', meta: 'v1.0.0', body: 'Shipped on a Friday, which is how you know we meant it.' },
  { id: 'r5', at: '2024-09-10', label: 'Collaboration', meta: 'v2.0.0', body: 'Multiplayer cursors, presence, and a conflict model nobody has to think about.' },
  { id: 'r6', at: '2025-04-15', label: 'Offline first', meta: 'v2.3.0', body: 'The document is local. The network is an optimisation.' },
  { id: 'r7', at: '2026-05-06', label: 'Motion system', meta: 'v3.0.0', body: 'Every transition derived from one clock instead of two hundred timeouts.' },
  { id: 'r8', at: '2026-06-30', label: 'Container queries', meta: 'v3.1.0', body: 'Components size themselves from their own box.' },
  { id: 'r9', at: '2026-07-22', label: 'Type pass', meta: 'v3.1.4', body: 'Nothing visible changed. Everything got safer.' },
  { id: 'r10', at: '2026-08-14', label: 'Latest', meta: 'v3.2.0', body: 'You are looking at it.' },
];

export default function ChronoRailDemo() {
  const [compression, setCompression] = useState(0.55);
  const [item, setItem] = useState<ChronoItem>(RELEASES[RELEASES.length - 1]);

  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-8 px-6 md:px-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <p className="max-w-md font-mono text-xs uppercase leading-relaxed tracking-[0.24em]">
          drag the rail — the gaps between cards are the real gaps between releases
        </p>

        <label className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.2em]">
          <span className="opacity-60">true time</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={compression}
            onChange={(e) => setCompression(Number(e.target.value))}
            className="h-1 w-40 cursor-pointer appearance-none bg-ink accent-vermilion md:w-56"
            aria-label="Compression"
          />
          <span className="opacity-60">even</span>
        </label>
      </div>

      <ChronoRail
        items={RELEASES}
        compression={compression}
        defaultIndex={9}
        onIndexChange={(_, it) => setItem(it)}
        className="border-y border-ink py-5"
      />

      <p className="max-w-2xl font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] opacity-60">
        selected: {item.label} · {item.meta} — at compression 0 the two-year lull before v1.0 is two
        years of empty rail, and the 2026 releases shingle into a deck. at 1 it is an ordinary
        carousel. one component, both readings.
      </p>
    </section>
  );
}
