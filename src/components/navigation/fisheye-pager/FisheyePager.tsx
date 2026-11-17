// FisheyePager — the whole range and the neighbourhood, on one rail
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useSizeBand } from '@/lib/useSizeBand';

export interface FisheyePagerProps {
  count: number;
  page?: number;
  defaultPage?: number;
  onChange?: (page: number) => void;
  /** Optional label for a page — a date, a letter, a section. Shown sparsely. */
  stamp?: (page: number) => string;
  /** Rendered under the rail for the focused page. */
  preview?: (page: number) => ReactNode;
  /** Ceiling on rendered cells. The rail never costs more than this. */
  maxCells?: number;
  className?: string;
}

/** Lens weight: 1 at the focus, falling off smoothly with distance. */
const lens = (d: number, spread: number) => 1 / (1 + (d / spread) ** 2);

interface Cell {
  from: number;
  to: number;
}

/**
 * Build the rail: every page near the focus, then geometrically coarser
 * buckets outward. A million pages resolve to a couple of hundred cells.
 */
function sample(count: number, focus: number, radius: number, maxCells: number): Cell[] {
  const near: Cell[] = [];
  const lo = Math.max(1, focus - radius);
  const hi = Math.min(count, focus + radius);
  for (let p = lo; p <= hi; p++) near.push({ from: p, to: p });

  const out: Cell[] = [];
  let step = 2;
  let cursor = lo - 1;
  const left: Cell[] = [];
  while (cursor >= 1 && left.length + near.length < maxCells) {
    const from = Math.max(1, cursor - step + 1);
    left.push({ from, to: cursor });
    cursor = from - 1;
    step = Math.min(step * 2, 1 << 20);
  }
  out.push(...left.reverse(), ...near);

  step = 2;
  cursor = hi + 1;
  while (cursor <= count && out.length < maxCells) {
    const to = Math.min(count, cursor + step - 1);
    out.push({ from: cursor, to });
    cursor = to + 1;
    step = Math.min(step * 2, 1 << 20);
  }
  return out;
}

/**
 * Pagination for ranges that do not fit on a bar.
 *
 * The `‹ 1 … 7 8 [9] 10 11 … 940 ›` pattern gives you two facts — where you are
 * and where the ends are — and hides everything else behind an ellipsis that
 * costs a round trip to cross. For an archive, a search result set, or a log,
 * the shape of the range is information: how far in you are, how much is left,
 * where the dense months sit. So this draws the entire range at once and puts a
 * lens over it. Pages near the focus get real width and real numbers; distant
 * ones compress into hairline buckets that still occupy their honest share of
 * the bar. You always see the whole thing, and you can always read where you
 * are.
 *
 * The rail is sampled rather than rendered: every page inside the lens radius,
 * then geometrically widening buckets outward, hard-capped by `maxCells`. Ten
 * thousand pages and ten million cost the same hundred-odd elements. Widths are
 * flex-grow weights, so the browser distributes them in one pass and the lens
 * glide is a transition on a single number per cell — with the pager's own box
 * fixed, that layout work is contained and nothing on the page around it moves.
 *
 * The lens radius is derived from the component's own width, so the bar thins
 * to three legible pages in a sidebar and opens to fifteen full width without a
 * breakpoint anywhere. Dragging the rail scrubs, with the gear rising as you
 * pull away from it vertically — 1×, 10×, then 100× — so crossing nine thousand
 * pages by thumb is one gesture. Arrows step, Page keys jump ten, Home and End
 * go to the ends. Reduced motion drops the glide and keeps the lens.
 */
