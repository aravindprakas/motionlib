// ui-99 — CopyButton
import { CopyButton } from './CopyButton';

export default function CopyButtonDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8">
      <div className="flex flex-col items-center gap-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">click to copy</p>

        <div className="flex items-center gap-6 border border-ink bg-ink/5 px-5 py-3">
          <code className="font-mono text-sm">npm i motion-lib</code>
          <CopyButton value="npm i motion-lib" />
        </div>

        <div className="flex items-end gap-6">
          <CopyButton value="sm" size="sm" />
          <CopyButton value="default" size="default" />
          <CopyButton value="lg" size="lg" />
        </div>

        <p className="max-w-md border-t border-ink pt-6 font-serif text-lg italic">
          Copy and check glyphs crossfade with a scale + blur; the state resets itself after a beat.
        </p>
      </div>
    </section>
  );
}
