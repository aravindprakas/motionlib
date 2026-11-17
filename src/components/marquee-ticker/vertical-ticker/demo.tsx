// ui-64 — VerticalTicker
import { VerticalTicker } from './VerticalTicker';

export default function VerticalTickerDemo() {
  return (
    <div className="px-10 py-24 text-navy">
      <div className="mb-10 flex items-baseline gap-4">
        <span className="font-mono text-xs font-bold tracking-[0.12em] text-coral">34</span>
        <h2 className="text-[clamp(19px,2.3vw,28px)] font-medium tracking-[-0.01em]">Vertical news ticker</h2>
        <span className="ml-auto hidden font-mono text-xs text-navy-soft sm:block">
          loops forever, pauses off-screen
        </span>
      </div>
      <VerticalTicker className="mx-auto max-w-2xl" />
    </div>
  );
}
