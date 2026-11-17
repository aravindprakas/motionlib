// HeroSection — eight elements, one spring, one stagger
import { useState } from 'react';
import { ShellStage } from '@/lib/shell/ShellStage';
import { HeroSection, type HeroStat } from './HeroSection';

const STATS: HeroStat[] = [
  { label: 'Events / day', value: '4.2B' },
  { label: 'p99 latency', value: '38ms' },
  { label: 'Regions', value: '14' },
];

const cta =
  'group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-[14px] px-6 text-sm font-medium text-white outline-none transition-[transform,box-shadow] duration-150 ease-out active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0b0b0d]';

const secondary =
  'inline-flex h-12 items-center gap-2 rounded-[14px] border border-gray-200 px-6 text-sm font-medium text-gray-700 outline-none transition-all duration-200 ease-out hover:border-gray-300 hover:bg-gray-50 active:scale-95 dark:border-white/12 dark:text-gray-200 dark:hover:bg-white/5';

export default function ShellHeroDemo() {
  // Remounting replays the reveal — the point of the demo is the arrival.
  const [run, setRun] = useState(0);

  return (
    <ShellStage
      bleed
      hint="Every element runs the same 100/20 spring; only the start times differ. That is what makes eight independent animations read as one gesture."
    >
      <div className="flex justify-end px-6 pt-6 md:px-10">
        <button
          type="button"
          onClick={() => setRun((r) => r + 1)}
          className="inline-flex h-9 items-center rounded-[999px] border border-gray-200 px-4 text-[11px] font-medium uppercase tracking-[0.14em] text-gray-500 transition-all duration-200 ease-out hover:-translate-y-[2px] hover:text-gray-900 active:scale-95 dark:border-white/10 dark:text-gray-400 dark:hover:text-white"
        >
          Replay reveal
        </button>
      </div>

      <HeroSection
        key={run}
        eyebrow="Now in general availability"
        headline="Ship the interface people already expect."
        subhead="A production shell with the motion built in — sticky chrome, a bento wall, a table that cascades, and overlays that actually animate. Ten components, one spring, no orphan timings."
        stats={STATS}
        actions={
          <>
            <button type="button" className={cta}>
              <span
                aria-hidden
                className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-indigo-600 bg-left bg-[length:200%_auto] transition-[background-position] duration-500 ease-out group-hover:bg-right"
              />
              Start building
              <svg
                viewBox="0 0 16 16"
                className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden
              >
                <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button type="button" className={secondary}>
              Read the docs
            </button>
          </>
        }
        media={
          <div className="rounded-[24px] border border-gray-100 bg-white p-6 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.25)] dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-gray-400">
                Throughput
              </p>
              <span className="rounded-[999px] bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                +12.4%
              </span>
            </div>
            <p className="tnum mt-4 text-[40px] font-semibold leading-none tracking-[-0.04em]">
              4.2B
            </p>
            <div className="mt-6 flex h-28 items-end gap-1.5">
              {[38, 52, 44, 61, 55, 72, 66, 84, 78, 91, 86, 100].map((h, i) => (
                <span
                  key={i}
                  style={{ height: h + '%' }}
                  className="flex-1 rounded-[4px] bg-gradient-to-t from-indigo-500/25 to-fuchsia-500/60 transition-all duration-400 ease-out hover:from-indigo-500/45 hover:to-fuchsia-500"
                />
              ))}
            </div>
            <p className="mt-5 border-t border-gray-100 pt-4 text-[12px] text-gray-400 dark:border-white/10 dark:text-gray-500">
              Rolling 12 hours · all regions
            </p>
          </div>
        }
      />
    </ShellStage>
  );
}
