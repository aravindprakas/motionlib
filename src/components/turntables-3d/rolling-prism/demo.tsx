// ui-14 — RollingPrism
import { RollingPrism } from './RollingPrism';

export default function RollingPrismDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-6 py-16">
      <div className="w-full max-w-4xl">
        <p className="mb-8 font-mono text-xs uppercase tracking-[0.3em] text-ink/60">
          07 / rolling prism · pick a day
        </p>
        <RollingPrism />
      </div>
    </section>
  );
}
