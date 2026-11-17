// ui-47 — Scrollspy
import { Scrollspy } from './Scrollspy';

export default function ScrollspyDemo() {
  return (
    <div className="px-10 py-24 text-navy">
      <div className="mb-10 flex items-baseline gap-4">
        <span className="font-mono text-xs font-bold tracking-[0.12em] text-coral">48</span>
        <h2 className="text-[clamp(19px,2.3vw,28px)] font-medium tracking-[-0.01em]">Sliding scrollspy</h2>
        <span className="ml-auto hidden font-mono text-xs text-navy-soft sm:block">
          the marker chases the active section
        </span>
      </div>
      <Scrollspy />
      <section className="grid min-h-[40vh] place-items-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-navy-soft">scroll through the stack</p>
      </section>
    </div>
  );
}
