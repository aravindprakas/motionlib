// ui-76 — BentoGrid
import { BentoGrid, type BentoCell } from './BentoGrid';

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] opacity-60">{label}</span>
      <span className="font-serif text-2xl italic">{value}</span>
    </>
  );
}

const CELLS: BentoCell[] = [
  { key: 'a', span: 'col-span-2 row-span-2 bg-ink text-paper', content: <Cell label="Feature" value="2 × 2" /> },
  { key: 'b', span: 'col-span-2', content: <Cell label="Wide" value="2 × 1" /> },
  { key: 'c', span: 'bg-accent text-paper', content: <Cell label="Accent" value="1 × 1" /> },
  { key: 'd', content: <Cell label="Unit" value="1 × 1" /> },
  { key: 'e', span: 'col-span-2', content: <Cell label="Wide" value="2 × 1" /> },
  { key: 'f', content: <Cell label="Unit" value="1 × 1" /> },
  { key: 'g', content: <Cell label="Unit" value="1 × 1" /> },
  { key: 'h', content: <Cell label="Unit" value="1 × 1" /> },
  { key: 'i', span: 'col-span-2 bg-ink text-paper', content: <Cell label="Wide Dark" value="2 × 1" /> },
  { key: 'j', content: <Cell label="Unit" value="1 × 1" /> },
];

export default function BentoGridDemo() {
  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-8 px-10">
      <p className="font-mono text-xs uppercase tracking-[0.3em]">bento spans + hover lift</p>
      <BentoGrid cells={CELLS} />
    </section>
  );
}
