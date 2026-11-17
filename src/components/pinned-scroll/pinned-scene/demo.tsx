// ui-36 — PinnedScene
import { PinnedScene } from './PinnedScene';

const STEPS = [
  { n: '01', title: 'Capture intent' },
  { n: '02', title: 'Scrub the timeline' },
  { n: '03', title: 'Release & continue' },
];

export default function PinnedSceneDemo() {
  return (
    <div>
      <section className="grid min-h-[50vh] place-items-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">scroll ↓ — the panel pins</p>
      </section>
      <PinnedScene
        aside={
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">Pinned panel</p>
            <p className="mt-2 max-w-xs text-sm leading-[1.7] text-ink/60">
              This column holds in place while the panel on the right scrubs through three states as you scroll.
            </p>
          </div>
        }
        steps={STEPS.map((step) => (
          <div key={step.n}>
            <span className="font-serif text-6xl italic text-accent">{step.n}</span>
            <h4 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight">{step.title}</h4>
          </div>
        ))}
      />
      <section className="grid min-h-[50vh] place-items-center">
        <p className="font-serif text-5xl italic">Fin.</p>
      </section>
    </div>
  );
}
