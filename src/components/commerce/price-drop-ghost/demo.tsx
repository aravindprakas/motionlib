// PriceDropGhost
import { useState } from 'react';
import { PriceDropGhost } from './PriceDropGhost';

const sizes = [
  { label: 'S', price: 18900 },
  { label: 'M', price: 18900 },
  { label: 'L', price: 21400 },
  { label: 'XL', price: 21400 },
];

export default function PriceDropGhostDemo() {
  const [i, setI] = useState(0);
  const [coupon, setCoupon] = useState(false);
  const price = Math.round(sizes[i].price * (coupon ? 0.8 : 1));

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-10 px-10">
      <p className="font-mono text-xs uppercase tracking-[0.3em]">
        change size or apply the code — the old figure leaves
      </p>

      <PriceDropGhost price={price} reason={coupon ? 'Code AW26 · −20%' : undefined} />

      <div className="flex flex-wrap items-center gap-3 border-t border-ink pt-8">
        {sizes.map((s, idx) => (
          <button
            key={s.label}
            type="button"
            onClick={() => setI(idx)}
            aria-pressed={i === idx}
            className={`h-11 w-11 cursor-pointer border border-ink font-mono text-xs ${
              i === idx ? 'bg-ink text-bone' : ''
            }`}
          >
            {s.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setCoupon((c) => !c)}
          className="ml-4 cursor-pointer border border-ink px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] hover:bg-accent"
        >
          {coupon ? 'Remove code' : 'Apply code AW26'}
        </button>
      </div>
    </div>
  );
}
