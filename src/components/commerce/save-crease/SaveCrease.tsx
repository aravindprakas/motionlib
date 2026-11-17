// SaveCrease — saving leaves a mark on the thing itself
import { useState, type ReactNode } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface SaveCreaseProps {
  children: ReactNode;
  saved?: boolean;
  onToggle?: (saved: boolean) => void;
  /** Fold size in px. Default 30. */
  fold?: number;
  label?: string;
  className?: string;
}

/**
 * Saving a product does not light up a heart — it turns the corner of the card
 * down, the way you'd dog-ear a page. The fold stays folded.
 *
 * A wishlist icon is a control that happens to sit on a card; a dog-ear is a
 * property of the card. Scanning a grid afterwards, the shopper picks out their
 * saved items by silhouette in peripheral vision, without reading a single
 * icon — which is the actual job of a saved state, and one a heart in the
 * corner has never done well.
 *
 * Both the card's cut corner and the folded flap are `clip-path` polygons with
 * a matching point count, so the fold interpolates properly instead of popping.
 * No extra layer, no shadow, no repaint of the card content.
 */
export function SaveCrease({
  children,
  saved: controlled,
  onToggle,
  fold = 30,
  label = 'Save',
  className = '',
}: SaveCreaseProps) {
  const [internal, setInternal] = useState(false);
  const saved = controlled ?? internal;
  const reduced = useReducedMotion();
  const f = saved ? fold : 0;

  const toggle = () => {
    if (controlled === undefined) setInternal(!saved);
    onToggle?.(!saved);
  };

  const ease = reduced ? undefined : 'clip-path 320ms cubic-bezier(0.65,0,0.35,1)';

  return (
    <div className={`relative ${className}`}>
      <div
        className="relative border border-ink bg-bone"
        style={{
          clipPath: `polygon(0 0, calc(100% - ${f}px) 0, 100% ${f}px, 100% 100%, 0 100%)`,
          transition: ease,
        }}
      >
        {children}
      </div>

      {/* The flap: the paper that got turned down. */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 bg-accent"
        style={{
          width: fold,
          height: fold,
          clipPath: `polygon(100% 0, 100% ${f}px, ${fold - f}px ${f}px)`,
          transition: ease,
        }}
      />

      <button
        type="button"
        aria-pressed={saved}
        onClick={toggle}
        className="mt-2 cursor-pointer font-mono text-[10px] uppercase tracking-[0.2em] text-ink/55 underline underline-offset-4 hover:text-ink"
      >
        {saved ? 'Saved' : label}
      </button>
    </div>
  );
}
