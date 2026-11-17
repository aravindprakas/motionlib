// ui-120 — PullQuote
import { PullQuote } from './PullQuote';

export default function PullQuoteDemo() {
  return (
    <div className="px-10">
      <section className="grid min-h-[60vh] place-items-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">scroll ↓ — the rule draws in</p>
      </section>
      <section className="py-24">
        <PullQuote />
      </section>
      <section className="border-t border-ink py-24">
        <PullQuote
          quote="Hard edges are honest. A border tells you exactly where a thing ends."
          cite="Field notes, on hairlines"
        />
      </section>
    </div>
  );
}
