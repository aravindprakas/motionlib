// BentoGrid — a 4x3 wall revealing in reading order
import { useState } from 'react';
import { ShellStage } from '@/lib/shell/ShellStage';
import { BentoGrid, BentoCell, type ColSpan, type RowSpan } from './BentoGrid';

interface Panel {
  id: string;
  eyebrow: string;
  title: string;
  value?: string;
  body?: string;
  col: ColSpan;
  row: RowSpan;
  accent?: boolean;
}

const PANELS: Panel[] = [
  {
    id: 'throughput',
    eyebrow: 'Live',
    title: 'Events ingested',
    value: '4.28B',
    body: 'Rolling 24 hours across fourteen regions.',
    col: 2,
    row: 1,
    accent: true,
  },
  { id: 'latency', eyebrow: 'p99', title: 'Write latency', value: '38ms', col: 1, row: 1 },
  { id: 'uptime', eyebrow: '90 days', title: 'Availability', value: '99.99%', col: 1, row: 1 },
  {
    id: 'map',
    eyebrow: 'Topology',
    title: 'Edge coverage',
    body: 'Fourteen points of presence, three of them added this quarter. Traffic is steered by measured latency rather than by geography, so a request from Chennai does not go to Mumbai on principle.',
    col: 2,
    row: 2,
  },
  { id: 'queue', eyebrow: 'Backlog', title: 'Queue depth', value: '1,204', col: 1, row: 1 },
  { id: 'cost', eyebrow: 'MTD', title: 'Spend', value: '$18,402', col: 1, row: 1 },
  {
    id: 'errors',
    eyebrow: 'Last hour',
    title: 'Error budget',
    value: '92%',
    body: 'Two incidents, both resolved inside the window.',
    col: 2,
    row: 1,
  },
];

export default function ShellBentoGridDemo() {
  const [run, setRun] = useState(0);

  return (
    <ShellStage
      bleed
      hint="One container owns the stagger; the cells only declare where they start and end. Add or remove a panel and the rhythm still works."
    >
      <div className="flex items-center justify-between px-8 pt-8">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-indigo-500">
            Layout
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">BentoGrid</h1>
        </div>
        <button
          type="button"
          onClick={() => setRun((r) => r + 1)}
          className="inline-flex h-9 items-center rounded-[999px] border border-gray-200 px-4 text-[11px] font-medium uppercase tracking-[0.14em] text-gray-500 transition-all duration-200 ease-out hover:-translate-y-[2px] hover:text-gray-900 active:scale-95 dark:border-white/10 dark:text-gray-400 dark:hover:text-white"
        >
          Replay
        </button>
      </div>

      <BentoGrid key={run} revealOnView={false} delay={0.1}>
        {PANELS.map((panel) => (
          <BentoCell key={panel.id} colSpan={panel.col} rowSpan={panel.row}>
            <div
              className={[
                'group flex h-full w-full flex-col rounded-[24px] border p-6',
                'transition-all duration-400 ease-out',
                'hover:-translate-y-[4px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]',
                'dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]',
                'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
                panel.accent
                  ? 'border-transparent bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white'
                  : 'border-gray-100 bg-white dark:border-white/10 dark:bg-white/[0.03]',
              ].join(' ')}
            >
              <span
                className={
                  'text-[11px] font-medium uppercase tracking-[0.16em] ' +
                  (panel.accent ? 'text-white/70' : 'text-gray-400 dark:text-gray-500')
                }
              >
                {panel.eyebrow}
              </span>
              <h2
                className={
                  'mt-5 text-[13px] font-medium ' +
                  (panel.accent ? 'text-white/80' : 'text-gray-500 dark:text-gray-400')
                }
              >
                {panel.title}
              </h2>
              {panel.value ? (
                <p className="tnum mt-2 text-[32px] font-semibold leading-none tracking-[-0.035em]">
                  {panel.value}
                </p>
              ) : null}
              {panel.body ? (
                <p
                  className={
                    'mt-3 text-[13px] leading-relaxed ' +
                    (panel.accent ? 'text-white/75' : 'text-gray-500 dark:text-gray-400')
                  }
                >
                  {panel.body}
                </p>
              ) : null}
              <span
                aria-hidden
                className={
                  'mt-auto pt-6 text-[11px] uppercase tracking-[0.16em] opacity-0 transition-opacity duration-400 ease-out group-hover:opacity-60 ' +
                  (panel.accent ? 'text-white' : 'text-gray-400')
                }
              >
                {panel.col}x{panel.row}
              </span>
            </div>
          </BentoCell>
        ))}
      </BentoGrid>

      <p className="mx-auto max-w-2xl px-8 pb-4 text-[13px] leading-relaxed text-gray-500 dark:text-gray-400">
        Explicit <code className="font-mono text-[12px]">md:grid-rows-3</code> is what makes the tall
        cell possible. With implicit rows a <code className="font-mono text-[12px]">row-span-2</code>{' '}
        cell defines its own track and the wall stops lining up. Below{' '}
        <code className="font-mono text-[12px]">md</code> the spans stop applying entirely — a 2x2
        cell in a 375px viewport is just a cell.
      </p>
    </ShellStage>
  );
}
