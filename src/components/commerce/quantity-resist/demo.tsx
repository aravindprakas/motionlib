// QuantityResist
import { QuantityResist } from './QuantityResist';

export default function QuantityResistDemo() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-14 px-10">
      <div>
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.3em]">
          push past 4 — the field refuses, then explains
        </p>
        <QuantityResist stock={4} />
      </div>
      <div className="border-t border-ink pt-10">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.3em]">last one in stock</p>
        <QuantityResist stock={1} />
      </div>
    </div>
  );
}
