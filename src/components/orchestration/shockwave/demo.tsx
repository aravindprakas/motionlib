// Shockwave — click anywhere in the field
import { useRef, useState } from 'react';
import { Shockwave, type ShockwaveHandle } from './Shockwave';

const CELLS = Array.from({ length: 72 }, (_, i) => i);

export default function ShockwaveDemo() {
  const field = useRef<ShockwaveHandle>(null);
  const log = useRef<HTMLSpanElement>(null);
  const [speed, setSpeed] = useState(1100);

  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-8 px-10">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">
          click the field — the wave leaves from your finger, not from item one
        </p>
        <span ref={log} className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
          reached: —
        </span>
      </div>

      <Shockwave
        ref={field}
        speed={speed}
        width={190}
        className="grid cursor-crosshair grid-cols-12 gap-1.5 border border-ink p-1.5"
        onArrive={(_, i) => {
          // Arrival order is spatial, so this reads out as a rising ring, not 0,1,2…
          if (log.current) log.current.textContent = `reached: cell ${String(i).padStart(2, '0')}`;
        }}
      >
        {CELLS.map((i) => (
          <div
            key={i}
            data-wave
            className="aspect-square bg-ink/[0.06] will-change-transform"
            style={{
              transform:
                'translate(calc(var(--wave-dx, 0) * var(--wave, 0) * 9px), calc(var(--wave-dy, 0) * var(--wave, 0) * 9px)) scale(calc(1 - var(--wave, 0) * 0.22))',
              backgroundColor:
                'color-mix(in srgb, var(--color-vermilion) calc(var(--wave, 0) * 100%), rgba(12,11,14,0.06))',
            }}
          />
        ))}
      </Shockwave>

      {/* The same field, driven from a control rather than a pointer. */}
      <div className="flex flex-wrap items-center gap-6 border-t border-ink pt-8">
        <button
          type="button"
          onClick={(e) => field.current?.fireFrom(e.currentTarget)}
          className="cursor-pointer border border-ink px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-ink hover:text-bone"
        >
          detonate from this button
        </button>
        <label className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em]">
          front speed
          <input
            type="range"
            min={250}
            max={3000}
            step={50}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-52 accent-vermilion"
          />
          <span className="tabular-nums">{speed} px/s</span>
        </label>
        <p className="max-w-sm font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] opacity-60">
          delay is distance ÷ speed, so arrival order is geometry — resize the window and it still holds
        </p>
      </div>
    </section>
  );
}
