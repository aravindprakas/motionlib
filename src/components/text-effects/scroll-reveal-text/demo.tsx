// ui-51 — ScrollRevealText
import { ScrollRevealText } from './ScrollRevealText';

export default function ScrollRevealTextDemo() {
  return (
    <div className="px-10 pb-24">
      <section className="flex min-h-[60vh] flex-col justify-end gap-6 border-b border-ink pb-16">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">02 / scroll reveal</p>
        <ScrollRevealText
          as="h1"
          text="Type that arrives with intent."
          className="max-w-4xl font-display text-6xl font-bold uppercase leading-[0.95] tracking-tight md:text-7xl"
        />
      </section>

      <section className="grid min-h-[60vh] place-items-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">scroll ↓</p>
      </section>

      <section className="border-t border-ink py-32">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.3em]">split: char</p>
        <ScrollRevealText
          splitBy="char"
          stagger={0.02}
          text="Character by character"
          className="font-display text-5xl font-bold uppercase tracking-tight"
        />
        <div className="mt-12 max-w-2xl border-l border-ink pl-8">
          <ScrollRevealText
            as="p"
            stagger={0.03}
            text="Each unit is masked by its parent span and slides up into place — transform and opacity only, staggered as the block enters the viewport."
            className="font-serif text-2xl italic leading-snug"
          />
        </div>
      </section>

      <section className="grid min-h-[50vh] place-items-center border-t border-ink">
        <ScrollRevealText text="Fin." className="font-serif text-8xl italic" />
      </section>
    </div>
  );
}
