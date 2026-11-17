// ui-92 — PinCodeInput
import { PinCodeInput } from './PinCodeInput';

export default function PinCodeInputDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8">
      <div className="flex flex-col items-center gap-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">type the code</p>

        <PinCodeInput />

        <p className="max-w-md border-t border-ink pt-6 font-serif text-lg italic">
          Digits pop in on springs; a wrong code shakes the row and clears itself, the right one lifts every box in a green stagger.
        </p>
      </div>
    </section>
  );
}
