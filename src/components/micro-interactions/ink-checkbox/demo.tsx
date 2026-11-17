// ui-93 — InkCheckbox
import { InkCheckbox } from './InkCheckbox';

export default function InkCheckboxDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8">
      <div className="flex flex-col items-center gap-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">check things off</p>

        <InkCheckbox />

        <p className="max-w-md border-t border-ink pt-6 font-serif text-lg italic">
          Ink floods the box on a spring, the check draws itself, and a vermilion strike crosses the task out — all reversible.
        </p>
      </div>
    </section>
  );
}
