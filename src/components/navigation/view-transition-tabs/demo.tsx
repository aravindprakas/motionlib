import { ViewTransitionTabs } from './ViewTransitionTabs';

const TABS = [
  {
    title: 'The Method',
    body: 'State swaps wrapped in startViewTransition cross-fade natively. Where the API is missing, the swap is instant.',
  },
  {
    title: 'The Grid',
    body: 'A strict baseline grid and hairline rules carry the structure — no shadows, no rounded softness.',
  },
  {
    title: 'The Motion',
    body: 'Transform and opacity only. Every effect respects prefers-reduced-motion and degrades on touch.',
  },
];

export default function ViewTransitionTabsDemo() {
  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-6 px-10">
      <p className="font-mono text-xs uppercase tracking-[0.3em]">view transitions api</p>
      <ViewTransitionTabs tabs={TABS} />
    </section>
  );
}
