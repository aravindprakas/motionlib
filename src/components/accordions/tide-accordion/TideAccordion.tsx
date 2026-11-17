// TideAccordion — a fixed budget of space that panels take from each other
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface TideItem {
  id: string;
  label: string;
  meta?: string;
  content: ReactNode;
}

export interface TideAccordionProps {
  items: TideItem[];
  defaultOpen?: string[];
  /** How many panels may hold space at once. Opening past it evicts the oldest. */
  maxOpen?: number;
  /** The budget. The component is exactly this tall, always. */
  height?: number | string;
  /** Collapsed header height. Every closed panel costs exactly this. */
  headerHeight?: number;
  /** Body px needed before the budget is workable; under it, fall back to flow. */
  minBody?: number;
  onOpenChange?: (open: string[]) => void;
  className?: string;
}

/**
 * An accordion that cannot move anything below it.
 *
 * The ordinary accordion is a layout-shift machine: opening a panel pushes
 * every subsequent element down, the page jumps under the reader's cursor, and
 * on a long FAQ the answer you just opened can leave the viewport entirely
 * while it animates. The usual fixes — scroll-into-view after the transition,
 * height caps, opening only one at a time — treat the symptom.
 *
 * This treats the cause by giving the group a fixed budget of space. The
 * component's own box never changes size; opening a panel *takes* room from the
 * others rather than asking the document for more, so the tide comes in here
 * and goes out there and nothing outside the component ever reflows. Because
 * the outer box is fixed, the redistribution can be contained: layout cost is
 * bounded to the accordion itself, and collapsed bodies are skipped by the
 * browser through `content-visibility` rather than merely being invisible.
 *
 * Time is the tie-breaker. `maxOpen` panels may hold space at once, and opening
 * one past the limit evicts the panel you opened longest ago rather than a
 * fixed one. Every panel also accumulates the seconds you actually spend in it
 * and carries that as a rule under its header — a reading history that survives
 * closing, written straight to a custom property by one interval that only runs
 * while something is open.
 *
 * A budget only works if there is a budget. The component measures its own box,
 * and when the space left after the headers falls below `minBody` — a short
 * viewport, a phone, a cramped column — it switches to ordinary flow layout
 * with a grid-rows collapse, because a scroll is better than a sliver.
 * Full disclosure semantics, roving arrow keys, Home/End, and an instant
 * fallback under reduced motion.
 */
