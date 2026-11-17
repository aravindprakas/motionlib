// ui-67 — Odometer
import { Odometer } from './Odometer';

export default function OdometerDemo() {
  return (
    <div className="px-10 py-24 text-navy">
      <div className="mb-12 flex items-baseline gap-4">
        <span className="font-mono text-xs font-bold tracking-[0.12em] text-coral">35</span>
        <h2 className="text-[clamp(19px,2.3vw,28px)] font-medium tracking-[-0.01em]">Rolling-digit odometer</h2>
        <span className="ml-auto hidden font-mono text-xs text-navy-soft sm:block">
          each column spins into place
        </span>
      </div>
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <Odometer value="48207" />
          <div className="mt-3 font-mono text-[13px] tracking-[0.04em] text-navy-soft">
            Frames rendered / sec aggregate
          </div>
        </div>
        <div>
          <Odometer value="00930" />
          <div className="mt-3 font-mono text-[13px] tracking-[0.04em] text-navy-soft">
            Commits this quarter
          </div>
        </div>
      </div>
    </div>
  );
}
