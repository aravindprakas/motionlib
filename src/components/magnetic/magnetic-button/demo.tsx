// ui-7 — MagneticButton
import { MagneticButton } from './MagneticButton';

export default function MagneticButtonDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8">
      <div className="flex flex-col items-center gap-14 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">01 / pointer physics</p>

        <div className="flex flex-wrap items-center justify-center gap-12">
          <MagneticButton
            strength={0.5}
            radius={180}
            className="border border-ink bg-vermilion px-12 py-6 font-display text-xl font-bold uppercase tracking-tight text-ink transition-colors hover:bg-vermilion-hover"
          >
            Pull me in
          </MagneticButton>

          <MagneticButton
            strength={0.3}
            radius={140}
            className="border border-ink bg-transparent px-10 py-5 font-mono text-sm uppercase tracking-widest transition-colors hover:text-vermilion"
          >
            Secondary →
          </MagneticButton>
        </div>

        <p className="max-w-md border-t border-ink pt-6 font-serif text-lg italic">
          Move the cursor near a button — it leans toward you, then springs home.
        </p>
      </div>
    </section>
  );
}
