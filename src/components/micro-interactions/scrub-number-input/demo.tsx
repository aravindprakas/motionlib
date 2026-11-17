// ui-91 — ScrubNumberInput
import { ScrubNumberInput } from './ScrubNumberInput';

export default function ScrubNumberInputDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8">
      <div className="flex flex-col items-center gap-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">drag sideways · arrows fine-tune</p>

        <ScrubNumberInput />

        <p className="max-w-md border-t border-ink pt-6 font-serif text-lg italic">
          Borrowed from motion tools: the number is the slider. A ruler tape slides underneath so you can feel the value move.
        </p>
      </div>
    </section>
  );
}
