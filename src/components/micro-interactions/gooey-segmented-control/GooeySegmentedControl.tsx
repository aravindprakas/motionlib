// ui-94 — GooeySegmentedControl
import { useState } from 'react';
import { motion } from 'framer-motion';

const OPTIONS = ['Day', 'Week', 'Month'];
const SEG_W = 96;

/**
 * Segmented control whose selection blob is liquid: a fast leader and a lazy
 * follower are fused through an SVG goo filter, so the pill stretches and
 * snaps like mercury when it travels between segments.
 */
export function GooeySegmentedControl() {
  const [i, setI] = useState(0);
  const x = i * SEG_W;

  return (
    <div className="relative" style={{ width: SEG_W * OPTIONS.length }}>
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="mi-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -11" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="relative rounded-full border-2 border-ink p-1">
        {/* goo layer */}
        <div className="absolute inset-1" style={{ filter: 'url(#mi-goo)' }}>
          <motion.span
            animate={{ x }}
            transition={{ type: 'spring', stiffness: 550, damping: 32 }}
            className="absolute top-0 h-full rounded-full bg-ink"
            style={{ width: SEG_W - 12, left: 4 }}
          />
          <motion.span
            animate={{ x }}
            transition={{ type: 'spring', stiffness: 160, damping: 18 }}
            className="absolute top-0 h-full rounded-full bg-ink"
            style={{ width: SEG_W - 12, left: 4 }}
          />
        </div>

        <div className="relative flex">
          {OPTIONS.map((o, k) => (
            <button
              key={o}
              onClick={() => setI(k)}
              className={`h-9 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors duration-300 ${k === i ? 'text-bone' : 'text-ink/60 hover:text-ink'}`}
              style={{ width: SEG_W - 8 / OPTIONS.length }}
            >
              {o}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
