// TossField — pick a tag up and throw it
import { useState } from 'react';
import { TossField, TossItem } from './TossField';

const TAGS = [
  { label: 'linen', x: 0.12, y: 0 },
  { label: 'over-dyed', x: 0.34, y: 0.1 },
  { label: 'boxy', x: 0.56, y: 0 },
  { label: 'unlined', x: 0.78, y: 0.12 },
  { label: 'made in Tiruppur', x: 0.24, y: 0.28 },
  { label: 'garment washed', x: 0.62, y: 0.3 },
];

export default function TossFieldDemo() {
  const [zeroG, setZeroG] = useState(false);

  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-8 px-10">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">
          flick a tag — the release keeps your speed, not a return transition
        </p>
        <button
          type="button"
          onClick={() => setZeroG((z) => !z)}
          className="cursor-pointer border border-ink px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-ink hover:text-bone"
        >
          {zeroG ? 'gravity on' : 'zero-g'}
        </button>
      </div>

      <TossField
        gravity={zeroG ? 0 : 2000}
        restitution={zeroG ? 0.9 : 0.5}
        drag={zeroG ? 0.95 : 0.55}
        className="h-[60vh] border border-ink bg-ink/[0.03]"
      >
        {TAGS.map((t) => (
          <TossItem key={t.label} x={t.x} y={t.y}>
            <span className="block border border-ink bg-bone px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em]">
              {t.label}
            </span>
          </TossItem>
        ))}
        <TossItem x={0.45} y={0.5}>
          <span className="block bg-vermilion px-5 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-bone">
            heavy one
          </span>
        </TossItem>
      </TossField>

      <p className="max-w-2xl border-t border-ink pt-6 font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] opacity-60">
        velocity sampled over the last 90ms of the drag · walls with restitution · pairwise separation · the loop stops
        dead once everything sleeps
      </p>
    </section>
  );
}
