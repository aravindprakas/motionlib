// SpecDiff — comparison that hides everything the two products agree on
import { useMemo, useState } from 'react';

export interface SpecRow {
  label: string;
  a: string;
  b: string;
}

export interface SpecDiffProps {
  names: [string, string];
  rows: SpecRow[];
  /** Start with matching rows already collapsed. Default false. */
  startCollapsed?: boolean;
  className?: string;
}

/**
 * A two-product spec table with one control: hide everything they agree on.
 * Matching rows do not disappear — they collapse to nothing over a beat, so the
 * shopper watches the table reduce to the handful of lines that actually decide
 * the purchase.
 *
 * Comparison tables fail by being complete. Twenty-four rows of which nineteen
 * are identical is not information, it is a wall, and the shopper resolves it by
 * leaving. Subtracting the agreement is the entire product: what remains is,
 * literally, the decision.
 *
 * The collapse uses `grid-template-rows: 1fr → 0fr`, which animates to intrinsic
 * height without measuring anything — no `scrollHeight` reads, no forced layout,
 * and rows of any content height animate correctly.
 */
export function SpecDiff({ names, rows, startCollapsed = false, className = '' }: SpecDiffProps) {
  const [diffOnly, setDiffOnly] = useState(startCollapsed);
  const same = useMemo(() => rows.filter((r) => r.a === r.b).length, [rows]);

  return (
    <div className={`w-full max-w-2xl ${className}`}>
      <div className="flex items-end justify-between gap-6 border-b border-ink pb-4">
        <div className="grid flex-1 grid-cols-[1fr_1fr_1fr] gap-4">
          <span />
          <p className="font-mono text-[11px] uppercase tracking-[0.16em]">{names[0]}</p>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em]">{names[1]}</p>
        </div>
        <button
          type="button"
          aria-pressed={diffOnly}
          onClick={() => setDiffOnly((v) => !v)}
          className={`shrink-0 cursor-pointer border border-ink px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] ${
            diffOnly ? 'bg-accent' : 'hover:bg-ink/5'
          }`}
        >
          {diffOnly ? `${same} matching hidden` : 'Differences only'}
        </button>
      </div>

      <div>
        {rows.map((r) => {
          const matches = r.a === r.b;
          const hidden = diffOnly && matches;
          return (
            <div
              key={r.label}
              aria-hidden={hidden}
              className="grid"
              style={{
                gridTemplateRows: hidden ? '0fr' : '1fr',
                opacity: hidden ? 0 : 1,
                transition: 'grid-template-rows 320ms cubic-bezier(0.65,0,0.35,1), opacity 200ms ease',
              }}
            >
              <div className="overflow-hidden">
                <div
                  className={`grid grid-cols-[1fr_1fr_1fr] gap-4 border-b border-ink/12 py-3 text-[13px] ${
                    matches ? 'text-ink/45' : ''
                  }`}
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/55">
                    {r.label}
                  </p>
                  <p className={matches ? '' : 'font-medium'}>{r.a}</p>
                  <p className={matches ? '' : 'font-medium text-accent'}>{r.b}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
