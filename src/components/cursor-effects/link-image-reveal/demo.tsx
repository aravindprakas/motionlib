// ui-5 — LinkImageReveal
import { LinkImageReveal } from './LinkImageReveal';

const ITEMS = [
  {
    label: 'Northern Studies',
    swatch: 'radial-gradient(120% 120% at 20% 10%, var(--color-accent), var(--color-ink))',
  },
  {
    label: 'Grid & Counterform',
    swatch: 'repeating-linear-gradient(135deg, var(--color-ink) 0 12px, var(--color-paper) 12px 24px)',
  },
  {
    label: 'Index of Methods',
    swatch: 'conic-gradient(from 45deg, var(--color-accent), var(--color-paper), var(--color-ink), var(--color-accent))',
  },
];

export default function LinkImageRevealDemo() {
  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center px-10">
      <p className="mb-8 font-mono text-xs uppercase tracking-[0.3em]">hover a link — the plate trails the cursor</p>
      <LinkImageReveal items={ITEMS} />
    </section>
  );
}
