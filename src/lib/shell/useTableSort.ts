import { useCallback, useMemo, useState } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortState<K extends string> {
  key: K | null;
  direction: SortDirection;
}

export interface UseTableSortResult<T, K extends string> {
  rows: T[];
  sort: SortState<K>;
  /** Cycles asc → desc → unsorted for the same column; asc for a new one. */
  toggle: (key: K) => void;
  /** For `aria-sort` on the header cell. */
  ariaSort: (key: K) => 'ascending' | 'descending' | 'none';
  /**
   * Changes whenever the visible order changes. Use it as the `key` of the row
   * container to re-run the staggered entrance on sort, and only on sort.
   */
  generation: number;
}

export type SortAccessor<T> = (row: T) => string | number | boolean | null | undefined;

/** Numbers numerically, everything else by locale, nulls last in both. */
function compare(a: ReturnType<SortAccessor<unknown>>, b: ReturnType<SortAccessor<unknown>>): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * Sorting as data, kept out of the table that renders it.
 *
 * The table component's job is rows and columns; deciding what order they are
 * in is a separate concern with its own edge cases — mixed types, nulls,
 * numeric strings, and the three-state cycle real users expect (ascending,
 * descending, back to the order the server sent). Pulling it out here means the
 * table stays a pure function of `rows`, and the same sort can drive a card list
 * or a chart without a table in sight.
 *
 * `generation` is the piece that couples cleanly to motion: it increments only
 * when the visible order actually changed, so the row stagger replays on a sort
 * and stays put on a re-render that happened for some other reason.
 *
 * The sort is stable — `Array.prototype.sort` is required to be, since ES2019 —
 * so rows that tie keep their previous relative order instead of shuffling.
 */
export function useTableSort<T, K extends string>(
  rows: readonly T[],
  accessors: Record<K, SortAccessor<T>>,
  initial: SortState<K> = { key: null, direction: 'asc' },
): UseTableSortResult<T, K> {
  const [sort, setSort] = useState<SortState<K>>(initial);
  const [generation, setGeneration] = useState(0);

  const toggle = useCallback((key: K) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return { key: null, direction: 'asc' };
    });
    setGeneration((g) => g + 1);
  }, []);

  const sorted = useMemo(() => {
    if (!sort.key) return [...rows];
    const get = accessors[sort.key];
    const sign = sort.direction === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => sign * compare(get(a), get(b)));
  }, [rows, sort.key, sort.direction, accessors]);

  const ariaSort = useCallback(
    (key: K): 'ascending' | 'descending' | 'none' =>
      sort.key !== key ? 'none' : sort.direction === 'asc' ? 'ascending' : 'descending',
    [sort],
  );

  return { rows: sorted, sort, toggle, ariaSort, generation };
}
