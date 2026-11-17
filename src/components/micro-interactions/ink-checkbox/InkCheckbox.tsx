// ui-93 — InkCheckbox
import { useState } from 'react';
import { motion } from 'framer-motion';

const ITEMS = ['Ship the library', 'Record the demo reel', 'Post the changelog'];

/**
 * Checkbox with ink physics: checking floods the box with a springy ink fill
 * while the checkmark draws itself, and a strike-through line crosses the
 * label out. Fully reversible.
 */
export function InkCheckbox() {
  const [done, setDone] = useState<boolean[]>(ITEMS.map(() => false));

  const toggle = (k: number) => setDone((d) => d.map((v, j) => (j === k ? !v : v)));

  return (
    <ul className="w-64 space-y-1">
      {ITEMS.map((label, k) => {
        const checked = done[k];
        return (
          <li key={label}>
            <button onClick={() => toggle(k)} className="group flex w-full items-center gap-4 px-2 py-2.5 text-left" role="checkbox" aria-checked={checked}>
              <span className="relative grid h-6 w-6 shrink-0 place-items-center overflow-hidden border-2 border-ink">
                <motion.span
                  initial={false}
                  animate={{ scale: checked ? 1 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                  className="absolute inset-0 origin-center bg-ink"
                  style={{ borderRadius: checked ? 0 : '50%' }}
                />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ece6d8" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="relative">
                  <motion.path
                    d="M20 6 9 17l-5-5"
                    initial={false}
                    animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
                    transition={{ duration: 0.3, delay: checked ? 0.12 : 0 }}
                  />
                </svg>
              </span>

              <span className="relative font-display text-lg tracking-display">
                <span className={`transition-opacity duration-300 ${checked ? 'opacity-40' : 'opacity-100'}`}>{label}</span>
                <motion.span
                  initial={false}
                  animate={{ scaleX: checked ? 1 : 0 }}
                  transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1], delay: checked ? 0.1 : 0 }}
                  className="absolute left-0 top-1/2 h-[2px] w-full origin-left bg-vermilion"
                />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
