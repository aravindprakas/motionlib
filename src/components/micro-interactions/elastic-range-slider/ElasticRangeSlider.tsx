// ui-87 — ElasticRangeSlider
import { useEffect, useRef, useState } from 'react';

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/**
 * Range slider with rubber-band physics: drag past either end and the whole
 * track stretches away with resistance, snapping back on release with a
 * bounce. The thumb grows while dragging.
 */
export function ElasticRangeSlider({ defaultValue = 60 }: { defaultValue?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(defaultValue);
  const [over, setOver] = useState(0);
  const [drag, setDrag] = useState(false);

  const read = (clientX: number) => {
    const r = ref.current!.getBoundingClientRect();
    const raw = (clientX - r.left) / r.width;
    setV(clamp(raw, 0, 1) * 100);
    setOver(raw < 0 ? raw : raw > 1 ? raw - 1 : 0);
  };

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => read(e.clientX);
    const up = () => { setDrag(false); setOver(0); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag]);

  const stretch = 1 + clamp(Math.abs(over) * 0.18, 0, 0.12);
  const shift = clamp(over, -1, 1) * 22;

  return (
    <div className="flex w-72 flex-col items-center gap-5">
      <div
        ref={ref}
        onPointerDown={(e) => { setDrag(true); read(e.clientX); }}
        className="w-full cursor-grab touch-none py-3 active:cursor-grabbing"
      >
        <div
          className="relative h-2 rounded-full bg-ink/15"
          style={{
            transform: `translateX(${shift}px) scaleX(${stretch})`,
            transformOrigin: over > 0 ? 'left center' : 'right center',
            transition: drag ? 'none' : 'transform 0.45s cubic-bezier(0.34,1.86,0.44,1)',
          }}
        >
          <div className="absolute inset-y-0 left-0 rounded-full bg-vermilion" style={{ width: `${v}%` }} />
          <div
            className={`absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink bg-bone shadow-elev-2 transition-transform duration-150 ${drag ? 'scale-[1.35]' : ''}`}
            style={{ left: `${v}%` }}
          />
        </div>
      </div>
      <div className="font-mono text-xs tnum uppercase tracking-[0.2em] text-ink/70">{Math.round(v)}%</div>
    </div>
  );
}
