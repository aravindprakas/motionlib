// ui-72 — WaveBars
import { WaveBars } from './WaveBars';

export default function WaveBarsDemo() {
  return (
    <div className="px-10 py-24 text-navy">
      <div className="mb-10 flex items-baseline gap-4">
        <span className="font-mono text-xs font-bold tracking-[0.12em] text-coral">45</span>
        <h2 className="text-[clamp(19px,2.3vw,28px)] font-medium tracking-[-0.01em]">Waveform bars</h2>
        <span className="ml-auto hidden font-mono text-xs text-navy-soft sm:block">
          canvas, paused off-screen
        </span>
      </div>
      <WaveBars />
    </div>
  );
}
