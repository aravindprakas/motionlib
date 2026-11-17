// PrimaryButton — hover for the 500ms sweep, press for the 120ms answer
import { useState } from 'react';
import { ShellStage } from '@/lib/shell/ShellStage';
import { PrimaryButton, type ButtonSize, type ButtonVariant } from './PrimaryButton';

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger'];
const SIZES: ButtonSize[] = ['sm', 'md', 'lg'];

const ArrowRight = () => (
  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
    <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Sparkle = () => (
  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden>
    <path d="M8 1.5 9.4 6 14 7.4 9.4 8.8 8 13.4 6.6 8.8 2 7.4 6.6 6 8 1.5Z" />
  </svg>
);

export default function ShellPrimaryButtonDemo() {
  const [busy, setBusy] = useState(false);

  const run = () => {
    setBusy(true);
    window.setTimeout(() => setBusy(false), 1800);
  };

  return (
    <ShellStage hint="Hover: the gradient travels for 500ms. Press: the whole button answers in 120ms. Two clocks, one control.">
      <div className="mx-auto max-w-4xl space-y-14">
        <header className="space-y-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-indigo-500">Control</p>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] md:text-4xl">PrimaryButton</h1>
          <p className="max-w-xl text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">
            The sweep and the press run on separate layers so they can run on separate durations —
            ambience at 500ms, feedback at 120ms. One element cannot carry both.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400">Variants</h2>
          <div className="flex flex-wrap items-center gap-3">
            {VARIANTS.map((variant) => (
              <PrimaryButton key={variant} variant={variant} iconRight={<ArrowRight />}>
                {variant[0].toUpperCase() + variant.slice(1)}
              </PrimaryButton>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400">Sizes</h2>
          <div className="flex flex-wrap items-center gap-3">
            {SIZES.map((size) => (
              <PrimaryButton key={size} size={size} iconLeft={<Sparkle />}>
                Generate report
              </PrimaryButton>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400">
            States
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <PrimaryButton loading={busy} onClick={run}>
              {busy ? 'Deploying' : 'Deploy to production'}
            </PrimaryButton>
            <PrimaryButton variant="secondary" disabled>
              Disabled
            </PrimaryButton>
            <PrimaryButton variant="ghost">Cancel</PrimaryButton>
          </div>
          <p className="text-[13px] leading-relaxed text-gray-500 dark:text-gray-400">
            The loading label stays mounted at zero opacity. Swapping it for a spinner would resize
            the button under a pointer that had already committed to the click.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400">
            Full width
          </h2>
          <div className="max-w-sm">
            <PrimaryButton fullWidth size="lg" iconRight={<ArrowRight />}>
              Continue
            </PrimaryButton>
          </div>
        </section>
      </div>
    </ShellStage>
  );
}
