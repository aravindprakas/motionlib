// CondenseBuyBar
import { CondenseBuyBar } from './CondenseBuyBar';

export default function CondenseBuyBarDemo() {
  return (
    <div className="px-10 py-16">
      <CondenseBuyBar
        name="Foundry Shell Parka"
        price="₹18,900"
        meta="AR-OUT-0042 · Bone / Vermilion · M"
      >
        <div className="mx-auto max-w-xl border border-ink p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/50">AW26 · Outerwear</p>
          <h2 className="mt-3 font-display text-4xl">Foundry Shell Parka</h2>
          <p className="mt-2 font-mono text-lg tabular-nums">₹18,900</p>
          <button
            type="button"
            className="mt-8 w-full cursor-pointer bg-accent py-4 font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink"
          >
            Add to cart
          </button>
        </div>
      </CondenseBuyBar>

      <div className="mx-auto mt-16 max-w-xl space-y-6 text-sm leading-relaxed text-ink/70">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink">
          scroll — the bar arrives only once the box above is gone
        </p>
        {Array.from({ length: 9 }).map((_, i) => (
          <p key={i}>
            62% nylon, 38% wool. Milled in Portugal, bar-tacked at every stress point and finished
            with a storm flap that runs the full length of the placket. Cut long, worn open. The
            shell is treated for light rain and nothing more — this is a coat, not a technical
            garment, and it is honest about that.
          </p>
        ))}
      </div>
    </div>
  );
}
