// ui-61 — MasonryReveal
import { MasonryReveal } from './MasonryReveal';

export default function MasonryRevealDemo() {
  return (
    <div className="px-10 pb-24 text-navy">
      <section className="grid min-h-[50vh] place-items-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-navy-soft">scroll to uncrop ↓</p>
      </section>
      <div className="mb-10 flex items-baseline gap-4">
        <span className="font-mono text-xs font-bold tracking-[0.12em] text-coral">49</span>
        <h2 className="text-[clamp(19px,2.3vw,28px)] font-medium tracking-[-0.01em]">Masonry clip-reveal</h2>
        <span className="ml-auto hidden font-mono text-xs text-navy-soft sm:block">
          tiles uncrop on a stagger
        </span>
      </div>
      <MasonryReveal />
    </div>
  );
}
