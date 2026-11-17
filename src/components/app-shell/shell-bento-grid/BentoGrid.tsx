// BentoGrid — a 4x3 wall that reveals in reading order, then gets out of the way
import { useRef, type ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useInViewOnce } from '@/lib/shell/useInViewOnce';
import { spring, STAGGER, fadeUp } from '@/lib/shell/tokens';

export type ColSpan = 1 | 2 | 3 | 4;
export type RowSpan = 1 | 2 | 3;

export interface BentoGridProps {
  children: ReactNode;
  /** Reveal the cells on scroll rather than on mount. */
  revealOnView?: boolean;
  /** Seconds before the first cell moves. */
  delay?: number;
  className?: string;
}

export interface BentoCellProps {
  children: ReactNode;
  /** Columns occupied at `md` and up. One column below that, always. */
  colSpan?: ColSpan;
  /** Rows occupied at `md` and up. */
  rowSpan?: RowSpan;
  className?: string;
}

// Tailwind reads class strings statically, so the spans have to be spelled out.
// A template literal here would compile to nothing at all.
const COL: Record<ColSpan, string> = {
  1: 'md:col-span-1',
  2: 'md:col-span-2',
  3: 'md:col-span-3',
  4: 'md:col-span-4',
};

// Module scope: one allocation for the lifetime of the module rather than one
// per render, and a stable identity for framer to compare against.
const containerVariants: Variants = {
  hidden: {},
  // A dynamic variant, resolved against `custom`, so the delay stays a prop
  // without the variants object being rebuilt in the render body.
  shown: (delay: number) => ({
    transition: { staggerChildren: STAGGER, delayChildren: delay },
  }),
};

const cellVariants: Variants = {
  hidden: fadeUp.hidden,
  shown: { ...fadeUp.shown, transition: spring.reveal },
};

const ROW: Record<RowSpan, string> = {
  1: 'md:row-span-1',
  2: 'md:row-span-2',
  3: 'md:row-span-3',
};

/**
 * The grid is only a grid. Everything else is the cell's business.
 *
 * `grid-cols-1 md:grid-cols-4 md:grid-rows-3` with a 24px gutter, and a single
 * responsive rule: below `md` the wall unstacks into one column and the row
 * spans stop applying, because a 2x3 cell in a 375px viewport is a 2x3 cell in a
 * 375px viewport. Explicit `md:grid-rows-3` is what makes the tall cells
 * possible — with implicit rows, a `row-span-2` cell defines its own track and
 * the wall stops lining up.
 *
 * The reveal is one variant tree, not twenty timers. The container owns
 * `staggerChildren`, so adding a cell changes nothing and removing one leaves no
 * gap in the rhythm; the cells only declare where they start and end. Each is
 * opacity plus a 24px translate on the same 100/20 spring the rest of the set
 * uses, which is what makes a hero and a bento wall on the same page read as one
 * page rather than two libraries.
 *
 * `revealOnView` swaps the mount trigger for a one-shot IntersectionObserver
 * rooted on the ambient scroller. It latches — scrolling back up does not replay
 * it, because a wall that re-animates every time you pass it is a wall that will
 * not sit still.
 */
export function BentoGrid({
  children,
  revealOnView = true,
  delay = 0,
  className = '',
}: BentoGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const seen = useInViewOnce(ref, { amount: 0.1, disabled: !revealOnView || reduced });

  const active = reduced || !revealOnView || seen;

  return (
    <motion.div
      ref={ref}
      custom={delay}
      initial={reduced ? false : 'hidden'}
      animate={active ? 'shown' : 'hidden'}
      variants={containerVariants}
      className={
        'grid grid-cols-1 gap-6 p-8 md:grid-cols-4 md:grid-rows-3 ' + className
      }
    >
      {children}
    </motion.div>
  );
}

/**
 * A positioned slot in the wall. Holds no visual style of its own — the card
 * inside it is `h-full w-full`, so swapping a DataCard for a chart or a map does
 * not touch the layout.
 */
export function BentoCell({ children, colSpan = 1, rowSpan = 1, className = '' }: BentoCellProps) {
  return (
    <motion.div
      variants={cellVariants}
      className={['min-w-0', COL[colSpan], ROW[rowSpan], className].filter(Boolean).join(' ')}
    >
      {children}
    </motion.div>
  );
}
