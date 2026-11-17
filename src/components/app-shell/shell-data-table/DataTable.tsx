// DataTable — rows arrive on a 50ms ladder, and the ladder has a ceiling
import { useMemo, useRef, type ReactNode } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useSizeBand } from '@/lib/useSizeBand';
import { useTableSort, type SortAccessor, type SortState } from '@/lib/shell/useTableSort';
import { ROW_STEP_MS } from '@/lib/shell/tokens';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  /** Any CSS width — a grid track for the compact layout, a th width otherwise. */
  width?: string;
  /** Supply a sort value to make the column sortable. Omit it and it is not. */
  sortValue?: SortAccessor<T>;
  render: (row: T) => ReactNode;
  /** Drop this column first when the table is in a narrow container. */
  secondary?: boolean;
}

export interface DataTableProps<T> {
  rows: readonly T[];
  columns: readonly DataTableColumn<T>[];
  getRowId: (row: T) => string;
  caption?: string;
  initialSort?: SortState<string>;
  onRowActivate?: (row: T) => void;
  /** ms between consecutive rows in the entrance. */
  rowStep?: number;
  /**
   * Rows past this index all share the last delay. Without a ceiling, row 120
   * on a 50ms ladder waits six seconds to appear, which is not a stagger, it is
   * a bug with good intentions.
   */
  maxStaggered?: number;
  empty?: ReactNode;
  className?: string;
}

const SortGlyph = ({ state }: { state: 'ascending' | 'descending' | 'none' }) => (
  <svg
    viewBox="0 0 10 12"
    className={
      'h-3 w-2.5 shrink-0 transition-opacity duration-200 ' +
      (state === 'none' ? 'opacity-0 group-hover/th:opacity-40' : 'opacity-100')
    }
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    aria-hidden
  >
    <path
      d="M5 1.5 2.5 4.5h5L5 1.5Z"
      className={state === 'descending' ? 'opacity-25' : 'opacity-100'}
      fill="currentColor"
      stroke="none"
    />
    <path
      d="M5 10.5 2.5 7.5h5L5 10.5Z"
      className={state === 'ascending' ? 'opacity-25' : 'opacity-100'}
      fill="currentColor"
      stroke="none"
    />
  </svg>
);

/**
 * A table whose entrance is CSS, and whose sort is not.
 *
 * The row ladder is a plain keyframe — `opacity-0 animate-fade-in-up` with an
 * increasing delay — because a list of rows appearing is exactly the case where
 * a JS animation library earns nothing. There is no interruption to handle, no
 * gesture to track, no spring to settle. Handing it to the compositor means a
 * 200-row table costs one style recalc and zero JS during the reveal.
 *
 * One correction worth stating, because it is the usual way this pattern breaks:
 * Tailwind's `delay-*` utilities set `transition-delay`, which has no effect on
 * an `animation`. The ladder needs `animation-delay`, and the value is per-row
 * and computed, so it cannot be a class at all — Tailwind only compiles classes
 * it can see in the source. It is an inline style, and that is the correct
 * answer rather than a compromise.
 *
 * `maxStaggered` caps the ladder. Beyond it every row shares the last delay, so
 * a long table still reads as a cascade at the top without the tail waiting
 * several seconds for its turn.
 *
 * Sorting lives in `useTableSort`, which the table only consumes. Its
 * `generation` counter increments when the visible order actually changes and is
 * used as the tbody's key, so the cascade replays on a sort and stays put on
 * every other re-render.
 *
 * Layout is driven by the table's own box, not the viewport: in a narrow
 * container the same rows render as stacked cards. A table in a 320px sidebar
 * behaves the way it does on a phone, on any viewport.
 */
