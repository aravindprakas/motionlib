// AttentionField — stop touching anything for four seconds
import { useState } from 'react';
import { AttentionField, type AttentionState } from './AttentionField';

const ROWS = [
  { label: 'orders today', value: '1,284' },
  { label: 'in transit', value: '312' },
  { label: 'awaiting pick', value: '47' },
  { label: 'returns open', value: '9' },
];

export default function AttentionFieldDemo() {
  const [state, setState] = useState<AttentionState>('engaged');

  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-8 px-10">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">
          go still for four seconds — the panel notices and settles
        </p>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
          state: <span className="text-vermilion">{state}</span>
        </span>
      </div>

      <AttentionField idleAfter={4000} breath={5} onStateChange={setState} className="border border-ink">
        <div
          className="flex items-center justify-between gap-4 border-b border-ink px-6 py-4"
          style={{
            // Live things get quieter as attention leaves, rather than stopping dead.
            opacity: 'calc(0.4 + var(--attention) * 0.6)',
            transform: 'translateY(calc(var(--breath) * -3px))',
          }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.22em]">live floor · warehouse 2</span>
          <span
            className="h-2 w-2 bg-vermilion"
            style={{ transform: 'scale(calc(0.7 + var(--attention) * 0.5 + var(--breath) * 0.35))' }}
          />
        </div>

        <div className="grid grid-cols-2 gap-px bg-ink/10 md:grid-cols-4">
          {ROWS.map((r, i) => (
            <div
              key={r.label}
              className="bg-bone px-6 py-8"
              style={{
                // Each tile breathes a beat behind the one before it.
                transform: `translateY(calc(var(--breath) * ${(i + 1) * 2}px)) scale(calc(1 - (1 - var(--attention)) * 0.015))`,
                filter: 'blur(calc((1 - var(--attention)) * 1.1px))',
              }}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">{r.label}</p>
              <p className="mt-3 font-display text-3xl tabular-nums">{r.value}</p>
            </div>
          ))}
        </div>

        <p
          className="border-t border-ink px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em]"
          style={{ opacity: 'calc(1 - var(--attention))' }}
        >
          paused · move the pointer to resume live updates
        </p>
      </AttentionField>

      <p className="max-w-2xl border-t border-ink pt-6 font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] opacity-60">
        one root writes --attention and --breath · every child above reads them through inheritance · switch tabs and
        the field is away before you come back
      </p>
    </section>
  );
}
