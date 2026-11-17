// ui-71 — GooeyBlob
import { GooeyBlob } from './GooeyBlob';

export default function GooeyBlobDemo() {
  return (
    <div className="px-10 py-24 text-navy">
      <div className="mb-10 flex items-baseline gap-4">
        <span className="font-mono text-xs font-bold tracking-[0.12em] text-coral">41</span>
        <h2 className="text-[clamp(19px,2.3vw,28px)] font-medium tracking-[-0.01em]">Morphing blob</h2>
        <span className="ml-auto hidden font-mono text-xs text-navy-soft sm:block">hover to wobble</span>
      </div>
      <div className="flex flex-wrap items-center gap-12">
        <GooeyBlob />
        <p className="max-w-[28ch] leading-relaxed text-navy-soft">
          A single element whose border-radius is animated on a loop, then shoved harder on hover —
          organic motion, zero SVG.
        </p>
      </div>
    </div>
  );
}
