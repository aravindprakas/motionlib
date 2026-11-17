// ui-73 — RippleGrid
import { RippleGrid } from './RippleGrid';

export default function RippleGridDemo() {
  return (
    <div className="px-10 py-24 text-navy">
      <div className="mb-10 flex items-baseline gap-4">
        <span className="font-mono text-xs font-bold tracking-[0.12em] text-coral">47</span>
        <h2 className="text-[clamp(19px,2.3vw,28px)] font-medium tracking-[-0.01em]">Ripple dot grid</h2>
        <span className="ml-auto hidden font-mono text-xs text-navy-soft sm:block">click to send a wave</span>
      </div>
      <RippleGrid />
    </div>
  );
}
