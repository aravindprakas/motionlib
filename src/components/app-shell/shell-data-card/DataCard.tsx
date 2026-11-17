// DataCard — the set's one card unit: 4px of lift, 40px of shadow, 400ms
import { useCallback, useRef, type PointerEvent, type ReactNode } from 'react';

export type CardTone = 'neutral' | 'accent' | 'positive' | 'critical';
export type TrendDirection = 'up' | 'down' | 'flat';

export interface CardTrend {
  direction: TrendDirection;
  /** Pre-formatted, e.g. "+12.4%". The card never does arithmetic. */
  label: string;
  /** Optional sparkline. Values in any range — normalised on render. */
  series?: readonly number[];
}

export interface DataCardProps {
  /** Small uppercase eyebrow above the title. */
  eyebrow?: string;
  title: string;
  /** The headline figure. Set in tabular numerals so it cannot jitter. */
  value?: string;
  description?: string;
  trend?: CardTrend;
  icon?: ReactNode;
  footer?: ReactNode;
  /** Free-form body, rendered under the value. */
  children?: ReactNode;
  tone?: CardTone;
  /**
   * Makes the whole card one activatable target with real button semantics.
   * Without it the card is a plain region and stays out of the tab ring — a
   * hover lift is not a reason to make something focusable.
   */
  onActivate?: () => void;
  /** Pointer-tracked highlight. Written as CSS vars, never as React state. */
  spotlight?: boolean;
  className?: string;
}

const TONE: Record<CardTone, { ring: string; icon: string }> = {
  neutral: {
    ring: 'group-hover:border-gray-200 dark:group-hover:border-white/20',
    icon: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300',
  },
  accent: {
    ring: 'group-hover:border-indigo-200 dark:group-hover:border-indigo-400/30',
    icon: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300',
  },
  positive: {
    ring: 'group-hover:border-emerald-200 dark:group-hover:border-emerald-400/30',
    icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  critical: {
    ring: 'group-hover:border-rose-200 dark:group-hover:border-rose-400/30',
    icon: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
  },
};

const TREND_STYLE: Record<TrendDirection, string> = {
  up: 'text-emerald-600 dark:text-emerald-400',
  down: 'text-rose-600 dark:text-rose-400',
  flat: 'text-gray-500 dark:text-gray-400',
};

const TREND_GLYPH: Record<TrendDirection, string> = {
  up: 'M2 8l4-4 4 4',
  down: 'M2 4l4 4 4-4',
  flat: 'M2 6h8',
};

/** Normalise a series into a 100 x 32 polyline. Cheap, and pure. */
function sparkPath(series: readonly number[]): string {
  if (series.length < 2) return '';
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  return series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * 100;
      const y = 30 - ((v - min) / span) * 28;
      return (i === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2);
    })
    .join(' ');
}

/**
 * One card, used everywhere, with exactly one hover gesture.
 *
 * Four pixels of lift and a 40px shadow at 8% is a deliberately small move. A
 * bento wall is a dozen of these at once; anything more assertive and the grid
 * ripples every time the pointer crosses it. 400ms is the other half of that
 * judgement — 300ms reads twitchy under a move this short, 500ms reads like the
 * card is thinking about it.
 *
 * The lift is a transform and the shadow is a shadow, so a hover costs a
 * composite and a paint on one layer. Nothing here animates a box-model
 * property, which is why a grid of twenty-four holds frame rate while the
 * pointer sweeps across all of them.
 *
 * The optional spotlight tracks the pointer through two CSS custom properties
 * written straight to the node inside a rAF. It never touches React state — a
 * card that re-rendered on pointermove would cost more than every other
 * animation in the set put together.
 *
 * Semantics follow behaviour, not looks: with `onActivate` the card renders as a
 * real `<button>` and joins the tab ring; without it, it is a `<div>`. A card
 * that lifts on hover but does nothing when clicked should not be focusable.
 */
