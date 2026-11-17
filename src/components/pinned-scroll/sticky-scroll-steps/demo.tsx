import { StickyScrollSteps } from './StickyScrollSteps';

const VISUAL_STYLES = [
  'bg-bone text-ink',
  'bg-ink text-paper',
  'bg-accent text-ink',
  'bg-bone text-accent',
];

const STEPS = ['Capture', 'Measure', 'Compose', 'Ship'].map((t, i) => ({
  text: (
    <div className="max-w-md px-8">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-ink/50">step {String(i + 1).padStart(2, '0')}</p>
      <h3 className="font-display text-4xl font-bold uppercase tracking-tight">{t}</h3>
      <p className="mt-4 font-serif text-xl italic leading-snug">
        As this block crosses the middle of the viewport, the pinned plate on the left switches to its matching state.
      </p>
    </div>
  ),
  visual: (
    <div className={`flex h-full w-full items-center justify-center border border-ink ${VISUAL_STYLES[i]}`}>
      <span className="font-serif text-9xl italic">{String(i + 1).padStart(2, '0')}</span>
    </div>
  ),
}));

export default function StickyScrollStepsDemo() {
  return (
    <div className="px-8 py-16">
      <StickyScrollSteps steps={STEPS} side="left" />
      <section className="grid min-h-[40vh] place-items-center">
        <p className="font-serif text-5xl italic">Fin.</p>
      </section>
    </div>
  );
}
