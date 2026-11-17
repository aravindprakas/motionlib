// ui-95 — PeelSticker
import { PeelSticker } from './PeelSticker';

export default function PeelStickerDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8">
      <div className="flex flex-col items-center gap-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">hover to lift · click to peel</p>

        <PeelSticker />

        <p className="max-w-md border-t border-ink pt-6 font-serif text-lg italic">
          The corner folds back on a spring — clip-path on the face, a gradient flap behind it. Rip it off and a dashed residue waits for a re-stick.
        </p>
      </div>
    </section>
  );
}
