// Header — scroll and watch it change state four times, not four hundred
import { useState } from 'react';
import { ShellStage } from '@/lib/shell/ShellStage';
import { Header, type HeaderNavItem } from './Header';

const ITEMS: HeaderNavItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'pipelines', label: 'Pipelines' },
  { id: 'changelog', label: 'Changelog' },
];

const SECTIONS = [
  {
    title: 'Why state, not position',
    body: 'A header wired to a scroll listener re-renders sixty times a second for the sake of one boolean. This one watches the scroller and commits to React only when something changes that a consumer can branch on — crossing the threshold, or reversing direction. Scroll steadily in one direction and it renders zero times.',
  },
  {
    title: 'The continuous channel',
    body: 'The progress rule under the bar still tracks the scroll per-pixel. It just does it outside React: a --scroll-progress custom property written straight to the element inside a rAF, read by a scaleX in CSS. Precision where precision is visible, and nothing where it is not.',
  },
  {
    title: 'Why direction is debounced',
    body: 'Hide-on-scroll-down is the reason the direction flag needs six pixels of hysteresis. Without it, the sub-pixel jitter of a trackpad flips the flag constantly and the bar strobes — which is considerably worse than not having the behaviour at all.',
  },
  {
    title: 'One transition, four properties',
    body: 'Background, border, shadow and transform all move together on a single 300ms ease-in-out. Give them separate durations and the bar reads as four things finishing at slightly different times rather than one bar settling.',
  },
  {
    title: 'The blur is doing work',
    body: 'backdrop-blur-xl over a 70% ground keeps whatever passes underneath legible as a suggestion of itself. Go opaque and the page flattens; drop the blur and text collides with text.',
  },
  {
    title: 'Below md',
    body: 'The nav collapses into a sheet that animates on grid-template-rows, which transitions from 0fr to 1fr without anyone having to measure the content first. Height transitions on auto do not work; this does.',
  },
];

export default function ShellHeaderDemo() {
  const [active, setActive] = useState('analytics');

  return (
    <ShellStage
      bleed
      hint="Scroll: the bar condenses once at 8px and the rule under it tracks per-pixel. Scroll down past that and it slides away; reverse and it comes back."
    >
      <Header
        brand={
          <>
            <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[12px] font-bold text-white">
              A
            </span>
            Aperture
          </>
        }
        items={ITEMS}
        activeId={active}
        onSelect={setActive}
        hideOnScrollDown
        progress
        actions={
          <button
            type="button"
            className="hidden h-9 items-center rounded-[999px] bg-gray-900 px-4 text-[13px] font-medium text-white transition-all duration-200 ease-out hover:opacity-90 active:scale-95 dark:bg-white dark:text-gray-900 sm:inline-flex"
          >
            Sign in
          </button>
        }
      />

      <div className="mx-auto max-w-3xl px-5 py-16 md:px-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-indigo-500">
          Section — {active}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em]">
          Sixty-four pixels of chrome
        </h1>

        <div className="mt-12 space-y-12">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-[17px] font-semibold tracking-[-0.02em]">{section.title}</h2>
              <p className="mt-2.5 text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-16 h-[70vh] rounded-[24px] border border-dashed border-gray-200 bg-gray-50/50 p-6 text-[12px] text-gray-400 dark:border-white/10 dark:bg-white/[0.02] dark:text-gray-500">
          Runway — keep scrolling to see the bar leave and return.
        </div>
      </div>
    </ShellStage>
  );
}
