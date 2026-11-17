// ui-95 — PeelSticker
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SIZE = 112;

/**
 * A vinyl sticker that peels from its top-right corner: hover lifts the flap,
 * click rips it off and sends it fluttering away, leaving a dashed residue you
 * can click to re-stick it.
 */
export function PeelSticker() {
  const [hover, setHover] = useState(false);
  const [off, setOff] = useState(false);

  const peel = off ? 62 : hover ? 34 : 10; // % of the corner folded back

  return (
    <div className="relative" style={{ width: SIZE, height: SIZE }}>
      {/* residue */}
      <button
        onClick={() => setOff(false)}
        className={`absolute inset-0 grid rotate-[-6deg] place-items-center border-2 border-dashed border-ink/30 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40 transition-all hover:border-ink/60 hover:text-ink/70 ${
          off ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        re-stick
      </button>

      <AnimatePresence>
        {!off && (
          <motion.button
            key="sticker"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={() => { setOff(true); setHover(false); }}
            initial={false}
            exit={{ y: -90, x: 48, rotate: 32, opacity: 0, transition: { duration: 0.55, ease: [0.5, 0, 0.75, 0] } }}
            className="absolute inset-0 rotate-[-6deg]"
            style={{ filter: 'drop-shadow(3px 4px 0 rgba(12,11,14,0.35))' }}
          >
            {/* sticker face, corner clipped away as the flap grows */}
            <motion.span
              animate={{
                clipPath: `polygon(0 0, ${100 - peel}% 0, 100% ${peel}%, 100% 100%, 0 100%)`,
              }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="absolute inset-0 grid place-items-center bg-vermilion"
            >
              <span className="font-display text-3xl tracking-display text-bone">NEW</span>
            </motion.span>

            {/* folded-back flap */}
            <motion.span
              animate={{ width: `${peel}%`, height: `${peel}%` }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="absolute right-0 top-0"
              style={{
                clipPath: 'polygon(0 0, 100% 100%, 0 100%)',
                background: 'linear-gradient(225deg, #c9c2b2 0%, #ece6d8 55%, #d8d1c0 100%)',
                boxShadow: '-2px 2px 6px rgba(12,11,14,0.3)',
              }}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
