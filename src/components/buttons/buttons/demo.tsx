// ui-98 — Buttons
import { PrimaryButton } from './PrimaryButton';
import { OutlineButton } from './OutlineButton';
import { UnderlineButton } from './UnderlineButton';

export default function ButtonsDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8">
      <div className="flex flex-col items-center gap-10">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">button set</p>
        <div className="flex flex-wrap items-center justify-center gap-8">
          <PrimaryButton>PRIMARY ACTION →</PrimaryButton>
          <OutlineButton>SECONDARY ACTION</OutlineButton>
          <UnderlineButton>TERTIARY / INLINE</UnderlineButton>
        </div>
        <p className="max-w-md text-center font-serif text-lg italic">
          Vermilion fill, hairline outline, underline — mono labels, hard edges, no radius anywhere.
        </p>
      </div>
    </section>
  );
}
