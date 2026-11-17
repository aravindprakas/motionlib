// ui-44 — ScrubCompare
import { ScrubCompare } from './ScrubCompare';

export default function ScrubCompareDemo() {
  return (
    <div className="px-10 pb-24 text-navy">
      <section className="flex min-h-[40vh] flex-col justify-end gap-4 pb-12">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-coral">42 / scrub compare</p>
        <p className="max-w-[46ch] font-serif text-2xl italic leading-snug text-navy-soft">
          The wipe tracks your scroll — no dragging, the seam follows the page.
        </p>
      </section>

      <ScrubCompare />

      <section className="grid min-h-[40vh] place-items-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-navy-soft">scroll to wipe</p>
      </section>
    </div>
  );
}