export function DataTable<T>({
  rows,
  columns,
  getRowId,
  caption,
  initialSort,
  onRowActivate,
  rowStep = ROW_STEP_MS,
  maxStaggered = 12,
  empty = 'Nothing to show.',
  className = '',
}: DataTableProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const band = useSizeBand(ref, { regular: 640, wide: 900 });
  const reduced = useReducedMotion();

  const accessors = useMemo(() => {
    const out: Record<string, SortAccessor<T>> = {};
    for (const col of columns) if (col.sortValue) out[col.key] = col.sortValue;
    return out;
  }, [columns]);

  const { rows: sorted, toggle, ariaSort, generation } = useTableSort<T, string>(
    rows,
    accessors,
    initialSort,
  );

  const visible = band === 'compact' ? columns.filter((c) => !c.secondary) : columns;

  /** Row i's place on the ladder, in ms. Flat under reduced motion. */
  const delayFor = (i: number) => (reduced ? 0 : Math.min(i, maxStaggered) * rowStep);

  if (rows.length === 0) {
    return (
      <div
        ref={ref}
        className={
          'grid place-items-center rounded-[24px] border border-dashed border-gray-200 p-16 text-[13px] text-gray-400 dark:border-white/10 dark:text-gray-500 ' +
          className
        }
      >
        {empty}
      </div>
    );
  }

  if (band === 'compact') {
    return (
      <div ref={ref} className={'space-y-3 ' + className}>
        {caption ? <p className="sr-only">{caption}</p> : null}
        <ul key={generation} className="space-y-3">
          {sorted.map((row, i) => (
            <li
              key={getRowId(row)}
              data-shell-reveal
              style={{ animationDelay: delayFor(i) + 'ms' }}
              className="rounded-[20px] border border-gray-100 bg-white p-4 opacity-0 animate-fade-in-up transition-all duration-400 ease-out hover:-translate-y-[4px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-white/[0.03]"
            >
              <dl className="space-y-2">
                {visible.map((col) => (
                  <div key={col.key} className="flex items-baseline justify-between gap-4">
                    <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-gray-400 dark:text-gray-500">
                      {col.header}
                    </dt>
                    <dd className="min-w-0 text-right text-[13.5px] text-gray-900 dark:text-gray-100">
                      {col.render(row)}
                    </dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={
        'overflow-hidden rounded-[24px] border border-gray-100 bg-white dark:border-white/10 dark:bg-white/[0.03] ' +
        className
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          {caption ? <caption className="sr-only">{caption}</caption> : null}

          <thead>
            <tr className="border-b border-gray-100 dark:border-white/10">
              {visible.map((col) => {
                const sortable = Boolean(col.sortValue);
                const state = sortable ? ariaSort(col.key) : 'none';
                return (
                  <th
                    key={col.key}
                    scope="col"
                    style={col.width ? { width: col.width } : undefined}
                    aria-sort={sortable ? state : undefined}
                    className={
                      'bg-gray-50/60 px-5 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-gray-400 backdrop-blur-xl dark:bg-white/[0.03] dark:text-gray-500 ' +
                      (col.align === 'right' ? 'text-right' : 'text-left')
                    }
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => toggle(col.key)}
                        className={
                          'group/th inline-flex items-center gap-1.5 rounded-[8px] outline-none transition-colors duration-200 hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:text-gray-200 ' +
                          (col.align === 'right' ? 'flex-row-reverse' : '')
                        }
                      >
                        {col.header}
                        <SortGlyph state={state} />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Keyed by generation: the cascade replays when the order changes and
              on nothing else. */}
          <tbody key={generation}>
            {sorted.map((row, i) => (
              <tr
                key={getRowId(row)}
                data-shell-reveal
                style={{ animationDelay: delayFor(i) + 'ms' }}
                onClick={onRowActivate ? () => onRowActivate(row) : undefined}
                tabIndex={onRowActivate ? 0 : undefined}
                onKeyDown={
                  onRowActivate
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowActivate(row);
                        }
                      }
                    : undefined
                }
                className={[
                  'border-b border-gray-50 opacity-0 animate-fade-in-up outline-none last:border-0 dark:border-white/5',
                  'transition-colors duration-200 ease-out',
                  'hover:bg-gray-50/70 dark:hover:bg-white/[0.04]',
                  'focus-visible:bg-gray-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 dark:focus-visible:bg-white/5',
                  onRowActivate ? 'cursor-pointer' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {visible.map((col) => (
                  <td
                    key={col.key}
                    className={
                      'px-5 py-3.5 text-[13.5px] text-gray-700 dark:text-gray-300 ' +
                      (col.align === 'right' ? 'text-right' : 'text-left')
                    }
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
