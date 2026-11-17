// ui-89 — SwipeToConfirm
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, RotateCcw } from 'lucide-react';

const TRACK_W = 288;
const KNOB = 44;
const PAD = 4;
const TRAVEL = TRACK_W - KNOB - PAD * 2;

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/**
 * Slide-to-pay control: drag the knob across the pill; past 85% it locks in
 * and confirms, otherwise it springs back. The label fades as you commit.
 */
export function SwipeToConfirm() {
  const [x, setX] = useState(0);
  const [drag, setDrag] = useState(false);
  const [done, setDone] = useState(false);
  const startX = useRef(0);
  const startPos = useRef(0);

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => setX(clamp(startPos.current + (e.clientX - startX.current), 0, TRAVEL));
    const up = () => {
      setDrag(false);
      setX((cur) => {
        if (cur > TRAVEL * 0.85) { setDone(true); return TRAVEL; }
        return 0;
      });
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [drag]);

  const reset = () => { setDone(false); setX(0); };
  const p = x / TRAVEL;

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className={`relative h-[52px] overflow-hidden rounded-full transition-colors duration-500 ${done ? 'bg-[#2f9e7f]' : 'bg-ink'}`}
        style={{ width: TRACK_W }}
      >
        {/* progress tint */}
        {!done && (
          <div
            className="absolute inset-y-0 left-0 bg-vermilion/90"
            style={{ width: x + KNOB, transition: drag ? 'none' : 'width 0.4s cubic-bezier(0.34,1.3,0.64,1)' }}
          />
        )}

        {/* label */}
        <span
          className="absolute inset-0 flex items-center justify-center font-mono text-[11px] uppercase tracking-[0.2em] text-bone"
          style={{ opacity: done ? 1 : 1 - p * 1.4 }}
        >
          {done ? 'Payment confirmed' : 'Slide to pay $249'}
        </span>

        {/* knob */}
        <div
          onPointerDown={(e) => {
            if (done) return;
            setDrag(true);
            startX.current = e.clientX;
            startPos.current = x;
          }}
          className={`absolute top-1 grid place-items-center rounded-full bg-bone text-ink shadow-elev-2 ${done ? '' : 'cursor-grab touch-none active:cursor-grabbing'}`}
          style={{
            left: PAD,
            height: KNOB,
            width: KNOB,
            transform: `translateX(${x}px) scale(${drag ? 1.05 : 1})`,
            transition: drag ? 'none' : 'transform 0.4s cubic-bezier(0.34,1.3,0.64,1)',
          }}
        >
          {done ? <Check className="h-5 w-5 text-[#2f9e7f]" /> : <ArrowRight className="h-5 w-5" />}
        </div>
      </div>

      <button
        onClick={reset}
        className={`flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50 transition-opacity hover:text-ink ${done ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <RotateCcw className="h-3 w-3" /> Reset
      </button>
    </div>
  );
}
