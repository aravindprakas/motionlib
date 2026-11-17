// ui-80 — CategoryRow
export interface CategoryRowProps {
  no: string;
  label: string;
  countText: string;
  onClick?: () => void;
}

/**
 * Full-width index row (number / label / count / arrow) that slides right and
 * turns accent-colored on hover.
 *
 * Fix vs. the Store original: the hover slide animated `padding-left` (a
 * layout property, reflows every frame) — replaced with a `translate-x`
 * transform, which composites.
 */
export function CategoryRow({ no, label, countText, onClick }: CategoryRowProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-[clamp(14px,3vw,40px)] border-t border-ink/15 py-[clamp(18px,2.4vw,30px)] text-left transition-[transform,color] duration-300 ease-out will-change-transform hover:translate-x-[18px] hover:text-accent motion-reduce:hover:translate-x-0"
    >
      <span className="w-[34px] font-mono text-xs tracking-[0.1em] text-ink/50">{no}</span>
      <span className="flex-1 font-serif text-[clamp(34px,5.5vw,72px)] leading-none tracking-[-0.01em]">
        {label}
      </span>
      <span className="font-mono text-[11px] tracking-[0.1em] text-ink/50">{countText}</span>
      <span className="font-mono text-lg" aria-hidden>
        →
      </span>
    </button>
  );
}
