// ui-90 — DialKnob
import { useEffect, useRef, useState } from 'react';

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
const TICKS = 25;

/**
 * Rotary knob: drag vertically to turn (synth-plugin style), the indicator
 * sweeps −135°…135° and arc ticks ignite behind it. Double-click recenters.
 */
export function DialKnob({ defaultValue = 64 }: { defaultValue?: number }) {
  const [v, setV] = useState(defaultValue);
  const [drag, setDrag] = useState(false);
  const startY = useRef(0);
  const startV = useRef(0);

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => setV(clamp(startV.current + (startY.current - e.clientY) * 0.5, 0, 100));
    const up = () => setDrag(false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [drag]);

  const angle = -135 + (v / 100) * 270;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-32 w-32">
        {/* tick arc */}
        <svg viewBox="0 0 128 128" className="absolute inset-0">
          {Array.from({ length: TICKS }, (_, k) => {
            const a = ((-135 + (k / (TICKS - 1)) * 270) * Math.PI) / 180;
            const lit = (k / (TICKS - 1)) * 100 <= v;
            const x1 = 64 + Math.sin(a) * 52;
            const y1 = 64 - Math.cos(a) * 52;
            const x2 = 64 + Math.sin(a) * 60;
            const y2 = 64 - Math.cos(a) * 60;
            return (
              <line
                key={k}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={lit ? '#ff4d23' : 'rgba(12,11,14,0.18)'}
                strokeWidth={lit ? 3 : 2}
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* knob */}
        <div
          onPointerDown={(e) => { setDrag(true); startY.current = e.clientY; startV.current = v; }}
          onDoubleClick={() => setV(50)}
          className="absolute left-1/2 top-1/2 h-20 w-20 cursor-ns-resize touch-none rounded-full border-2 border-ink bg-bone shadow-elev-2"
          style={{ transform: `translate(-50%, -50%) rotate(${angle}deg) scale(${drag ? 0.96 : 1})` }}
        >
          <span className="absolute left-1/2 top-2 h-5 w-1 -translate-x-1/2 rounded-full bg-vermilion" />
        </div>
      </div>

      <div className="font-mono text-xs tnum uppercase tracking-[0.2em] text-ink/70">
        Vol <span className="text-ink">{Math.round(v)}</span>
      </div>
    </div>
  );
}
