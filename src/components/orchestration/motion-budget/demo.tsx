// MotionBudget — arm the field and watch the queue drain in waves
import { useRef, useState } from 'react';
import { Budgeted, MotionBudget, type BudgetStats } from './MotionBudget';

const CARDS = Array.from({ length: 48 }, (_, i) => i);

export default function MotionBudgetDemo() {
  const [armed, setArmed] = useState(false);
  const [limit, setLimit] = useState(4);
  const [key, setKey] = useState(0);
  const stats = useRef<HTMLSpanElement>(null);

  const report = (s: BudgetStats) => {
    if (stats.current) {
      stats.current.textContent = `running ${s.running} · queued ${String(s.queued).padStart(2, '0')} · admitted ${s.admitted}`;
    }
  };

  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-8 px-10">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">
          48 cards, {limit} may move at once — the rest wait
        </p>
        <span ref={stats} className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
          running 0 · queued 00 · admitted 0
        </span>
      </div>

      <MotionBudget
        key={key}
        limit={limit}
        minGap={70}
        onStats={report}
        className="grid grid-cols-12 gap-1.5 border border-ink p-1.5"
      >
        {CARDS.map((i) => (
          <Budgeted
            key={i}
            when={armed}
            duration={520}
            // The top row is the headline: it should never queue behind a thumbnail.
            priority={i < 12 ? 10 : 0}
            // Two states, one transition — the component only flips the attribute.
            className="aspect-square translate-y-3 border border-ink/20 bg-ink/[0.04] opacity-20 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] data-[admit=in]:translate-y-0 data-[admit=in]:border-ink data-[admit=in]:bg-vermilion data-[admit=in]:opacity-100"
          >
            <span className="sr-only">card {i}</span>
          </Budgeted>
        ))}
      </MotionBudget>

      <div className="flex flex-wrap items-center gap-6 border-t border-ink pt-8">
        <button
          type="button"
          onClick={() => {
            if (armed) {
              setArmed(false);
              setKey((k) => k + 1);
            } else setArmed(true);
          }}
          className="cursor-pointer border border-ink px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-ink hover:text-bone"
        >
          {armed ? 'reset' : 'arm all 48'}
        </button>
        <label className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em]">
          budget
          <input
            type="range"
            min={1}
            max={16}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-52 accent-vermilion"
          />
          <span className="tabular-nums">{limit} at a time</span>
        </label>
        <p className="max-w-sm font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] opacity-60">
          the first row carries priority 10, so it is always served first no matter where the queue is
        </p>
      </div>
    </section>
  );
}
