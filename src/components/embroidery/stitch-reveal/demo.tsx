// StitchReveal
import { StitchReveal } from './StitchReveal';
import { DESIGNS } from '@/lib/embroidery';

export default function StitchRevealDemo() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-3xl flex-col justify-center gap-10 px-6 py-16 sm:px-10">
      <p className="max-w-md font-mono text-xs uppercase tracking-[0.3em]">
        scroll it into view — it stitches in the order the machine runs
      </p>
      <div className="grid gap-10 sm:grid-cols-2">
        <StitchReveal design={DESIGNS[0]} />
        <StitchReveal design={DESIGNS[1]} speed={5200} />
      </div>
    </div>
  );
}
