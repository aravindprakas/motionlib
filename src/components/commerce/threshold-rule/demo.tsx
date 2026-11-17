// ThresholdRule
import { useState } from 'react';
import { ThresholdRule } from './ThresholdRule';

const catalogue = [
  { name: 'Vector Cap', price: 2400 },
  { name: 'Ledger Wallet', price: 3900 },
  { name: 'Margin Scarf', price: 4100 },
];

export default function ThresholdRuleDemo() {
  const [lines, setLines] = useState<number[]>([]);
  const subtotal = lines.reduce((a, i) => a + catalogue[i].price, 0);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-10 px-10">
      <p className="font-mono text-xs uppercase tracking-[0.3em]">
        add items — the rule only animates at the moment it matters
      </p>

      <ThresholdRule subtotal={subtotal} threshold={10000} />

      <div className="flex max-w-md flex-wrap gap-3 border-t border-ink pt-8">
        {catalogue.map((c, i) => (
          <button
            key={c.name}
            type="button"
            onClick={() => setLines((l) => [...l, i])}
            className="cursor-pointer border border-ink px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] hover:bg-ink hover:text-bone"
          >
            + {c.name} · ₹{c.price.toLocaleString('en-IN')}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setLines([])}
          className="cursor-pointer px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink/50 underline"
        >
          Empty cart
        </button>
      </div>
    </div>
  );
}
