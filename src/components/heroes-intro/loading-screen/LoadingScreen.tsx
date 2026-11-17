// ui-119 — LoadingScreen
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/lib/useReducedMotion';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function Scramble({ text, duration = 1400, delay = 0, active }: { text: string; duration?: number; delay?: number; active: boolean }) {
  const scrambled = () =>
    text
      .split('')
      .map((c) => (c === ' ' || c === '/' || c === '.' ? c : CHARS[Math.floor(Math.random() * CHARS.length)]))
      .join('');
  const [display, setDisplay] = useState(() => (active ? scrambled() : text));

  useEffect(() => {
    if (!active) {
      setDisplay(text);
      return;
    }
    let frame = 0;
    const total = Math.round(duration / 16);
    let id: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      id = setInterval(() => {
        const progress = frame / total;
        setDisplay(
          text
            .split('')
            .map((ch, i) => {
              if (ch === ' ' || ch === '/' || ch === '.') return ch;
              if (i / text.length < progress) return ch;
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join(''),
        );
        frame++;
        if (frame > total) {
          clearInterval(id);
          setDisplay(text);
        }
      }, 16);
    }, delay);
    return () => {
      clearTimeout(timeout);
      clearInterval(id);
    };
  }, [text, duration, delay, active]);

  return <span>{display}</span>;
}

export interface LoadingScreenProps {
  firstName?: string;
  lastName?: string;
  tagline?: string;
  location?: string;
  leftMeta?: string;
  rightMeta?: string;
  /** Time before auto-dismiss, ms. Default 2800. */
  duration?: number;
  /** Absolutely fill the positioned parent instead of the whole viewport. */
  contained?: boolean;
  onComplete?: () => void;
}

/**
 * Full-bleed intro loader: a giant wordmark (sans first name + serif-italic
 * surname) auto-sized to the exact container width, a tagline overhead, and a
 * bottom meta strip whose links scramble into place. Auto-dismisses with a
 * fade after `duration`. Remount (change its key) to replay.
 */
export function LoadingScreen({
  firstName = 'Motion',
  lastName = 'Library',
  tagline = 'A collection of interface motion for teams that decide to move forward.',
  location = 'YEREVAN 09:14 PM',
  leftMeta = 'INSTAGRAM / BEHANCE / LINKEDIN',
  rightMeta = 'HOME  WORK  INFO  CONTACT',
  duration = 2800,
  contained = false,
  onComplete,
}: LoadingScreenProps) {
  const [visible, setVisible] = useState(true);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  // Fit the wordmark to the full container width via binary search.
  useEffect(() => {
    const fit = () => {
      const el = titleRef.current;
      if (!el) return;
      const parentWidth = el.parentElement?.clientWidth ?? window.innerWidth;
      let lo = 1;
      let hi = 500;
      while (hi - lo > 0.5) {
        const mid = (lo + hi) / 2;
        el.style.fontSize = mid + 'px';
        if (el.scrollWidth > parentWidth) hi = mid;
        else lo = mid;
      }
      el.style.fontSize = lo + 'px';
    };
    if ('fonts' in document) (document as unknown as { fonts: { ready: Promise<unknown> } }).fonts.ready.then(fit);
    else fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [firstName, lastName]);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onComplete?.(), 900);
    }, duration);
    return () => clearTimeout(t);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`${contained ? 'absolute' : 'fixed'} inset-0 z-[9999] flex select-none flex-col overflow-hidden bg-ink text-bone`}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.645, 0.045, 0.355, 1] }}
        >
          {/* Tagline */}
          <div className="flex justify-center px-6 pt-8">
            <p className="text-center font-mono text-[11px] uppercase leading-relaxed tracking-[0.15em] text-bone/70">{tagline}</p>
          </div>

          <div className="flex-1" />

          {/* Corner monogram */}
          <div className="flex items-center justify-between px-5 pb-3">
            <span className="font-display text-2xl font-bold tracking-tight">{firstName[0]}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-bone/70 font-serif text-sm italic">
              {lastName[0]}
            </span>
          </div>

          {/* Full-width wordmark */}
          <div className="w-full overflow-hidden leading-none">
            <h1 ref={titleRef} className="m-0 flex whitespace-nowrap p-0" style={{ lineHeight: 0.88 }}>
              <span className="font-display font-bold tracking-tight">{firstName}</span>
              <span className="font-serif italic">{lastName}</span>
            </h1>
          </div>

          {/* Bottom meta strip */}
          <div className="flex items-center justify-between px-5 py-4 font-mono text-[10px] uppercase tracking-[0.12em] text-bone/60">
            <span>{location}</span>
            <span className="hidden sm:inline">
              <Scramble text={leftMeta} delay={100} active={!reduced} />
            </span>
            <span>
              <Scramble text={rightMeta} delay={300} active={!reduced} />
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
