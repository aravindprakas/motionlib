// ui-53 — VariableFontMorph
import { VariableFontMorph } from './VariableFontMorph';

export default function VariableFontMorphDemo() {
  return (
    <div className="px-10">
      <section className="grid min-h-[80vh] place-items-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">scroll ↓ — weight rides progress</p>
      </section>
      <section className="flex min-h-[70vh] flex-col justify-center">
        <VariableFontMorph text="WEIGHT & SPACE" className="font-display" />
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-ink/50">
          scroll to morph 300 → 800 · hover to snap bold (space grotesk variable axis)
        </p>
      </section>
      <section className="grid min-h-[80vh] place-items-center">
        <p className="font-serif text-5xl italic">Fin.</p>
      </section>
    </div>
  );
}
