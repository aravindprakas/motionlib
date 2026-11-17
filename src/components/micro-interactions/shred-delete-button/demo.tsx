// ui-84 — ShredDeleteButton
import { ShredDeleteButton } from './ShredDeleteButton';

export default function ShredDeleteButtonDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8">
      <div className="flex flex-col items-center gap-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">click to shred</p>

        <ShredDeleteButton />

        <p className="max-w-md border-t border-ink pt-6 font-serif text-lg italic">
          The button splits into seven clip-path slats that drop and scatter like a document through a shredder; an undo chip stays behind.
        </p>
      </div>
    </section>
  );
}
