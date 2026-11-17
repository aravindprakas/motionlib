// ui-58 — ReadingHighlight
import { ReadingHighlight } from './ReadingHighlight';

export default function ReadingHighlightDemo() {
  return (
    <div className="px-10 pb-24 text-navy">
      <section className="flex min-h-[46vh] flex-col justify-end gap-4 pb-12">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-coral">43 / reading highlight</p>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-navy-soft">
          words light up as you reach them ↓
        </p>
      </section>

      <section className="grid min-h-[90vh] content-center">
        <ReadingHighlight
          text="Reading is rhythm. As you scroll, each word ignites in turn and the ones behind you settle into ink, so the eye always knows exactly where the sentence is carrying it next."
          className="max-w-[22ch] text-[clamp(24px,4.4vw,50px)] font-medium leading-[1.32] tracking-[-0.02em]"
        />
      </section>

      <section className="grid min-h-[30vh] place-items-center border-t border-navy-line">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-navy-soft">fin</p>
      </section>
    </div>
  );
}
