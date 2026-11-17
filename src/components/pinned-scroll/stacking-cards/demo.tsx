// ui-35 — StackingCards
import { StackingCards } from './StackingCards';

const CARDS = [
  { index: '01', title: 'Pin', body: 'The section pins to the viewport while the timeline scrubs.' },
  { index: '02', title: 'Stack', body: 'Each card slides over the last with a hard 1px edge.' },
  { index: '03', title: 'Scale', body: 'Covered cards step down in scale toward a top origin.' },
  { index: '04', title: 'Dim', body: 'An ink overlay fades in so depth reads without shadows.' },
];

export default function StackingCardsDemo() {
  return (
    <div>
      <section className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">05 / pinned stack</p>
        <h1 className="font-display text-6xl font-bold uppercase tracking-tight">Keep scrolling</h1>
      </section>

      <StackingCards
        scaleStep={0.05}
        offset={16}
        cards={CARDS.map((c) => (
          <div key={c.index} className="flex h-full flex-col justify-between p-10">
            <div className="flex items-baseline justify-between border-b border-ink pb-4">
              <span className="font-mono text-sm">{c.index} / 04</span>
              <span className="font-mono text-xs uppercase tracking-widest text-vermilion">
                stacked
              </span>
            </div>
            <h2 className="font-display text-7xl font-bold uppercase tracking-tight">{c.title}</h2>
            <p className="max-w-md font-serif text-2xl italic">{c.body}</p>
          </div>
        ))}
      />

      <section className="grid min-h-[60vh] place-items-center">
        <p className="font-serif text-6xl italic">Fin.</p>
      </section>
    </div>
  );
}
