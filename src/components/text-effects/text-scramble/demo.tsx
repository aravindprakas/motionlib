// ui-52 — TextScramble
import { TextScramble } from './TextScramble';

export default function TextScrambleDemo() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-16 px-10">
      <div>
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em]">trigger: view</p>
        <TextScramble
          as="h1"
          text="DECRYPTING THE GRID"
          className="font-display text-6xl font-bold uppercase tracking-tight"
        />
      </div>
      <div className="border-t border-ink pt-12">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em]">trigger: hover — mouse over each line</p>
        <div className="flex flex-col gap-2">
          {['INDEX / 001', 'SYSTEM / 002', 'ARCHIVE / 003'].map((t) => (
            <TextScramble key={t} text={t} trigger="hover" speed={1.6} className="w-max cursor-default font-mono text-2xl tracking-[0.1em] hover:text-accent" />
          ))}
        </div>
      </div>
    </div>
  );
}
