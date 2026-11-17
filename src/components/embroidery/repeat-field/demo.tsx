// RepeatField
import { RepeatField } from './RepeatField';

export default function RepeatFieldDemo() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-5xl flex-col justify-center gap-8 px-6 py-16 sm:px-10">
      <p className="max-w-md font-mono text-xs uppercase tracking-[0.3em]">
        tighten the spacing and watch the stitch count move
      </p>
      <RepeatField />
    </div>
  );
}
