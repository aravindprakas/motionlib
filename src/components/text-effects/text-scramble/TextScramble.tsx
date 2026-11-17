// ui-52 — TextScramble
import { useCallback, useEffect, useRef, type ElementType } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface TextScrambleProps {
  text: string;
  /** When to run. Default 'view' (once, on first viewport entry). */
  trigger?: 'view' | 'hover';
  /** Speed multiplier — 2 resolves twice as fast. Default 1. */
  speed?: number;
  /** Glyph pool for the scramble phase. */
  chars?: string;
  as?: ElementType;
  className?: string;
}

interface QueueItem {
  to: string;
  start: number; // frame the char starts scrambling
  end: number; // frame it resolves
  glyph: string; // current random glyph, re-rolled sparsely
}

const DEFAULT_CHARS = '!<>-_\\/[]{}—=+*^?#________';

/**
 * Cycles each character through random glyphs before resolving left-to-right.
 * Own rAF implementation (no paid SplitText/ScrambleText).
 *
 * Allocation note: the queue is built once per run and mutated in place; each
 * frame only re-rolls glyphs for unresolved chars (~1 in 3 frames) and joins
 * the output — no per-frame object churn.
 */
export function TextScramble({
  text,
  trigger = 'view',
  speed = 1,
  chars = DEFAULT_CHARS,
  as: Tag = 'span',
  className = '',
}: TextScrambleProps) {
  const El = Tag as 'span';
  const ref = useRef<HTMLSpanElement>(null);
  const frameRef = useRef(0);
  const rafRef = useRef(0);
  const queueRef = useRef<QueueItem[]>([]);
  const playedRef = useRef(false);
  const reduced = useReducedMotion();

  const stop = () => cancelAnimationFrame(rafRef.current);

  const run = useCallback(() => {
    const el = ref.current;
    if (!el || reduced) return;
    stop();

    // Stagger: char i starts at ~i*1.2 frames and scrambles for 12–36 frames,
    // divided by `speed`, so the resolve sweeps left to right.
    const queue: QueueItem[] = queueRef.current;
    queue.length = 0;
    for (let i = 0; i < text.length; i++) {
      const start = Math.floor((i * 1.2) / speed);
      const end = start + Math.floor((12 + Math.random() * 24) / speed);
      queue.push({ to: text[i], start, end, glyph: '' });
    }

    frameRef.current = 0;
    const update = () => {
      const frame = frameRef.current++;
      let out = '';
      let complete = 0;
      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];
        if (frame >= item.end) {
          complete++;
          out += item.to;
        } else if (frame >= item.start) {
          // Re-roll the glyph roughly every 3rd frame so it flickers,
          // not strobes.
          if (!item.glyph || Math.random() < 0.35) {
            item.glyph = chars[Math.floor(Math.random() * chars.length)];
          }
          out += item.glyph;
        } else {
          out += ' ';
        }
      }
      el.textContent = out;
      if (complete < queue.length) {
        rafRef.current = requestAnimationFrame(update);
      }
    };
    rafRef.current = requestAnimationFrame(update);
  }, [text, speed, chars, reduced]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      el.textContent = text;
      return;
    }
    el.textContent = trigger === 'view' ? ' ' : text;
    playedRef.current = false;

    if (trigger === 'view') {
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !playedRef.current) {
            playedRef.current = true;
            run();
            io.disconnect();
          }
        },
        { threshold: 0.4 },
      );
      io.observe(el);
      return () => {
        io.disconnect();
        stop();
      };
    }
    return stop;
  }, [text, trigger, reduced, run]);

  return (
    <El
      ref={ref}
      aria-label={text}
      onPointerEnter={trigger === 'hover' && !reduced ? () => run() : undefined}
      className={`inline-block whitespace-pre-wrap ${className}`}
    />
  );
}
