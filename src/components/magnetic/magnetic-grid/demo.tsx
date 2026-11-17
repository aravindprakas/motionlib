// ui-9 — MagneticGrid
import { MagneticGrid } from './MagneticGrid';

export default function MagneticGridDemo() {
  return (
    <div className="px-10 py-24 text-navy">
      <div className="mb-10 flex items-baseline gap-4">
        <span className="font-mono text-xs font-bold tracking-[0.12em] text-coral">36</span>
        <h2 className="text-[clamp(19px,2.3vw,28px)] font-medium tracking-[-0.01em]">Magnetic tile grid</h2>
        <span className="ml-auto hidden font-mono text-xs text-navy-soft sm:block">
          tiles lean toward your cursor
        </span>
      </div>
      <MagneticGrid className="mx-auto max-w-3xl" />
    </div>
  );
}
