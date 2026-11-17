// ui-85 — ReactionButton
import { ReactionButton } from './ReactionButton';

export default function ReactionButtonDemo() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8">
      <div className="flex flex-col items-center gap-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">tap the heart</p>

        <ReactionButton />

        <p className="max-w-md border-t border-ink pt-6 font-serif text-lg italic">
          Ignition fires an eight-particle burst while the counter rolls like an odometer — direction-aware, up on like, down on unlike.
        </p>
      </div>
    </section>
  );
}
