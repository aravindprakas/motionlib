// ui-54 — TextRoll
import { TextRoll } from './TextRoll';

export default function TextRollDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8">
      <div className="flex flex-col items-center gap-12 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">hover to roll</p>

        <div className="flex flex-col items-center gap-6">
          <TextRoll className="cursor-pointer font-display text-6xl font-bold uppercase tracking-tight md:text-8xl">
            STUDIO
          </TextRoll>
          <TextRoll
            center
            className="cursor-pointer font-display text-6xl font-bold uppercase tracking-tight text-vermilion md:text-8xl"
          >
            OUTWARD
          </TextRoll>
          <TextRoll className="cursor-pointer font-mono text-2xl uppercase tracking-[0.2em]">
            index / 04
          </TextRoll>
        </div>

        <p className="max-w-md border-t border-ink pt-6 font-serif text-lg italic">
          Two stacked copies — the top rolls up as the bottom rolls in, character by character.
        </p>
      </div>
    </section>
  );
}
