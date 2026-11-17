import { useState } from 'react';
import { CartLineItem } from './CartLineItem';
import { sampleCartLines } from '@/lib/sample-data';

export default function CartLineItemDemo() {
  const [lines, setLines] = useState(sampleCartLines);

  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center px-8">
      <div className="w-full max-w-lg">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em]">cart line item + quantity stepper</p>
        <div className="border border-ink">
          {lines.map((line) => (
            <CartLineItem
              key={line.sku}
              {...line}
              onInc={() => setLines((ls) => ls.map((l) => (l.sku === line.sku ? { ...l, qty: l.qty + 1 } : l)))}
              onDec={() =>
                setLines((ls) => ls.map((l) => (l.sku === line.sku ? { ...l, qty: Math.max(1, l.qty - 1) } : l)))
              }
              onRemove={() => setLines((ls) => ls.filter((l) => l.sku !== line.sku))}
            />
          ))}
          {lines.length === 0 && (
            <p className="p-8 text-center font-serif text-2xl italic">Empty file.</p>
          )}
        </div>
      </div>
    </section>
  );
}
