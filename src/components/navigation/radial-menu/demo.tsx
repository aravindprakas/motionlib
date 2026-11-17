// ui-106 — RadialMenu
import { RadialMenu } from './RadialMenu';

export default function RadialMenuDemo() {
  return (
    <div className="px-10 py-24 text-navy">
      <div className="mb-10 flex items-baseline gap-4">
        <span className="font-mono text-xs font-bold tracking-[0.12em] text-coral">33</span>
        <h2 className="text-[clamp(19px,2.3vw,28px)] font-medium tracking-[-0.01em]">Radial burst menu</h2>
        <span className="ml-auto hidden font-mono text-xs text-navy-soft sm:block">hover the core</span>
      </div>
      <div className="flex flex-wrap items-center gap-12 pl-16 pt-16">
        <RadialMenu />
        <p className="max-w-[26ch] leading-relaxed text-navy-soft">
          Six petals spring out on an arc with eased, staggered timing — each carrying its own token
          colour.
        </p>
      </div>
    </div>
  );
}
