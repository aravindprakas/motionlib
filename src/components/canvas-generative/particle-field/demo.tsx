// ui-70 — ParticleField
import { ParticleField } from './ParticleField';

export default function ParticleFieldDemo() {
  return (
    <section className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-ink text-bone">
      <ParticleField mode="particles" dotColor="#ece6d8" accentColor="#ff4d23" />

      <div className="pointer-events-none relative z-10 grid min-h-[calc(100vh-3.5rem)] place-items-center px-8 text-center">
        <div className="flex flex-col items-center gap-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-bone/60">move the cursor</p>
          <h2 className="max-w-2xl font-display text-4xl font-bold uppercase tracking-tight md:text-6xl">
            Linked particle field
          </h2>
          <p className="max-w-md font-serif text-lg italic text-bone/80">
            Dots drift and wrap; the pointer repels them and draws a vermilion link to every neighbour in range.
          </p>
        </div>
      </div>
    </section>
  );
}
