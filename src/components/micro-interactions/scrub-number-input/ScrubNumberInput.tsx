// ui-91 — ScrubNumberInput
import { useEffect, useRef, useState } from 'react';

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

export interface ScrubNumberInputProps {
  label?: string;
  unit?: string;
  min?: number;
  max?: number;
  defaultValue?: number;
}

/**
 * After-Effects-style scrubbable value: drag horizontally anywhere on the
 * field to change the number while a ruler tape slides beneath it. Focus it
 * and use arrow keys for precision.
 */
export function ScrubNumberInput({ label = 'Duration', unit = 'ms', min = 0, max = 500, defaultValue = 120 }: ScrubNumberInputProps) {
  const [v, setV] = useState(defaultValue);
  const [drag, setDrag] = useState(false);
  const startX = useRef(0);
  const startV = useRef(0);

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => setV(clamp(Math.round(startV.current + (e.clientX - startX.current)), min, max));
    const up = () => setDrag(false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [drag, min, max]);

  return (
    <div
      tabIndex={0}
      role="spinbutton"
      aria-valuenow={v}
      aria-valuemin={min}
      aria-valuemax={max}
      onPointerDown={(e) => { setDrag(true); startX.current = e.clientX; startV.current = v; }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); setV((c) => clamp(c + 1, min, max)); }
        if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); setV((c) => clamp(c - 1, min, max)); }
      }}
      className={`group w-56 cursor-ew-resize touch-none select-none border-2 px-4 py-3 outline-none transition-colors ${drag ? 'border-vermilion' : 'border-ink focus:border-vermilion'}`}
    >
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink/60">{label}</span>
        <span className={`font-mono text-2xl tnum transition-transform duration-150 ${drag ? 'scale-110 text-vermilion' : 'text-ink'}`}>
          {v}<span className="ml-1 text-xs text-ink/50">{unit}</span>
        </span>
      </div>

      {/* ruler tape */}
      <div className="mt-3 h-4 overflow-hidden">
        <div
          className="flex h-full w-[200%] items-end gap-[7px]"
          style={{ transform: `translateX(${-((v * 3) % 32)}px)` }}
        >
          {Array.from({ length: 64 }, (_, k) => (
            <span key={k} className={`w-px shrink-0 ${k % 4 === 0 ? 'h-full bg-ink/50' : 'h-1/2 bg-ink/25'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
