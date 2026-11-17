// ui-88 — WaveVolumeSlider
import { useEffect, useRef, useState } from 'react';
import { Volume, Volume1, Volume2 } from 'lucide-react';

const W = 260;
const H = 56;
const MID = H / 2;

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/**
 * Volume slider whose filled track is a living sine wave: amplitude follows
 * the level, the phase drifts continuously, and the thumb rides the crest.
 */
export function WaveVolumeSlider({ defaultValue = 0.65 }: { defaultValue?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(defaultValue);
  const [drag, setDrag] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      setPhase((p) => p + (t - last) * 0.005);
      last = t;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const read = (clientX: number) => {
    const r = ref.current!.getBoundingClientRect();
    setV(clamp((clientX - r.left) / r.width, 0, 1));
  };

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => read(e.clientX);
    const up = () => setDrag(false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [drag]);

  const amp = 14 * v;
  const split = v * W;
  const waveY = (x: number) => MID + Math.sin(x * 0.09 + phase) * amp;

  let d = `M 0 ${waveY(0).toFixed(2)}`;
  for (let x = 4; x <= split; x += 4) d += ` L ${x} ${waveY(x).toFixed(2)}`;
  d += ` L ${split.toFixed(2)} ${waveY(split).toFixed(2)}`;

  const Icon = v === 0 ? Volume : v < 0.55 ? Volume1 : Volume2;

  return (
    <div className="flex items-center gap-5">
      <Icon className="h-5 w-5 shrink-0 text-ink" />
      <div
        ref={ref}
        onPointerDown={(e) => { setDrag(true); read(e.clientX); }}
        className="cursor-pointer touch-none"
        style={{ width: W }}
      >
        <svg width={W} height={H} className="block overflow-visible">
          <line x1={split} y1={MID} x2={W} y2={MID} stroke="rgba(12,11,14,0.2)" strokeWidth="2" strokeLinecap="round" />
          <path d={d} fill="none" stroke="#ff4d23" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle
            cx={split}
            cy={waveY(split)}
            r={drag ? 9 : 7}
            className="fill-bone stroke-ink"
            strokeWidth="2.5"
            style={{ transition: 'r 150ms' }}
          />
        </svg>
      </div>
      <span className="w-10 font-mono text-xs tnum text-ink/70">{Math.round(v * 100)}%</span>
    </div>
  );
}
