// ui-110 — FAQ
import { Faq } from './Faq';

export default function FaqDemo() {
  return (
    <section className="min-h-[calc(100vh-3.5rem)] px-8 py-20">
      <p className="mx-auto mb-12 max-w-3xl font-mono text-xs uppercase tracking-[0.3em] text-ink/50">
        frequently asked
      </p>
      <Faq />
    </section>
  );
}
