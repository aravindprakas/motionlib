// ui-86 — SquishToggle
import { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Physics switch: the knob squashes while pressed, then springs across the
 * track with visible overshoot; the track color follows a beat behind.
 */
export function SquishToggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);

  return (
    <button
      onClick={() => setOn((v) => !v)}
      aria-pressed={on}
      className={`relative h-10 w-[72px] rounded-full border-2 border-ink p-1 transition-colors duration-300 ${on ? 'bg-vermilion' : 'bg-ink/5'}`}
    >
      <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-[9px] uppercase tracking-widest transition-opacity duration-200 ${on ? 'text-bone opacity-100' : 'opacity-0'}`}>
        on
      </span>
      <span className={`absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[9px] uppercase tracking-widest text-ink/50 transition-opacity duration-200 ${on ? 'opacity-0' : 'opacity-100'}`}>
        off
      </span>
      <motion.span
        animate={{ x: on ? 32 : 0 }}
        whileTap={{ scaleX: 1.25, scaleY: 0.75 }}
        transition={{ type: 'spring', stiffness: 520, damping: 20 }}
        className={`block h-7 w-7 rounded-full border-2 border-ink transition-colors duration-300 ${on ? 'bg-bone' : 'bg-ink'}`}
      />
    </button>
  );
}
