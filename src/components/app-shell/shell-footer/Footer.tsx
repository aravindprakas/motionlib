// Footer — 300px of close, with a line drawing that starts when you get there
import { useRef, type ReactNode } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useInViewOnce } from '@/lib/shell/useInViewOnce';

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  id: string;
  heading: string;
  links: readonly FooterLink[];
}

export interface FooterProps {
  brand: ReactNode;
  blurb?: string;
  columns: readonly FooterColumn[];
  /** Bottom bar — copyright, legal, locale switcher. */
  meta?: ReactNode;
  /** Draw the signature mark when the footer scrolls into view. */
  signature?: boolean;
  className?: string;
}

/** Each stroke of the mark, with its place in the drawing order. */
const STROKES: readonly { d: string; delay: number; duration: number }[] = [
  { d: 'M12 44 L12 8 L44 8', delay: 0, duration: 0.7 },
  { d: 'M20 44 L20 16 L52 16', delay: 0.12, duration: 0.7 },
  { d: 'M28 44 L28 24 L60 24', delay: 0.24, duration: 0.7 },
  { d: 'M68 8 L68 44 L100 44', delay: 0.36, duration: 0.7 },
  { d: 'M76 16 L76 44', delay: 0.48, duration: 0.45 },
  { d: 'M84 24 L84 44', delay: 0.56, duration: 0.45 },
];

/**
 * The one place in the set that animates a paint property, and the reason it is
 * allowed.
 *
 * A line drawing is `stroke-dashoffset` — dash the path to its own length, push
 * the dashes off the end, then transition the offset back to zero and the stroke
 * appears to be drawn. That is a paint, not a composite, so it is not free. It
 * is fine here for reasons that do not generalise: six short paths inside a
 * 110x52 box, running once, at the bottom of the page, where nothing else is
 * moving. The same technique across a full-viewport illustration would be a
 * frame-rate problem, and the library's other exceptions (clip-path, font-weight,
 * border-radius) are documented on the same terms.
 *
 * `pathLength="1"` is what keeps it maintainable: the browser normalises every
 * path to a length of 1 regardless of its real geometry, so the dash array is
 * literally `1` and editing a path never means re-measuring it in JS. The stagger
 * is per-stroke `transition-delay`, so the whole drawing is declarative.
 *
 * It starts on intersection, not on mount. A footer animation that has already
 * finished by the time anyone scrolls to it is an animation nobody sees, and one
 * that replays every time it re-enters is a page that will not settle — so the
 * observer is one-shot and disconnects after it fires.
 *
 * `min-h-[300px]` with `pt-16` is deliberate weight. A footer that hugs its
 * content makes the page feel like it ran out rather than ended.
 */
export function Footer({
  brand,
  blurb,
  columns,
  meta,
  signature = true,
  className = '',
}: FooterProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const seen = useInViewOnce(ref, { amount: 0.15, disabled: reduced });
  const drawn = reduced || seen;

  return (
    <footer
      ref={ref}
      className={[
        'relative min-h-[300px] w-full overflow-hidden border-t border-gray-100 pt-16',
        'bg-white dark:border-white/10 dark:bg-[#0b0b0d]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-14 px-5 pb-10 md:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)]">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.02em] text-gray-900 dark:text-white">
              {brand}
            </div>
            {blurb ? (
              <p className="mt-4 text-[13.5px] leading-relaxed text-gray-500 dark:text-gray-400">
                {blurb}
              </p>
            ) : null}

            {signature ? (
              <svg
                viewBox="0 0 110 52"
                className="mt-9 h-[52px] w-[110px] text-gray-300 dark:text-white/20"
                fill="none"
                aria-hidden
              >
                {STROKES.map((stroke) => (
                  <path
                    key={stroke.d}
                    d={stroke.d}
                    pathLength="1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      strokeDasharray: 1,
                      strokeDashoffset: drawn ? 0 : 1,
                      transition: reduced
                        ? 'none'
                        : 'stroke-dashoffset ' +
                          stroke.duration +
                          's cubic-bezier(0.22, 1, 0.36, 1) ' +
                          stroke.delay +
                          's',
                    }}
                  />
                ))}
              </svg>
            ) : null}
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:justify-items-end"
          >
            {columns.map((column, ci) => (
              <div key={column.id} className="min-w-0">
                <h2 className="text-[11px] font-medium uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
                  {column.heading}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link, li) => (
                    <li
                      key={link.href + link.label}
                      data-shell-reveal
                      style={
                        drawn && !reduced
                          ? { animationDelay: 120 + ci * 60 + li * 50 + 'ms' }
                          : undefined
                      }
                      className={drawn && !reduced ? 'opacity-0 animate-fade-in-up' : ''}
                    >
                      <a
                        href={link.href}
                        className="group inline-flex items-center gap-1.5 text-[13.5px] text-gray-500 outline-none transition-colors duration-200 ease-out hover:text-gray-900 focus-visible:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                      >
                        <span className="relative">
                          {link.label}
                          {/* Underline drawn from the left on hover — a scaleX
                              on a 1px rule, so it composites. */}
                          <span
                            aria-hidden
                            className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none"
                          />
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {meta ? (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-7 text-[12.5px] text-gray-400 dark:border-white/10 dark:text-gray-500">
            {meta}
          </div>
        ) : null}
      </div>
    </footer>
  );
}
