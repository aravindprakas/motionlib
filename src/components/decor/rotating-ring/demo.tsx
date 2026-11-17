// ui-114 — RotatingRing
import { RotatingRing } from './RotatingRing';

export default function RotatingRingDemo() {
  return (
    <div className="px-10 py-24 text-navy">
      <div className="mb-10 flex items-baseline gap-4">
        <span className="font-mono text-xs font-bold tracking-[0.12em] text-coral">46</span>
        <h2 className="text-[clamp(19px,2.3vw,28px)] font-medium tracking-[-0.01em]">Rotating type ring</h2>
        <span className="ml-auto hidden font-mono text-xs text-navy-soft sm:block">spins only while visible</span>
      </div>
      <div className="flex flex-wrap items-center gap-12">
        <RotatingRing />
        <p className="max-w-[26ch] leading-relaxed text-navy-soft">
          Text set on a circular path, rotated by a ticker that only advances while the badge is on
          screen.
        </p>
      </div>
    </div>
  );
}
