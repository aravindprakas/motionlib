// HeroSection — one spring, one stagger, eight elements arriving as one gesture
import { type ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { spring, STAGGER, fadeUp } from '@/lib/shell/tokens';

export interface HeroStat {
  label: string;
  value: string;
}

export interface HeroSectionProps {
  eyebrow?: string;
  /** Split on whitespace when `wordStagger` is on, so keep it a plain string. */
  headline: string;
  subhead?: string;
  /** Call-to-action row. Usually a pair of PrimaryButtons. */
  actions?: ReactNode;
  stats?: readonly HeroStat[];
  /** Anything visual on the right at `lg` and up — a card, a mock, a chart. */
  media?: ReactNode;
  /** Stagger the headline word by word inside the section's own stagger. */
  wordStagger?: boolean;
  className?: string;
}

const container: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: STAGGER, delayChildren: 0.08 } },
};

const item: Variants = {
  hidden: fadeUp.hidden,
  shown: { ...fadeUp.shown, transition: spring.reveal },
};

// Words move a shorter distance on a tighter stagger — at 24px and 80ms a
// headline reads as a list of words rather than as a sentence arriving.
const word: Variants = {
  hidden: { opacity: 0, y: 14 },
  shown: { opacity: 1, y: 0, transition: spring.reveal },
};

const headlineGroup: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.035 } },
};

/**
 * The set's entrance, stated once.
 *
 * Every element here runs the same spring — stiffness 100, damping 20 — and the
 * only thing that differs between them is when they start. That is what makes
 * eight independently animating elements read as one gesture instead of eight
 * things happening near each other. Damping 20 against stiffness 100 is just
 * past critical, so nothing visibly overshoots at these distances; the settle is
 * around 600ms, slow enough that a 5-step stagger still finishes as a unit.
 *
 * The stagger is declared once on the container and inherited. Nothing here
 * holds a delay of its own, so re-ordering the section or dropping the stats row
 * cannot leave a hole in the rhythm — the thing that makes hand-tuned
 * `delay: 0.1 * i` reveals so brittle to edit.
 *
 * `wordStagger` nests a second, tighter stagger inside the first. Words are
 * wrapped in `inline-block` spans with the space carried by the wrapper, so the
 * headline still wraps naturally and still copies as one line of text.
 *
 * Everything animated is opacity and translate — no filters, no height, no
 * layout — so the whole reveal is composited. Under `prefers-reduced-motion` the
 * variants are skipped entirely rather than shortened: the section renders in
 * its final state on the first frame.
 */
export function HeroSection({
  eyebrow,
  headline,
  subhead,
  actions,
  stats,
  media,
  wordStagger = true,
  className = '',
}: HeroSectionProps) {
  const reduced = useReducedMotion();
  const words = headline.split(/\s+/).filter(Boolean);

  return (
    <motion.section
      initial={reduced ? false : 'hidden'}
      animate="shown"
      variants={container}
      className={
        'relative isolate flex min-h-[85vh] w-full items-center overflow-hidden px-5 py-24 md:px-8 ' +
        className
      }
    >
      {/* Ambient ground. Blurred, static, and behind everything — it never
          animates, so it never costs a frame. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-[999px] bg-indigo-500/10 blur-3xl dark:bg-indigo-500/15" />
        <div className="absolute -right-32 top-1/3 h-[420px] w-[420px] rounded-[999px] bg-fuchsia-500/10 blur-3xl dark:bg-fuchsia-500/15" />
      </div>

      <div className="mx-auto grid w-full max-w-7xl items-center gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
        <div className="max-w-2xl">
          {eyebrow ? (
            <motion.p
              variants={item}
              className="mb-6 inline-flex items-center gap-2 rounded-[999px] border border-gray-200 bg-white/70 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-gray-500 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-gray-400"
            >
              <span className="h-1.5 w-1.5 rounded-[999px] bg-indigo-500" />
              {eyebrow}
            </motion.p>
          ) : null}

          {wordStagger && !reduced ? (
            <motion.h1
              variants={headlineGroup}
              className="text-[clamp(2.4rem,6vw,4.5rem)] font-semibold leading-[1.03] tracking-[-0.04em] text-gray-900 dark:text-white"
            >
              {words.map((w, i) => (
                <motion.span key={w + i} variants={word} className="inline-block will-change-transform">
                  {w}
                  {i < words.length - 1 ? ' ' : ''}
                </motion.span>
              ))}
            </motion.h1>
          ) : (
            <motion.h1
              variants={item}
              className="text-[clamp(2.4rem,6vw,4.5rem)] font-semibold leading-[1.03] tracking-[-0.04em] text-gray-900 dark:text-white"
            >
              {headline}
            </motion.h1>
          )}

          {subhead ? (
            <motion.p
              variants={item}
              className="mt-6 max-w-xl text-[17px] leading-relaxed text-gray-500 dark:text-gray-400"
            >
              {subhead}
            </motion.p>
          ) : null}

          {actions ? (
            <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-3">
              {actions}
            </motion.div>
          ) : null}

          {stats && stats.length > 0 ? (
            <motion.dl
              variants={item}
              className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-gray-100 pt-8 dark:border-white/10"
            >
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-gray-400 dark:text-gray-500">
                    {stat.label}
                  </dt>
                  <dd className="tnum mt-1.5 text-[26px] font-semibold tracking-[-0.03em] text-gray-900 dark:text-white">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </motion.dl>
          ) : null}
        </div>

        {media ? (
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 32, scale: 0.97 },
              shown: { opacity: 1, y: 0, scale: 1, transition: spring.reveal },
            }}
            className="hidden lg:block"
          >
            {media}
          </motion.div>
        ) : null}
      </div>
    </motion.section>
  );
}
