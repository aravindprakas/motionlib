// PrimaryButton — a gradient that sweeps on hover and a press that answers instantly
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface PrimaryButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Swaps the label for a spinner and blocks the click. Keeps its width. */
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

const SIZE: Record<ButtonSize, string> = {
  sm: 'h-9 gap-1.5 px-3.5 text-[13px]',
  md: 'h-11 gap-2 px-5 text-sm',
  lg: 'h-[52px] gap-2.5 px-7 text-[15px]',
};

/**
 * The sweep layer per variant. `bg-[length:200%_auto]` doubles the gradient's
 * width so `bg-left → bg-right` has somewhere to travel; a 100%-wide gradient
 * would have no slack and the hover would do nothing.
 */
const SWEEP: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-indigo-600',
  secondary: 'bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white',
  ghost: 'bg-gradient-to-r from-transparent via-gray-100 to-transparent dark:via-white/10',
  danger: 'bg-gradient-to-r from-rose-600 via-orange-500 to-rose-600',
};

const SURFACE: Record<ButtonVariant, string> = {
  primary: 'text-white shadow-[0_1px_2px_rgba(16,16,24,0.16),0_8px_24px_-8px_rgba(79,70,229,0.5)]',
  secondary: 'text-white dark:text-gray-900 shadow-[0_1px_2px_rgba(16,16,24,0.14)]',
  ghost: 'text-gray-700 dark:text-gray-200 ring-1 ring-inset ring-gray-200 dark:ring-white/12',
  danger: 'text-white shadow-[0_1px_2px_rgba(16,16,24,0.16),0_8px_24px_-8px_rgba(225,29,72,0.5)]',
};

/**
 * A button whose two motions run on two clocks, because they answer two
 * different things.
 *
 * The gradient sweep is *ambience*: 500ms of background-position travel across a
 * doubled gradient, slow enough to read as a material catching the light. The
 * press is *feedback*: 120ms to 0.95 and back, because anything slower than
 * about 150ms stops feeling like the button responded to you and starts feeling
 * like it is thinking about it. Tailwind cannot give one element two transition
 * durations, so the sweep lives on its own absolutely-positioned layer inside
 * the button and the scale stays on the button itself. That split is the whole
 * trick, and it is why this feels quicker than a single-element version with
 * identical timings.
 *
 * Both animated properties are compositor-friendly — background-position on an
 * isolated layer and a transform — so a row of these hovering under a moving
 * pointer costs paint on one small layer, not layout on the row.
 *
 * `loading` keeps the label mounted at `opacity-0` rather than replacing it, so
 * the button does not resize under the pointer mid-click — the most reliable way
 * to make someone miss the target they were already committed to.
 */
export const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  function PrimaryButton(
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      iconLeft,
      iconRight,
      fullWidth = false,
      className = '',
      disabled,
      type = 'button',
      ...rest
    },
    ref,
  ) {
    const inert = disabled || loading;

    return (
      <button
        {...rest}
        ref={ref}
        type={type}
        disabled={inert}
        aria-busy={loading || undefined}
        className={[
          'group relative isolate inline-flex items-center justify-center overflow-hidden',
          'rounded-[14px] font-medium tracking-[-0.01em] outline-none',
          'transition-[transform,box-shadow,opacity] duration-150 ease-out',
          'active:scale-95 active:duration-75',
          'focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
          'focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0b0b0d]',
          'disabled:pointer-events-none disabled:opacity-50',
          'motion-reduce:transition-none motion-reduce:active:scale-100',
          SIZE[size],
          SURFACE[variant],
          fullWidth ? 'w-full' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* The sweep. Its own layer so it can run at 500ms while the press runs
            at 150ms, and so `overflow-hidden` clips it rather than the label. */}
        <span
          aria-hidden
          className={[
            'absolute inset-0 -z-10 bg-left bg-no-repeat bg-[length:200%_auto]',
            'transition-[background-position] duration-500 ease-out',
            'group-hover:bg-right group-focus-visible:bg-right',
            'motion-reduce:transition-none',
            SWEEP[variant],
          ].join(' ')}
        />

        {iconLeft ? (
          <span
            aria-hidden
            className="shrink-0 transition-transform duration-300 ease-out group-hover:-translate-x-0.5 motion-reduce:transition-none"
          >
            {iconLeft}
          </span>
        ) : null}

        <span className={loading ? 'opacity-0' : 'opacity-100'}>{children}</span>

        {iconRight ? (
          <span
            aria-hidden
            className="shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none"
          >
            {iconRight}
          </span>
        ) : null}

        {loading ? (
          <span className="absolute inset-0 grid place-items-center">
            <svg viewBox="0 0 16 16" className="h-4 w-4 animate-spin" aria-hidden>
              <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
              <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="sr-only">Loading</span>
          </span>
        ) : null}
      </button>
    );
  },
);
