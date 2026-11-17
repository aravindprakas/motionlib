// StitchProgress
import { useEffect, useState } from 'react';
import { StitchProgress } from './StitchProgress';
import { DESIGNS, totalStitches } from '@/lib/embroidery';

const TOTAL = totalStitches(DESIGNS[0]);

export default function StitchProgressDemo() {
  // Stands in for whatever pushes order state — a poll, a socket, a webhook.
  const [done, setDone] = useState(Math.round(TOTAL * 0.34));
  useEffect(() => {
    const id = setInterval(() => setDone((d) => (d >= TOTAL ? 0 : Math.min(TOTAL, d + 420))), 900);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-3xl flex-col justify-center gap-8 px-6 py-16 sm:px-10">
      <p className="max-w-md font-mono text-xs uppercase tracking-[0.3em]">
        progress in stitches and metres — the units the floor actually uses
      </p>
      <StitchProgress stitchesDone={done} phase={done > TOTAL * 0.9 ? 3 : 2} />
    </div>
  );
}
