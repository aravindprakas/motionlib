// ui-85 — ReactionButton
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

const COLORS = ['#ff4d23', '#e8a23d', '#2f9e7f', '#7b6cf6', '#e8639c', '#ff4d23', '#e8a23d', '#7b6cf6'];

/**
 * Like button with a particle burst on ignition and a rolling counter —
 * the old number exits upward as the new one rolls in from below.
 */
export function ReactionButton() {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(128);
  const [burst, setBurst] = useState(0);

  const toggle = () => {
    if (!liked) setBurst((b) => b + 1);
    setCount((c) => c + (liked ? -1 : 1));
    setLiked((v) => !v);
  };

  return (
    <button
      onClick={toggle}
      className="group flex items-center gap-3 rounded-full border-2 border-ink px-5 py-2.5 transition-colors hover:bg-ink/5"
      aria-pressed={liked}
    >
      <span className="relative grid place-items-center">
        <motion.span
          key={String(liked)}
          initial={{ scale: liked ? 0.4 : 1 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 600, damping: 12 }}
          className={liked ? 'text-vermilion' : 'text-ink'}
        >
          <Heart className={`h-5 w-5 transition-colors ${liked ? 'fill-current' : ''}`} />
        </motion.span>

        {/* particle burst */}
        {burst > 0 && (
          <span key={burst} className="pointer-events-none absolute inset-0">
            {COLORS.map((c, k) => {
              const a = (k / COLORS.length) * Math.PI * 2;
              return (
                <motion.span
                  key={k}
                  initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                  animate={{ x: Math.cos(a) * 26, y: Math.sin(a) * 26, scale: 0, opacity: 0 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                  className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ background: c }}
                />
              );
            })}
          </span>
        )}
      </span>

      <span className="relative h-5 w-8 overflow-hidden font-mono text-sm tnum">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={count}
            initial={{ y: liked ? 14 : -14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: liked ? -14 : 14, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {count}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  );
}
