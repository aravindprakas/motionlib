import { useState } from 'react';
import { CartDrawer } from './CartDrawer';
import { PrimaryButton } from '@/components/buttons/buttons/PrimaryButton';
import { sampleCartLines } from '@/lib/sample-data';

export default function CartDrawerDemo() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState(sampleCartLines);

  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
      <PrimaryButton onClick={() => setOpen(true)}>OPEN CART DRAWER</PrimaryButton>
      {open && (
        <CartDrawer
          lines={lines.map((line) => ({
            ...line,
            onInc: () => setLines((ls) => ls.map((l) => (l.sku === line.sku ? { ...l, qty: l.qty + 1 } : l))),
            onDec: () =>
              setLines((ls) => ls.map((l) => (l.sku === line.sku ? { ...l, qty: Math.max(1, l.qty - 1) } : l))),
            onRemove: () => setLines((ls) => ls.filter((l) => l.sku !== line.sku)),
          }))}
          subtotalFmt="₹30,100"
          freeShipText="You qualify for free shipping"
          onClose={() => setOpen(false)}
        />
      )}
    </section>
  );
}
