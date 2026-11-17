// CondenseBuyBar — the buy box folds into a hairline instead of duplicating
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface CondenseBuyBarProps {
  name: string;
  price: string;
  meta?: string;
  cta?: string;
  onAdd?: () => void;
  /** The full-size buy box. Watched; when it leaves, the bar arrives. */
  children: ReactNode;
  className?: string;
}

/**
 * The primary buy box is watched by an observer; the moment it leaves the
 * viewport a hairline bar takes its place, carrying the same name, price and
 * action in condensed form. Scroll back and the bar retracts.
 *
 * Most sticky add-to-cart bars are a second, permanently-mounted control that
 * competes with the real one — two buttons claiming to be the same button.
 * Tying arrival strictly to the disappearance of the original means there is
 * only ever one live call to action on screen, and the bar reads as the buy box
 * folded up rather than as a duplicate of it.
 *
 * A `rootMargin` on the top edge only fires once the box is genuinely gone, not
 * when it is a pixel out. The bar animates `transform`, never `height`, so it
 * cannot reflow the page it is sliding over.
 */
export function CondenseBuyBar({
  name,
  price,
  meta,
  cta = 'Add to cart',
  onAdd,
  children,
  className = '',
}: CondenseBuyBarProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [folded, setFolded] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const io = new IntersectionObserver(
      ([e]) => setFolded(!e.isIntersecting && e.boundingClientRect.top < 0),
      { threshold: 0, rootMargin: '-8px 0px 0px 0px' },
    );
    io.observe(box);
    return () => io.disconnect();
  }, []);

  return (
    <div className={className}>
      <div ref={boxRef}>{children}</div>

      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-ink bg-bone"
        aria-hidden={!folded}
        style={{
          transform: folded ? 'translateY(0)' : 'translateY(101%)',
          transition: reduced ? undefined : 'transform 320ms cubic-bezier(0.65,0,0.35,1)',
        }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-3">
          <div className="min-w-0">
            <p className="truncate font-mono text-[11px] uppercase tracking-[0.16em]">{name}</p>
            {meta && <p className="truncate text-[11px] text-ink/50">{meta}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-5">
            <p className="font-mono text-sm tabular-nums">{price}</p>
            <button
              type="button"
              tabIndex={folded ? 0 : -1}
              onClick={onAdd}
              className="cursor-pointer bg-accent px-6 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-ink"
            >
              {cta}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
