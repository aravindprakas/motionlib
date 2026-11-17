// ui-89 — SwipeToConfirm
import { SwipeToConfirm } from './SwipeToConfirm';

export default function SwipeToConfirmDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8">
      <div className="flex flex-col items-center gap-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">drag the knob across</p>

        <SwipeToConfirm />

        <p className="max-w-md border-t border-ink pt-6 font-serif text-lg italic">
          Commit past 85% and it locks green; hesitate and the knob springs home. Friction as a consent mechanism.
        </p>
      </div>
    </section>
  );
}
