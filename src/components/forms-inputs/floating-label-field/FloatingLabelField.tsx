import { useId, type InputHTMLAttributes } from 'react';

export interface FloatingLabelFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

/**
 * Text input whose label floats up on focus / when filled — pure CSS via
 * `peer-placeholder-shown` + `peer-focus`, no JS state.
 *
 * Fix vs. the Store original: the v4-only `peer-[&:not(:placeholder-shown)]`
 * arbitrary variant is replaced with the inverse `peer-placeholder-shown`
 * pattern, which Tailwind v3 supports natively (float is the base state,
 * resting is the exception).
 */
export function FloatingLabelField({ label, className = '', id, ...props }: FloatingLabelFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className={`relative ${className}`}>
      <input
        id={inputId}
        placeholder=" "
        className="peer w-full border-0 border-b border-ink/15 bg-transparent px-0 py-3 font-sans text-base text-ink outline-none focus:border-accent"
        {...props}
      />
      <label
        htmlFor={inputId}
        className="pointer-events-none absolute left-0 top-3 origin-left -translate-y-5 scale-[0.78] font-mono text-sm text-accent transition-transform duration-200 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-ink/50 peer-focus:-translate-y-5 peer-focus:scale-[0.78] peer-focus:text-accent"
      >
        {label}
      </label>
    </div>
  );
}
