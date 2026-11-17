// ui-83 — MorphingSubmitButton
import { MorphingSubmitButton } from './MorphingSubmitButton';

export default function MorphingSubmitButtonDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8">
      <div className="flex flex-col items-center gap-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">click to submit</p>

        <MorphingSubmitButton />

        <p className="max-w-md border-t border-ink pt-6 font-serif text-lg italic">
          One button, three lives: pill, spinner, then a success state whose check draws itself — the width morphs on a layout spring.
        </p>
      </div>
    </section>
  );
}
