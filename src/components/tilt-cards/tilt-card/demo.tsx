// ui-10 — TiltCard
import { TiltCard, TiltCardLayer } from './TiltCard';

export default function TiltCardDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8 py-16">
      <div className="flex flex-col items-center gap-12">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">04 / 3d parallax</p>

        <TiltCard intensity={14} className="h-[480px] w-[380px]">
          <div
            className="flex h-full flex-col justify-between p-8"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <TiltCardLayer
              depth={20}
              className="flex items-start justify-between font-mono text-xs uppercase tracking-widest"
            >
              <span>№ 04</span>
              <span className="text-vermilion">tilt.card</span>
            </TiltCardLayer>

            <TiltCardLayer depth={60}>
              <h3 className="font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight">
                Depth is a lie<span className="text-vermilion">.</span>
              </h3>
              <p className="mt-4 font-serif text-xl italic">A convincing one, at 60&nbsp;fps.</p>
            </TiltCardLayer>

            <TiltCardLayer
              depth={-30}
              className="border-t border-ink pt-4 font-mono text-[11px] uppercase tracking-widest"
            >
              springs / preserve-3d / glare
            </TiltCardLayer>
          </div>
        </TiltCard>

        <p className="max-w-sm text-center font-serif text-lg italic">
          Layers ride different depth multipliers — the headline lifts, the footer sinks.
        </p>
      </div>
    </section>
  );
}