export function FisheyePager({
  count,
  page,
  defaultPage = 1,
  onChange,
  stamp,
  preview,
  maxCells = 140,
  className = '',
}: FisheyePagerProps) {
  const root = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const band = useSizeBand(root, { regular: 460, wide: 780 });
  const reduced = useReducedMotion();

  const controlled = page !== undefined;
  const [inner, setInner] = useState(Math.min(Math.max(defaultPage, 1), count));
  const current = Math.min(Math.max(controlled ? page : inner, 1), count);

  const changeRef = useRef(onChange);
  changeRef.current = onChange;
  const currentRef = useRef(current);
  currentRef.current = current;

  const [gear, setGear] = useState(1);

  const go = useCallback(
    (p: number) => {
      const next = Math.min(Math.max(Math.round(p), 1), count);
      if (next === currentRef.current) return;
      currentRef.current = next;
      if (!controlled) setInner(next);
      changeRef.current?.(next);
    },
    [controlled, count],
  );

  /** How many pages the lens can show at full size, from our own width. */
  const radius = band === 'compact' ? 2 : band === 'regular' ? 5 : 8;
  const spread = Math.max(2, radius * 1.4);

  const cells = useMemo(
    () => sample(count, current, radius, maxCells),
    [count, current, radius, maxCells],
  );

  // ── drag to scrub, with the gear rising as you pull away ───────────────────
  useEffect(() => {
    const el = rail.current;
    if (!el) return;

    let dragging = false;
    let pointerId = -1;
    let originX = 0;
    let originY = 0;
    let originPage = 1;

    const gearFor = (dy: number) => (dy < 40 ? 1 : dy < 110 ? 10 : 100);

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      pointerId = e.pointerId;
      originX = e.clientX;
      originY = e.clientY;
      originPage = currentRef.current;
      el.setPointerCapture(pointerId);
      el.dataset.scrubbing = 'true';
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pointerId) return;
      const g = gearFor(Math.abs(e.clientY - originY));
      setGear((prev) => (prev === g ? prev : g));
      go(originPage + ((e.clientX - originX) / 8) * g);
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pointerId) return;
      dragging = false;
      setGear(1);
      if (el.hasPointerCapture(pointerId)) el.releasePointerCapture(pointerId);
      delete el.dataset.scrubbing;
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
    };
  }, [go]);

  const onKey = (e: React.KeyboardEvent) => {
    const jump: Record<string, number> = {
      ArrowRight: current + 1,
      ArrowLeft: current - 1,
      PageUp: current + 10,
      PageDown: current - 10,
      Home: 1,
      End: count,
    };
    if (jump[e.key] === undefined) return;
    e.preventDefault();
    go(jump[e.key]);
  };

  return (
    <nav ref={root} aria-label="Pagination" className={'select-none ' + className}>
      <div className="mb-2 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.22em]">
        <span>
          page <span className="text-vermilion">{current.toLocaleString()}</span> of{' '}
          {count.toLocaleString()}
        </span>
        <span className="opacity-55">
          {gear > 1 ? gear + '× scrub' : cells.length + ' cells · drag the rail'}
        </span>
      </div>

      <div
        ref={rail}
        tabIndex={0}
        onKeyDown={onKey}
        className="group flex h-11 w-full cursor-ew-resize touch-none items-stretch gap-px border border-ink bg-bone outline-none focus-visible:ring-1 focus-visible:ring-vermilion"
      >
        {cells.map((c) => {
          const single = c.from === c.to;
          const mid = (c.from + c.to) / 2;
          const w = lens(mid - current, spread);
          const on = single && c.from === current;
          return (
            <button
              key={c.from + '-' + c.to}
              type="button"
              aria-label={single ? 'Page ' + c.from : 'Pages ' + c.from + ' to ' + c.to}
              aria-current={on ? 'page' : undefined}
              onClick={() => go(mid)}
              data-on={on}
              className="relative flex min-w-[2px] items-center justify-center overflow-hidden bg-ink/[0.03] font-mono text-[11px] tabular-nums outline-none transition-colors hover:bg-ink/10 focus-visible:bg-ink/10 data-[on=true]:bg-ink data-[on=true]:text-bone"
              style={{
                flexGrow: single ? w * 6 + 0.6 : w * 2 + 0.12,
                flexBasis: 0,
                transition: reduced
                  ? undefined
                  : 'flex-grow 260ms cubic-bezier(0.22,1,0.36,1), background-color 160ms',
              }}
            >
              {single ? (
                c.from
              ) : (
                <span aria-hidden className="h-3 w-px bg-ink/35" />
              )}
              {/* Sparse stamps: only where a cell is one page and near the lens. */}
              {stamp && single && Math.abs(c.from - current) <= 1 && (
                <span className="pointer-events-none absolute -bottom-0.5 text-[8px] uppercase tracking-[0.1em] opacity-50">
                  {stamp(c.from)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => go(current - 1)}
          disabled={current <= 1}
          className="border border-ink px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] disabled:opacity-30 enabled:hover:bg-ink enabled:hover:text-bone"
        >
          ← prev
        </button>

        {preview && (
          <div className="min-w-0 flex-1 truncate text-center font-serif text-sm italic opacity-75">
            {preview(current)}
          </div>
        )}

        <button
          type="button"
          onClick={() => go(current + 1)}
          disabled={current >= count}
          className="border border-ink px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] disabled:opacity-30 enabled:hover:bg-ink enabled:hover:text-bone"
        >
          next →
        </button>
      </div>
    </nav>
  );
}
