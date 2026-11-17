// ui-56 — LetterStagger
import { LetterStagger } from './LetterStagger';

export default function LetterStaggerDemo() {
  return (
    <div className="px-10 pb-24 text-navy">
      <section className="flex min-h-[72vh] flex-col justify-end gap-6 border-b border-navy-line pb-16">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-coral">31 / letter stagger</p>
        <LetterStagger
          as="h1"
          text="Type that assembles itself, character by character."
          className="max-w-[18ch] text-[clamp(28px,6vw,70px)] font-semibold leading-[1.08] tracking-[-0.03em]"
        />
      </section>

      <section className="grid min-h-[60vh] place-items-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-navy-soft">scroll ↓</p>
      </section>

      <section className="border-t border-navy-line pt-16">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-navy-soft">
          every glyph on its own beat
        </p>
        <LetterStagger
          text="Twenty more, cut from the same palette."
          hotChance={0.22}
          className="text-[clamp(26px,4vw,52px)] font-semibold tracking-[-0.02em]"
        />
      </section>
    </div>
  );
}
