// ui-96 — SonarBadgeBell
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';

/**
 * Notification bell: each click swings the clapper, fires expanding sonar
 * rings, and pops the badge count up a notch. Click the badge to clear it
 * with a shrink-away poof.
 */
export function SonarBadgeBell() {
  const [n, setN] = useState(3);
  const [seed, setSeed] = useState(0);

  const ring = () => { setSeed((s) => s + 1); setN((c) => c + 1); };

  return (
    <div className="relative">
      <button
        onClick={ring}
        aria-label="Ring the bell"
        className="relative grid h-16 w-16 place-items-center rounded-full border-2 border-ink bg-bone transition-colors hover:bg-ink/5"
      >
        {/* sonar rings */}
        {seed > 0 && (
          <span key={seed} className="pointer-events-none absolute inset-0">
            {[0, 0.14].map((delay) => (
              <motion.span
                key={delay}
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 2.3, opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay }}
                className="absolute inset-0 rounded-full border-2 border-vermilion"
              />
            ))}
          </span>
        )}

        <motion.span
          key={`bell-${seed}`}
          animate={seed > 0 ? { rotate: [0, -22, 18, -12, 7, -3, 0] } : { rotate: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{ transformOrigin: '50% 4px' }}
        >
          <Bell className="h-6 w-6 text-ink" />
        </motion.span>
      </button>

      {/* badge */}
      <AnimatePresence>
        {n > 0 && (
          <motion.button
            key="badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 600, damping: 18 }}
            onClick={(e) => { e.stopPropagation(); setN(0); }}
            aria-label="Clear notifications"
            className="absolute -right-1.5 -top-1.5 grid h-7 min-w-7 place-items-center overflow-hidden rounded-full border-2 border-bone bg-vermilion px-1 font-mono text-[11px] tnum text-bone"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={n}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 600, damping: 34 }}
              >
                {n > 9 ? '9+' : n}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
