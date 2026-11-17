// ui-90 — DialKnob
import { DialKnob } from './DialKnob';

export default function DialKnobDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8">
      <div className="flex flex-col items-center gap-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">drag up / down · double-click resets</p>

        <DialKnob />

        <p className="max-w-md border-t border-ink pt-6 font-serif text-lg italic">
          A synth-plugin dial: vertical drag turns the knob through 270° while the tick arc ignites behind it.
        </p>
      </div>
    </section>
  );
}
