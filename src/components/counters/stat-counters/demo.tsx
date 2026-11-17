// ui-66 — StatCounters
import { StatCounters } from './StatCounters';

const STATS = [
  { value: 60, suffix: 'fps', label: 'target frame rate' },
  { value: 53, label: 'catalog entries' },
  { value: 100, suffix: '%', label: 'transform-only motion' },
  { value: 0, suffix: 'kb img', label: 'image assets used' },
];

export default function StatCountersDemo() {
  return (
    <div className="px-10">
      <section className="grid min-h-[70vh] place-items-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">scroll ↓ — bar tracks the lenis scroller</p>
      </section>
      <section className="py-16">
        <StatCounters stats={STATS} />
      </section>
      <section className="grid min-h-[70vh] place-items-center">
        <p className="font-serif text-5xl italic">Fin.</p>
      </section>
    </div>
  );
}
