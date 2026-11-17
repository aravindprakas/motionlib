// ui-86 — SquishToggle
import { SquishToggle } from './SquishToggle';

export default function SquishToggleDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8">
      <div className="flex flex-col items-center gap-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">flip it</p>

        <div className="flex items-center gap-8">
          <SquishToggle />
          <SquishToggle defaultOn />
        </div>

        <p className="max-w-md border-t border-ink pt-6 font-serif text-lg italic">
          Squash on press, stretch in flight, overshoot on landing — cartoon physics in twenty-eight pixels of knob.
        </p>
      </div>
    </section>
  );
}