export function TideAccordion({
  items,
  defaultOpen = [],
  maxOpen = 1,
  height = 'min(70vh, 34rem)',
  headerHeight = 54,
  minBody = 132,
  onOpenChange,
  className = '',
}: TideAccordionProps) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const [open, setOpen] = useState<string[]>(() => defaultOpen.slice(0, Math.max(1, maxOpen)));
  const [tide, setTide] = useState(true);
  const changeRef = useRef(onOpenChange);
  changeRef.current = onOpenChange;

  const openSet = useMemo(() => new Set(open), [open]);

  /** Accumulated seconds per panel. A ref, because it changes 4×/s. */
  const read = useRef<Record<string, number>>({});
  const since = useRef<Record<string, number>>({});

  // ── does the budget still buy anything? ────────────────────────────────────
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const check = () => {
      const budget = el.clientHeight - items.length * headerHeight;
      setTide((prev) => {
        const next = budget >= minBody;
        return prev === next ? prev : next;
      });
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items.length, headerHeight, minBody]);

  // ── dwell: one interval, only while a panel holds space ────────────────────
  useEffect(() => {
    if (!open.length) return;
    const now = () => performance.now();
    for (const id of open) if (since.current[id] === undefined) since.current[id] = now();

    const tick = () => {
      const el = root.current;
      if (!el) return;
      for (const id of open) {
        const total = (read.current[id] ?? 0) + (now() - (since.current[id] ?? now())) / 1000;
        el.querySelector<HTMLElement>('[data-read="' + id + '"]')?.style.setProperty(
          '--read',
          Math.min(1, total / 45).toFixed(3),
        );
      }
    };
    tick();
    const timer = window.setInterval(tick, 250);
    return () => {
      window.clearInterval(timer);
      for (const id of open) {
        read.current[id] = (read.current[id] ?? 0) + (now() - (since.current[id] ?? now())) / 1000;
        delete since.current[id];
      }
    };
  }, [open]);

  const toggle = useCallback(
    (id: string) => {
      setOpen((prev) => {
        let next: string[];
        if (prev.includes(id)) next = prev.filter((x) => x !== id);
        else {
          next = [...prev, id];
          // Evict by age of opening, not by position in the list.
          while (next.length > Math.max(1, maxOpen)) next.shift();
        }
        changeRef.current?.(next);
        return next;
      });
    },
    [maxOpen],
  );

  const focusHeader = (i: number) => {
    const clamped = (i + items.length) % items.length;
    root.current
      ?.querySelector<HTMLElement>('[data-head="' + clamped + '"]')
      ?.focus();
  };

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const jump: Record<string, number> = {
      ArrowDown: i + 1,
      ArrowUp: i - 1,
      Home: 0,
      End: items.length - 1,
    };
    if (jump[e.key] === undefined) return;
    e.preventDefault();
    focusHeader(jump[e.key]);
  };

  const ease = reduced ? '0ms' : '420ms';

  return (
    <div
      ref={root}
      className={'flex flex-col overflow-hidden border border-ink bg-bone ' + className}
      style={{
        height: tide ? height : undefined,
        // The budget is fixed, so the cost of redistributing it stays inside.
        contain: tide ? 'layout paint' : undefined,
      }}
    >
      {items.map((item, i) => {
        const isOpen = openSet.has(item.id);
        return (
          <section
            key={item.id}
            className="flex min-h-0 flex-col border-b border-ink/20 last:border-b-0"
            style={
              tide
                ? {
                    flexGrow: isOpen ? 1 : 0,
                    flexShrink: 0,
                    flexBasis: headerHeight + 'px',
                    transition: 'flex-grow ' + ease + ' cubic-bezier(0.22, 1, 0.36, 1)',
                  }
                : undefined
            }
          >
            <h3 className="shrink-0">
              <button
                type="button"
                id={item.id + "-head"}
                data-head={i}
                data-read={item.id}
                aria-expanded={isOpen}
                aria-controls={item.id + '-body'}
                onClick={() => toggle(item.id)}
                onKeyDown={(e) => onKey(e, i)}
                className="group relative flex w-full items-center gap-4 px-5 text-left outline-none transition-colors duration-200 hover:bg-ink/[0.04] focus-visible:bg-ink/[0.06]"
                style={{ height: headerHeight }}
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-vermilion">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1 truncate font-display text-sm font-bold uppercase tracking-tight">
                  {item.label}
                </span>
                {item.meta && (
                  <span className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] opacity-50 sm:block">
                    {item.meta}
                  </span>
                )}
                {/* Disclosure: one rule that loses its cross. */}
                <span aria-hidden className="relative h-3 w-3 shrink-0">
                  <span className="absolute top-1/2 h-px w-full bg-ink" />
                  <span
                    className="absolute left-1/2 h-full w-px bg-ink transition-transform"
                    style={{
                      transform: isOpen ? 'scaleY(0)' : 'scaleY(1)',
                      transitionDuration: reduced ? '0ms' : '260ms',
                    }}
                  />
                </span>
                {/* Reading history — how long this panel has actually held you. */}
                <span
                  aria-hidden
                  className="absolute bottom-0 left-0 h-px bg-vermilion/70"
                  style={{ width: 'calc(var(--read, 0) * 100%)' }}
                />
              </button>
            </h3>

            <div
              id={item.id + '-body'}
              role="region"
              aria-labelledby={item.id + "-head"}
              hidden={!tide && !isOpen}
              className={
                tide
                  ? 'min-h-0 flex-1 overflow-y-auto overscroll-contain px-5'
                  : 'grid px-5 transition-[grid-template-rows]'
              }
              style={
                tide
                  ? {
                      opacity: isOpen ? 1 : 0,
                      transition: 'opacity ' + ease + ' ease',
                      // Collapsed bodies are skipped by the browser, not just hidden.
                      contentVisibility: isOpen ? 'visible' : 'auto',
                      containIntrinsicSize: '0 400px',
                    }
                  : {
                      gridTemplateRows: isOpen ? '1fr' : '0fr',
                      transitionDuration: reduced ? '0ms' : '360ms',
                    }
              }
            >
              <div className={tide ? 'pb-5' : 'min-h-0 overflow-hidden'}>
                <div className={tide ? '' : 'pb-5'}>{item.content}</div>
              </div>
            </div>
          </section>
        );
      })}

      <p className="shrink-0 border-t border-ink px-5 py-2 font-mono text-[9px] uppercase tracking-[0.2em] opacity-45">
        {tide
          ? 'fixed budget · ' + open.length + '/' + maxOpen + ' holding space'
          : 'budget too small — flowing instead'}
      </p>
    </div>
  );
}
