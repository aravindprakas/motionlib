// ui-77 — FlipFilterGrid
import { FlipFilterGrid, type FlipFilterItem } from './FlipFilterGrid';

const SEED: Array<{ id: string; category: string; title: string }> = [
  { id: 't1', category: 'type', title: 'Grotesk Study' },
  { id: 'm1', category: 'motion', title: 'Scrub Curve' },
  { id: 'g1', category: 'grid', title: '12-Col Ledger' },
  { id: 't2', category: 'type', title: 'Serif Counter' },
  { id: 'm2', category: 'motion', title: 'Spring Mass' },
  { id: 'g2', category: 'grid', title: 'Hairline Net' },
  { id: 't3', category: 'type', title: 'Mono Index' },
  { id: 'm3', category: 'motion', title: 'Inertia Decay' },
  { id: 'g3', category: 'grid', title: 'Bento Spans' },
];

const ITEMS: FlipFilterItem[] = SEED.map((s, i) => ({
  id: s.id,
  category: s.category,
  content: (
    <div className="flex h-40 flex-col justify-between border border-ink bg-bone p-4">
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-accent">{s.category}</span>
      <div>
        <span className="font-mono text-xs text-ink/50">{String(i + 1).padStart(2, '0')}</span>
        <h4 className="font-display text-lg font-bold uppercase tracking-tight">{s.title}</h4>
      </div>
    </div>
  ),
}));

export default function FlipFilterGridDemo() {
  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-6 px-10 py-12">
      <p className="font-mono text-xs uppercase tracking-[0.3em]">gsap flip — filter & watch them travel</p>
      <FlipFilterGrid items={ITEMS} columns={3} />
    </section>
  );
}
