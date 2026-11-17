// ui-84 — ShredDeleteButton
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Trash2 } from 'lucide-react';

const SLATS = 7;
const DROPS = [34, 52, 41, 60, 38, 55, 46];
const TILTS = [-10, 6, -4, 12, -8, 5, -12];

type Phase = 'idle' | 'shredding' | 'gone';

/**
 * Delete button that shreds itself: on click the pill splits into vertical
 * slats that drop and scatter, leaving an undo chip behind.
 */
export function ShredDeleteButton() {
  const [phase, setPhase] = useState<Phase>('idle');

  const shred = () => {
    setPhase('shredding');
    setTimeout(() => setPhase('gone'), 750);
  };

  const face = (
    <span className="flex h-12 w-44 items-center justify-center gap-2 rounded-none border-2 border-ink bg-vermilion font-mono text-[11px] uppercase tracking-[0.2em] text-bone">
      <Trash2 className="h-4 w-4" /> Delete file
    </span>
  );

  return (
    <div className="relative h-12 w-44">
      {phase === 'idle' && (
        <button onClick={shred} className="absolute inset-0 transition-transform hover:-translate-y-0.5 active:translate-y-0">
          {face}
        </button>
      )}

      {phase === 'shredding' &&
        Array.from({ length: SLATS }, (_, k) => (
          <motion.span
            key={k}
            initial={{ y: 0, rotate: 0, opacity: 1 }}
            animate={{ y: DROPS[k], rotate: TILTS[k], opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.5, 0, 0.75, 0], delay: k * 0.045 }}
            className="absolute inset-0"
            style={{ clipPath: `inset(0 ${100 - ((k + 1) * 100) / SLATS}% 0 ${(k * 100) / SLATS}%)` }}
          >
            {face}
          </motion.span>
        ))}

      <AnimatePresence>
        {phase === 'gone' && (
          <motion.button
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            onClick={() => setPhase('idle')}
            className="absolute inset-0 flex items-center justify-center gap-2 border border-dashed border-ink/40 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/60 transition-colors hover:border-ink hover:text-ink"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Shredded — undo
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
