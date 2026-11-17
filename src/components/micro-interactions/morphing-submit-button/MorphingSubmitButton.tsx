// ui-83 — MorphingSubmitButton
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Phase = 'idle' | 'loading' | 'success';

/**
 * Submit button that morphs through its lifecycle: pill → compact spinner →
 * wide success state with a self-drawing check, then back. Width changes are
 * handled by a layout spring, content crossfades.
 */
export function MorphingSubmitButton({ label = 'Submit order' }: { label?: string }) {
  const [phase, setPhase] = useState<Phase>('idle');
  const timers = useRef<number[]>([]);

  const submit = () => {
    if (phase !== 'idle') return;
    setPhase('loading');
    timers.current.push(window.setTimeout(() => setPhase('success'), 1400));
    timers.current.push(window.setTimeout(() => setPhase('idle'), 3100));
  };

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return (
    <motion.button
      layout
      onClick={submit}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`flex h-12 items-center justify-center overflow-hidden rounded-full px-6 font-mono text-[11px] uppercase tracking-[0.2em] text-bone ${
        phase === 'success' ? 'bg-[#2f9e7f]' : 'bg-ink'
      } ${phase === 'loading' ? 'w-12 px-0' : ''}`}
      style={{ transitionProperty: 'background-color', transitionDuration: '300ms' }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {phase === 'idle' && (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
        {phase === 'loading' && (
          <motion.span
            key="loading"
            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
            className="block h-5 w-5 animate-spin rounded-full border-2 border-bone/30 border-t-bone"
          />
        )}
        {phase === 'success' && (
          <motion.span
            key="success"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <motion.path d="M20 6 9 17l-5-5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.1 }} />
            </svg>
            Order placed
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
