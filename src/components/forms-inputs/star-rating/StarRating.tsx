// ui-103 — StarRating
import { useState } from 'react';

export interface StarRatingProps {
  /** Controlled value. Omit to run uncontrolled from `defaultValue`. */
  value?: number;
  defaultValue?: number;
  /** Number of stars. Default 5. */
  max?: number;
  /** Glyph size in px. Default 24. */
  size?: number;
  /** Display only — no hover or click. */
  readOnly?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

const Star = ({ size, filled }: { size: number; filled: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className="block" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
    <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 18.6 6.1 21.3l1.2-6.6-4.8-4.6 6.6-.9z" />
  </svg>
);

/**
 * Interactive star rating. Hovering previews a value, clicking commits it.
 * Works controlled (`value` + `onChange`) or uncontrolled (`defaultValue`);
 * `readOnly` renders a static score.
 */
export function StarRating({
  value,
  defaultValue = 0,
  max = 5,
  size = 24,
  readOnly = false,
  onChange,
  className = '',
}: StarRatingProps) {
  const [internal, setInternal] = useState(defaultValue);
  const [hover, setHover] = useState(0);
  const current = value ?? internal;
  const shown = hover || current;

  const set = (v: number) => {
    if (readOnly) return;
    if (value === undefined) setInternal(v);
    onChange?.(v);
  };

  return (
    <div className={`inline-flex gap-1 ${className}`} role="radiogroup" aria-label="Rating">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          aria-checked={current === star}
          role="radio"
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          onClick={() => set(star)}
          className={`transition-colors duration-150 ${readOnly ? 'cursor-default' : 'cursor-pointer'} ${
            star <= shown ? 'text-vermilion' : 'text-ink/20'
          }`}
        >
          <Star size={size} filled={star <= shown} />
        </button>
      ))}
    </div>
  );
}