export function DataCard({
  eyebrow,
  title,
  value,
  description,
  trend,
  icon,
  footer,
  children,
  tone = 'neutral',
  onActivate,
  spotlight = false,
  className = '',
}: DataCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const styles = TONE[tone];

  const onPointerMove = useCallback((e: PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', ((clientX - r.left) / r.width) * 100 + '%');
      el.style.setProperty('--my', ((clientY - r.top) / r.height) * 100 + '%');
    });
  }, []);

  const onPointerLeave = useCallback(() => cancelAnimationFrame(frame.current), []);

  // One element, two semantics. The cast keeps a single JSX tree instead of
  // duplicating the whole body under an if.
  const Tag = (onActivate ? 'button' : 'div') as 'div';

  return (
    <Tag
      ref={ref}
      {...(onActivate ? { type: 'button' as const, onClick: onActivate } : {})}
      onPointerMove={spotlight ? onPointerMove : undefined}
      onPointerLeave={spotlight ? onPointerLeave : undefined}
      className={[
        'group relative isolate flex h-full w-full flex-col overflow-hidden p-6 text-left',
        'rounded-[24px] border border-gray-100 bg-white dark:border-white/10 dark:bg-white/[0.03]',
        'transition-all duration-400 ease-out',
        'hover:-translate-y-[4px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]',
        'dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]',
        onActivate
          ? 'cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0b0b0d]'
          : '',
        'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        styles.ring,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {spotlight ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-400 ease-out group-hover:opacity-100 motion-reduce:hidden"
          style={{
            background:
              'radial-gradient(320px circle at var(--mx, 50%) var(--my, 0%), rgb(99 102 241 / 0.12), transparent 65%)',
          }}
        />
      ) : null}

      {eyebrow || icon ? (
        <div className="mb-5 flex items-center justify-between gap-3">
          {eyebrow ? (
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
              {eyebrow}
            </span>
          ) : (
            <span />
          )}
          {icon ? (
            <span
              className={
                'grid h-9 w-9 shrink-0 place-items-center rounded-[12px] transition-transform duration-400 ease-out group-hover:scale-105 motion-reduce:transition-none ' +
                styles.icon
              }
            >
              {icon}
            </span>
          ) : null}
        </div>
      ) : null}

      <h3 className="text-[13px] font-medium text-gray-500 dark:text-gray-400">{title}</h3>

      {value ? (
        <p className="tnum mt-2 text-[32px] font-semibold leading-none tracking-[-0.035em] text-gray-900 dark:text-white">
          {value}
        </p>
      ) : null}

      {trend ? (
        <div className="mt-3 flex items-center gap-2.5">
          <span
            className={'inline-flex items-center gap-1 text-[13px] font-medium ' + TREND_STYLE[trend.direction]}
          >
            <svg
              viewBox="0 0 12 12"
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden
            >
              <path d={TREND_GLYPH[trend.direction]} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {trend.label}
          </span>
          {trend.series && trend.series.length > 1 ? (
            <svg
              viewBox="0 0 100 32"
              preserveAspectRatio="none"
              className="h-6 flex-1 overflow-visible"
              aria-hidden
            >
              <path
                d={sparkPath(trend.series)}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                className={
                  TREND_STYLE[trend.direction] +
                  ' opacity-45 transition-opacity duration-400 ease-out group-hover:opacity-100'
                }
              />
            </svg>
          ) : null}
        </div>
      ) : null}

      {description ? (
        <p className="mt-3 text-[13px] leading-relaxed text-gray-500 dark:text-gray-400">
          {description}
        </p>
      ) : null}

      {children ? <div className="mt-4 min-h-0 flex-1">{children}</div> : null}

      {footer ? (
        <div className="mt-auto pt-5 text-[12px] text-gray-400 dark:text-gray-500">{footer}</div>
      ) : null}
    </Tag>
  );
}
