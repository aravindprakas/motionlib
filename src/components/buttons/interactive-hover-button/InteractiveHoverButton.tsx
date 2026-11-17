// InteractiveHoverButton — a dot that swallows the button on hover
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export interface InteractiveHoverButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Label revealed on hover. Defaults to `children`. */
  hoverLabel?: ReactNode;
  /** Trailing glyph on the hover label. Pass null to drop it. Default '→'. */
  icon?: ReactNode;
  /** Which corner the dot grows from. Default 'left'. */
  from?: 'left' | 'right' | 'center';
  /** Transition time in ms. Default 400. */
  duration?: number;
  className?: string;
}

/**
 * A small accent dot sits at one edge; on hover it scales up past the button's
 * own diagonal and floods the surface, while the resting label slides out and
 * the hover label slides in behind it.
 *
 * The flood is a single `scale` on a fixed-size square — one compositor-only
 * property, so it stays on the GPU no matter how large the button gets. Sizing
 * it in `em` means the dot and the flood both track the font size, so the
 * component scales with type instead of needing a size prop.
 *
 * Everything is CSS state driven off `group-hover` / `group-focus-visible`, so
 * there is no JS, no state, and keyboard focus gets the same treatment as the
 * pointer.
 */
export const InteractiveHoverButton = forwardRef<HTMLButtonElement, InteractiveHoverButtonProps>(
  function InteractiveHoverButton(
    {
      children,
      hoverLabel,
      icon = '→',
      from = 'left',
      duration = 400,
      className = '',
      style,
      ...rest
    },
    ref,
  ) {
    const anchor =
      from === 'left'
        ? 'left-[1.15em] top-1/2 -translate-y-1/2'
        : from === 'right'
          ? 'right-[1.15em] top-1/2 -translate-y-1/2'
          : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2';

    const dur = { transitionDuration: `${duration}ms` };

    return (
      <button
        type="button"
        ref={ref}
        className={`group relative isolate inline-flex cursor-pointer items-center justify-center overflow-hidden border border-ink bg-transparent px-[2.4em] py-[1.15em] font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink outline-offset-4 ${className}`}
        style={style}
        {...rest}
      >
        {/* The dot → flood. Fixed 1em square, scaled up past the diagonal. */}
        <span
          aria-hidden
          className={`pointer-events-none absolute z-0 h-[0.6em] w-[0.6em] origin-center bg-accent transition-transform ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none group-hover:scale-[40] group-focus-visible:scale-[40] ${anchor}`}
          style={dur}
        />

        {/* Resting label — slides out of the way. */}
        <span
          className="relative z-10 inline-block transition-all ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none group-hover:translate-x-[140%] group-hover:opacity-0 group-focus-visible:translate-x-[140%] group-focus-visible:opacity-0"
          style={dur}
        >
          {children}
        </span>

        {/* Hover label — waits off-stage, arrives on the flood. */}
        <span
          aria-hidden
          className="absolute inset-0 z-10 flex -translate-x-[140%] items-center justify-center gap-[0.6em] whitespace-nowrap text-ink opacity-0 transition-all ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
          style={dur}
        >
          {hoverLabel ?? children}
          {icon != null && (
            <span className="translate-x-0 transition-transform duration-300 group-hover:translate-x-[0.25em]">
              {icon}
            </span>
          )}
        </span>
      </button>
    );
  },
);
