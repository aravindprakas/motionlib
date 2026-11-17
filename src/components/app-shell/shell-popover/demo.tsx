// Popover — open one near the bottom edge and watch where it grows from
import { useState } from 'react';
import { ShellStage } from '@/lib/shell/ShellStage';
import { Popover, PopoverItem, PopoverSeparator } from './Popover';

const trigger =
  'inline-flex h-10 items-center gap-2 rounded-[12px] border border-gray-200 bg-white px-4 text-[13px] font-medium text-gray-700 outline-none transition-all duration-200 ease-out hover:border-gray-300 hover:bg-gray-50 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-white/12 dark:bg-white/[0.04] dark:text-gray-200 dark:hover:bg-white/[0.08] dark:focus-visible:ring-offset-[#0b0b0d]';

const Chevron = () => (
  <svg viewBox="0 0 12 12" className="h-3 w-3 opacity-50" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="m3 4.5 3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function ShellPopoverDemo() {
  const [last, setLast] = useState('nothing yet');

  return (
    <ShellStage hint="Open the one at the bottom of the page: it flips above the button and grows from its bottom edge, because the origin is resolved after placement.">
      <div className="mx-auto max-w-4xl space-y-14">
        <header className="space-y-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-indigo-500">
            Overlay
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] md:text-4xl">Popover</h1>
          <p className="max-w-xl text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">
            <code className="font-mono text-[13.5px]">data-[state=open]:scale-100</code> only
            transitions if the panel spent a painted frame at{' '}
            <code className="font-mono text-[13.5px]">scale-95</code> first. Mount it already open
            and there is nothing to interpolate from — the usual reason a popover has a transition in
            the CSS and no animation on screen.
          </p>
        </header>

        <section className="flex flex-wrap items-start gap-4">
          <Popover
            role="menu"
            align="end"
            trigger={
              <button type="button" className={trigger}>
                Actions
                <Chevron />
              </button>
            }
          >
            <div className="py-1.5">
              <PopoverItem meta="⌘E" onSelect={() => setLast('Edit deployment')}>
                Edit deployment
              </PopoverItem>
              <PopoverItem meta="⌘D" onSelect={() => setLast('Duplicate')}>
                Duplicate
              </PopoverItem>
              <PopoverItem meta="⌘R" onSelect={() => setLast('Roll back')}>
                Roll back to previous
              </PopoverItem>
              <PopoverSeparator />
              <PopoverItem disabled>Transfer ownership</PopoverItem>
              <PopoverItem danger onSelect={() => setLast('Delete')}>
                Delete permanently
              </PopoverItem>
            </div>
          </Popover>

          <Popover
            align="start"
            trigger={
              <button type="button" className={trigger}>
                Left aligned
                <Chevron />
              </button>
            }
          >
            <div className="w-[280px] p-4">
              <p className="text-[13px] font-semibold text-gray-900 dark:text-white">
                A dialog, not a menu
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500 dark:text-gray-400">
                With <code className="font-mono text-[12px]">role="dialog"</code> there is no
                arrow-key roving — the content owns its own keyboard model.
              </p>
              <button
                type="button"
                className="mt-4 h-9 w-full rounded-[10px] bg-gray-900 text-[13px] font-medium text-white transition-all duration-200 ease-out hover:opacity-90 active:scale-95 dark:bg-white dark:text-gray-900"
              >
                Understood
              </button>
            </div>
          </Popover>

          <Popover
            side="top"
            trigger={
              <button type="button" className={trigger}>
                Prefers top
                <Chevron />
              </button>
            }
          >
            <div className="w-[240px] p-4 text-[13px] leading-relaxed text-gray-500 dark:text-gray-400">
              Asked for the top. If there is no room up there it flips down and the origin follows.
            </div>
          </Popover>
        </section>

        <p className="text-[13px] text-gray-500 dark:text-gray-400">
          Last action: <span className="font-medium">{last}</span>
        </p>

        <div className="space-y-4 rounded-[24px] border border-gray-100 bg-gray-50/60 p-6 dark:border-white/10 dark:bg-white/[0.02]">
          <h2 className="text-[14px] font-semibold tracking-[-0.02em]">Keyboard</h2>
          <ul className="space-y-1.5 text-[13px] text-gray-500 dark:text-gray-400">
            <li>↑ / ↓ — move between items, wrapping at both ends (menu role only)</li>
            <li>Home / End — first and last item</li>
            <li>Escape — close, and focus goes back to the trigger</li>
            <li>Tab — leaves the panel; the panel closes on the pointerdown outside</li>
          </ul>
        </div>

        {/* Runway, so the last trigger sits near the bottom edge and has to flip. */}
        <div className="h-[55vh]" />

        <section className="flex justify-center pb-4">
          <Popover
            role="menu"
            side="bottom"
            trigger={
              <button type="button" className={trigger}>
                Near the bottom edge
                <Chevron />
              </button>
            }
          >
            <div className="py-1.5">
              <PopoverItem onSelect={() => setLast('Flipped: view logs')}>View logs</PopoverItem>
              <PopoverItem onSelect={() => setLast('Flipped: restart')}>Restart service</PopoverItem>
              <PopoverItem onSelect={() => setLast('Flipped: drain')}>Drain traffic</PopoverItem>
            </div>
          </Popover>
        </section>
      </div>
    </ShellStage>
  );
}
