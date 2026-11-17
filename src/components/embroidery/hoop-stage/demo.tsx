// HoopStage
import { useState } from 'react';
import { HoopStage } from './HoopStage';
import { GARMENTS } from '@/lib/embroidery';

export default function HoopStageDemo() {
  const [garment, setGarment] = useState(GARMENTS[0]);
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-4xl flex-col justify-center gap-8 px-6 py-16 sm:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-sm font-mono text-xs uppercase tracking-[0.3em]">
          drag it, or use the zones — the size is real millimetres
        </p>
        <div className="flex border border-ink">
          {GARMENTS.map((g, i) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGarment(g)}
              aria-pressed={garment.id === g.id}
              className={`min-h-[44px] px-3 font-mono text-[10px] uppercase tracking-[0.14em] ${
                i ? 'border-l border-ink' : ''
              } ${garment.id === g.id ? 'bg-ink text-bone' : 'text-ink/60'}`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>
      <HoopStage key={garment.id} garment={garment} />
    </div>
  );
}
