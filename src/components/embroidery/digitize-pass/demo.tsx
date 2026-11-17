// DigitizePass
import { DigitizePass } from './DigitizePass';

export default function DigitizePassDemo() {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-3.5rem)] max-w-md content-center gap-8 px-6 py-16 sm:px-10">
      <p className="max-w-md font-mono text-xs uppercase tracking-[0.3em]">
        artwork is not a stitch file — this is the work in between
      </p>
      <DigitizePass />
    </div>
  );
}
