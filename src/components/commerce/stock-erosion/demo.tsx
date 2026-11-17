// StockErosion
import { useState } from 'react';
import { StockErosion } from './StockErosion';

export default function StockErosionDemo() {
  const [stock, setStock] = useState(12);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-12 px-10">
      <div>
        <p className="mb-8 font-mono text-xs uppercase tracking-[0.3em]">
          drag the stock down — the rule wears out
        </p>
        <StockErosion stock={stock} />
        <input
          type="range"
          min={0}
          max={12}
          value={stock}
          aria-label="Units in stock"
          onChange={(e) => setStock(Number(e.target.value))}
          className="mt-8 w-full max-w-sm accent-[#ff4d23]"
        />
      </div>

      <div className="grid max-w-3xl grid-cols-2 gap-x-12 gap-y-8 border-t border-ink pt-10 md:grid-cols-4">
        {[12, 4, 1, 0].map((s) => (
          <div key={s}>
            <StockErosion stock={s} />
          </div>
        ))}
      </div>
    </div>
  );
}
