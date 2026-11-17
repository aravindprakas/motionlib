// ui-76 — BentoGrid
import type { ReactNode } from 'react';

export interface BentoCell {
  key: string;
  content: ReactNode;
  /** Extra classes for span/colour, e.g. 'col-span-2 row-span-2 bg-ink text-paper'. */
  span?: string;
}

export interface BentoGridProps {
  cells: BentoCell[];
  className?: string;
}

/**
 * Bento grid with hand-placed spans and a transform-only hover lift;
 * reflows to 2 columns under 640px.
 *
 * Fix vs. the Store original: cells are a prop instead of hardcoded.
 */
export function BentoGrid({ cells, className = '' }: BentoGridProps) {
  return (
    <div
      className={`grid grid-flow-dense grid-cols-4 auto-rows-[minmax(110px,auto)] gap-2 max-[640px]:grid-cols-2 ${className}`}
    >
      {cells.map((cell) => (
        <div
          key={cell.key}
          className={`flex flex-col justify-between border border-ink/15 p-3 transition-transform duration-[400ms] ease-[cubic-bezier(.22,1,.36,1)] will-change-transform hover:-translate-y-1.5 motion-reduce:hover:translate-y-0 ${cell.span ?? ''}`}
        >
          {cell.content}
        </div>
      ))}
    </div>
  );
}
