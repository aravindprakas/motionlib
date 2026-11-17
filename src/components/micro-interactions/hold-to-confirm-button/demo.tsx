// ui-82 — HoldToConfirmButton
import { HoldToConfirmButton } from './HoldToConfirmButton';

export default function HoldToConfirmButtonDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8">
      <div className="flex flex-col items-center gap-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">press and hold</p>

        <HoldToConfirmButton />

        <p className="max-w-md border-t border-ink pt-6 font-serif text-lg italic">
          The fill charges while you hold; bail early and it snaps back with a scold, hold the line and it commits.
        </p>
      </div>
    </section>
  );
}
