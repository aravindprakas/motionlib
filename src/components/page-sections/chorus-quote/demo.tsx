// ChorusQuote — the words every reviewer used are the ones that never move
import { ChorusQuote, type ChorusEntry } from './ChorusQuote';

/** Four people, one jacket. Heavy overlap, which is the point. */
const ENTRIES: ChorusEntry[] = [
  {
    id: 'q1',
    text: 'I bought the jacket in the winter and wore it every day until the spring came.',
    author: 'R. Menon',
    role: 'verified',
    at: '2025-04-11',
  },
  {
    id: 'q2',
    text: 'I bought the jacket in the spring and wore it every week through the summer too.',
    author: 'A. Okonkwo',
    role: 'verified',
    at: '2025-09-02',
  },
  {
    id: 'q3',
    text: 'The jacket arrived in the winter and I wore it every day for a year without a repair.',
    author: 'J. Haldane',
    role: 'verified',
    at: '2026-01-19',
  },
  {
    id: 'q4',
    text: 'I wore the jacket every day in the winter and it survived a year of the rain.',
    author: 'S. Fournier',
    role: 'verified',
    at: '2026-06-27',
  },
];

export default function ChorusQuoteDemo() {
  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-12 px-6 md:px-10">
      <p className="max-w-xl font-mono text-xs uppercase leading-relaxed tracking-[0.24em]">
        watch “the jacket”, “wore it every” and “winter” travel instead of fading — four reviews,
        one sentence rewriting itself
      </p>

      <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <ChorusQuote entries={ENTRIES} interval={5200} />

        {/* Same component in a sidebar: type scale and measure follow the box. */}
        <ChorusQuote
          entries={ENTRIES}
          interval={0}
          className="border border-ink p-5"
        />
      </div>

      <p className="max-w-2xl border-t border-ink pt-5 font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] opacity-60">
        the left block advances on its own; hover it, focus it, or scroll it off screen and the
        clock suspends. the right one has auto-advance off entirely — same component, arrows only.
      </p>
    </section>
  );
}
