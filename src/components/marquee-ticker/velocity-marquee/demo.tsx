// ui-63 — VelocityMarquee
import { VelocityMarquee } from './VelocityMarquee';

const WORDS = ['motion', 'system', 'grid', 'type', 'index'];

export default function VelocityMarqueeDemo() {
  return (
    <div className="pb-24">
      <section className="flex min-h-[50vh] flex-col items-center justify-center gap-5">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">03 / velocity</p>
        <h1 className="font-display text-5xl font-bold uppercase tracking-tight">
          Scroll fast. Then slower.
        </h1>
      </section>

      <div className="space-y-8 border-y border-ink py-12">
        <VelocityMarquee
          baseVelocity={4}
          items={WORDS.map((w) => (
            <span key={w} className="font-display text-6xl font-bold uppercase tracking-tight">
              {w}
            </span>
          ))}
        />
        <VelocityMarquee
          baseVelocity={-4}
          items={WORDS.map((w) => (
            <span key={w} className="font-serif text-6xl italic">
              {w}
            </span>
          ))}
        />
      </div>

      <section className="grid min-h-[130vh] place-items-center">
        <p className="max-w-sm text-center font-serif text-xl italic">
          Speed and skew follow scroll velocity; direction flips when you scroll back up.
        </p>
      </section>
    </div>
  );
}
