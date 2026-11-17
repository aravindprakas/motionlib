// ui-82 — HoldToConfirmButton
import { useEffect, useRef, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { Check, Trash2 } from 'lucide-react';

const HOLD_MS = 1100;

export interface HoldToConfirmButtonProps {
  label?: string;
  doneLabel?: string;
  onConfirm?: () => void;
}

/**
 * Destructive action that must be held down: a vermilion fill charges across
 * the pill while pressed; releasing early shakes it back to zero, holding to
 * the end commits with a check.
 */
export function HoldToConfirmButton({ label = 'Hold to delete', doneLabel = 'Deleted', onConfirm }: HoldToConfirmButtonProps) {
  const [p, setP] = useState(0);
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const raf = useRef(0);
  const startT = useRef(0);
  const controls = useAnimationControls();

  const finish = () => {
    cancelAnimationFrame(raf.current);
    setHolding(false);
    setP(1);
    setDone(true);
    onConfirm?.();
    setTimeout(() => { setDone(false); setP(0); }, 1700);
  };

  const begin = () => {
    if (done) return;
    setHolding(true);
    startT.current = performance.now();
    const tick = (t: number) => {
      const np = Math.min((t - startT.current) / HOLD_MS, 1);
      setP(np);
      if (np >= 1) { finish(); return; }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  const cancel = () => {
    if (done || !holding) return;
    cancelAnimationFrame(raf.current);
    setHolding(false);
    if (p > 0.06) controls.start({ x: [0, -6, 6, -4, 4, -2, 0], transition: { duration: 0.4 } });
    setP(0);
  };

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <motion.button
      animate={controls}
      onPointerDown={begin}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      className={`relative h-12 w-52 select-none overflow-hidden rounded-full border-2 border-ink font-mono text-[11px] uppercase tracking-[0.2em] transition-transform ${holding ? 'scale-[0.97]' : ''}`}
      style={{ touchAction: 'none' }}
    >
      {/* base label */}
      <span className="absolute inset-0 flex items-center justify-center gap-2 text-ink">
        <Trash2 className="h-4 w-4" /> {label}
      </span>
      {/* charging fill + inverted label, clipped by progress */}
      <span
        className="absolute inset-0 overflow-hidden bg-vermilion"
        style={{
          clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
          transition: holding ? 'none' : 'clip-path 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        <span className="absolute inset-0 flex w-52 items-center justify-center gap-2 text-bone">
          {done ? <><Check className="h-4 w-4" /> {doneLabel}</> : <><Trash2 className="h-4 w-4" /> {label}</>}
        </span>
      </span>
    </motion.button>
  );
}
