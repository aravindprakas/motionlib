// ui-49 — StickyTimeline
import { StickyTimeline } from './StickyTimeline';

export default function StickyTimelineDemo() {
  return (
    <div className="px-10 pb-24 text-navy">
      <section className="grid min-h-[46vh] place-items-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-navy-soft">
          37 / the line draws as you pass ↓
        </p>
      </section>
      <StickyTimeline className="mx-auto max-w-3xl" />
      <section className="grid min-h-[30vh] place-items-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-navy-soft">fifty and counting</p>
      </section>
    </div>
  );
}
