// ui-54 — TextRoll
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const STAGGER = 0.035;

export interface TextRollProps {
  /** The string to animate. Each character is split and rolled individually. */
  children: string;
  className?: string;
  /** Stagger from the centre out instead of left-to-right. Default false. */
  center?: boolean;
  /** Per-character stagger in seconds. Default 0.035. */
  stagger?: number;
}

/**
 * Two stacked copies of the same word: on hover the top layer rolls up and the
 * bottom layer rolls in from below, each character staggered so the word
 * "flips" letter by letter. Pure Framer Motion variants — no state.
 *
 * Reduced motion is respected automatically by Framer when the OS flag is set.
 */
export function TextRoll({ children, className = '', center = false, stagger = STAGGER }: TextRollProps) {
  const letters = children.split('');
  const delayFor = (i: number) =>
    center ? stagger * Math.abs(i - (letters.length - 1) / 2) : stagger * i;

  const Row = ({ from, to }: { from: string | number; to: string | number }): ReactNode => (
    <>
      {letters.map((l, i) => (
        <motion.span
          key={i}
          variants={{ initial: { y: from }, hovered: { y: to } }}
          transition={{ ease: 'easeInOut', delay: delayFor(i) }}
          className="inline-block"
        >
          {l === ' ' ? ' ' : l}
        </motion.span>
      ))}
    </>
  );

  return (
    <motion.span
      initial="initial"
      whileHover="hovered"
      className={`relative block overflow-hidden ${className}`}
      style={{ lineHeight: 0.85 }}
    >
      <span className="block">
        <Row from={0} to="-100%" />
      </span>
      <span className="absolute inset-0">
        <Row from="100%" to={0} />
      </span>
    </motion.span>
  );
}
