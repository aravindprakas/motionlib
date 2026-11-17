import { ScrollTextReveal } from './ScrollTextReveal';

export default function ScrollTextRevealDemo() {
  return (
    <div>
      <section className="grid min-h-[70vh] place-items-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">scroll ↓ — progress-driven, not one-shot</p>
      </section>
      <section className="border-t border-ink bg-ink px-10 py-[20vh] text-paper">
        <h2 className="mx-auto max-w-4xl text-4xl leading-tight md:text-5xl">
          <ScrollTextReveal
            parts={[
              { text: 'Words resolve ' },
              { text: 'one by one', accent: true },
              { text: ' as you scroll — opacity, translate and a touch of ' },
              { text: 'blur', accent: true },
              { text: ', all mapped to progress. Scroll back up and they stay.' },
            ]}
          />
        </h2>
      </section>
      <section className="grid min-h-[60vh] place-items-center">
        <p className="font-serif text-5xl italic">Fin.</p>
      </section>
    </div>
  );
}
