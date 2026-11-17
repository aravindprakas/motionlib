// ui-57 — GradientHeadline
import { GradientHeadline } from './GradientHeadline';

export default function GradientHeadlineDemo() {
  return (
    <div className="px-10 pb-24 text-navy">
      <section className="flex min-h-[50vh] flex-col justify-end gap-4 pb-12">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-coral">39 / gradient headline</p>
        <p className="max-w-[46ch] font-serif text-2xl italic leading-snug text-navy-soft">
          The token gradient lives inside the letters and slides as you scroll.
        </p>
      </section>

      <section className="grid min-h-[80vh] content-center">
        <GradientHeadline className="text-[clamp(58px,16vw,220px)] font-bold leading-[0.86] tracking-[-0.05em]">
          MOTION
          <br />
          MATTERS
        </GradientHeadline>
      </section>

      <section className="grid min-h-[40vh] place-items-center border-t border-navy-line">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-navy-soft">keep scrolling</p>
      </section>
    </div>
  );
}
