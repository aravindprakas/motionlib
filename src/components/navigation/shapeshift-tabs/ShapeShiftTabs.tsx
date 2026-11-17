// ShapeShiftTabs — one nav that changes species as its own box narrows
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface ShapeShiftTab {
  id: string;
  label: string;
  content: ReactNode;
  /** When this panel's content last changed. Drives the freshness mark. */
  updatedAt?: string | number | Date;
}

export interface ShapeShiftTabsProps {
  tabs: ShapeShiftTab[];
  defaultId?: string;
  activeId?: string;
  onChange?: (id: string) => void;
  /** Days after which a panel stops being marked as recently updated. */
  freshFor?: number;
  className?: string;
}

type Mode = 'full' | 'overflow' | 'select';

const MORE_W = 66;
const MIN_TABS = 2;

/**
 * A tab bar that stops pretending one shape fits every width.
 *
 * Tabs are the control that breaks first. Six labels are a comfortable row at
 * 1200px, an overlapping mess at 700, and unusable at 360 — so codebases end up
 * with a desktop tab bar, a separate mobile select, a media query between them,
 * and two implementations of the same state that drift apart. The width at
 * which they break is also never the viewport's: the same six tabs break in a
 * sidebar on a 27-inch monitor.
 *
 * So this measures its labels once, watches its own box, and changes what it
 * *is*: a full row while everything fits; a priority-plus row with the
 * remainder in a menu once it does not; a single listbox when even two labels
 * and a menu button will not fit. One state, one set of panels, one keyboard
 * model across all three. The selection indicator is a single element that
 * travels between whatever the current shape puts on screen — when the active
 * tab is pushed into the overflow menu, the indicator moves onto the menu
 * button rather than disappearing, so the bar never lies about where you are.
 *
 * Label widths are measured once from an out-of-flow copy and cached; a resize
 * costs one arithmetic pass over that cache, not a re-measure. Only the active
 * panel is mounted. The indicator is moved with a transform, never with
 * `left`/`width`, so the glide is compositor work. Tabs whose content changed
 * recently carry a mark that fades with age — a real timestamp, not a "new"
 * badge somebody forgot to remove. Full ARIA tabs semantics: arrows wrap,
 * Home/End jump, the panel is labelled by its tab. Reduced motion cuts the
 * glide and keeps every transition instant.
 */
export function ShapeShiftTabs({
  tabs,
  defaultId,
  activeId,
  onChange,
  freshFor = 21,
  className = '',
}: ShapeShiftTabsProps) {
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const measurer = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const widths = useRef<number[]>([]);
  const reduced = useReducedMotion();

  const controlled = activeId !== undefined;
  const [inner, setInner] = useState(defaultId ?? tabs[0]?.id);
  const active = controlled ? activeId : inner;
  const activeIndex = Math.max(0, tabs.findIndex((t) => t.id === active));

  const changeRef = useRef(onChange);
  changeRef.current = onChange;

  const [mode, setMode] = useState<Mode>('full');
  const [visible, setVisible] = useState(tabs.length);
  const [menuOpen, setMenuOpen] = useState(false);

  const select = useCallback(
    (id: string) => {
      if (!controlled) setInner(id);
      changeRef.current?.(id);
      setMenuOpen(false);
    },
    [controlled],
  );

  /** Freshness, computed once per tab set — not per frame, not per render. */
  const fresh = useMemo(() => {
    const now = Date.now();
    return tabs.map((t) => {
      if (!t.updatedAt) return 0;
      const days = (now - new Date(t.updatedAt).getTime()) / 864e5;
      return Math.max(0, 1 - days / freshFor);
    });
  }, [tabs, freshFor]);

  // ── measure labels once, then decide the shape from our own width ──────────
  useLayoutEffect(() => {
    const m = measurer.current;
    if (!m) return;
    widths.current = Array.from(m.children).map((c) => (c as HTMLElement).offsetWidth);
  }, [tabs]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const decide = () => {
      const w = el.clientWidth;
      const all = widths.current;
      if (!all.length || !w) return;

      const total = all.reduce((a, b) => a + b, 0);
      if (total <= w) {
        setMode('full');
        setVisible(all.length);
        return;
      }
      // Priority plus: how many fit alongside the menu button?
      let used = MORE_W;
      let n = 0;
      for (const cw of all) {
        if (used + cw > w) break;
        used += cw;
        n++;
      }
      if (n < MIN_TABS) {
        setMode('select');
        setVisible(0);
      } else {
        setMode('overflow');
        setVisible(n);
      }
    };

    decide();
    const ro = new ResizeObserver(decide);
    ro.observe(el);
    return () => ro.disconnect();
  }, [tabs]);

  // ── one indicator, moved by transform, wherever the shape put the target ───
  useLayoutEffect(() => {
    const bar = indicator.current;
    const row = list.current;
    if (!bar || !row || mode === 'select') return;
    const target = row.querySelector<HTMLElement>('[data-indicate="true"]');
    if (!target) {
      bar.style.opacity = '0';
      return;
    }
    const r = target.getBoundingClientRect();
    const base = row.getBoundingClientRect();
    bar.style.opacity = '1';
    bar.style.transform =
      'translateX(' + (r.left - base.left).toFixed(1) + 'px) scaleX(' + r.width.toFixed(1) + ')';
  }, [active, mode, visible, tabs, menuOpen]);

  const onKey = (e: React.KeyboardEvent) => {
    const jump: Record<string, number> = {
      ArrowRight: activeIndex + 1,
      ArrowLeft: activeIndex - 1,
      Home: 0,
      End: tabs.length - 1,
    };
    const next = jump[e.key];
    if (next === undefined) return;
    e.preventDefault();
    select(tabs[(next + tabs.length) % tabs.length].id);
  };

  const shown = mode === 'full' ? tabs : tabs.slice(0, visible);
  const hidden = mode === 'full' ? [] : tabs.slice(visible);
  const activeHidden = hidden.some((t) => t.id === active);
  const activeTab = tabs[activeIndex];

  const mark = (i: number) =>
    fresh[i] > 0 ? (
      <span
        aria-label="recently updated"
        className="ml-2 inline-block h-1 w-1 shrink-0 bg-vermilion align-middle"
        style={{ opacity: 0.25 + fresh[i] * 0.75 }}
      />
    ) : null;

  return (
    <div ref={root} className={'min-w-0 ' + className}>
      {/* Out-of-flow copy: measured once, never painted. */}
      <div
        ref={measurer}
        aria-hidden
        className="pointer-events-none invisible absolute left-0 top-0 flex h-0 overflow-hidden"
      >
        {tabs.map((t) => (
          <span
            key={t.id}
            className="whitespace-nowrap px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em]"
          >
            {t.label}
          </span>
        ))}
      </div>

      {mode === 'select' ? (
        <div className="relative border border-ink">
          <select
            value={active}
            onChange={(e) => select(e.target.value)}
            aria-label="Section"
            className="w-full appearance-none bg-bone px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] outline-none"
          >
            {tabs.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <span aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
            ▾
          </span>
        </div>
      ) : (
        <div
          ref={list}
          role="tablist"
          aria-label="Sections"
          onKeyDown={onKey}
          className="relative flex min-w-0 border-b border-ink"
        >
          {shown.map((t) => {
            const i = tabs.indexOf(t);
            const on = t.id === active;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={t.id + '-tab'}
                aria-selected={on}
                aria-controls={t.id + '-panel'}
                tabIndex={on ? 0 : -1}
                data-indicate={on && !activeHidden}
                onClick={() => select(t.id)}
                className={
                  'flex shrink-0 items-center whitespace-nowrap px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] outline-none transition-opacity focus-visible:bg-ink/[0.06] ' +
                  (on ? '' : 'opacity-55 hover:opacity-100')
                }
              >
                {t.label}
                {mark(i)}
              </button>
            );
          })}

          {hidden.length > 0 && (
            <div className="relative ml-auto shrink-0">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                data-indicate={activeHidden}
                onClick={() => setMenuOpen((o) => !o)}
                onBlur={(e) => {
                  if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node))
                    setMenuOpen(false);
                }}
                className={
                  'flex h-full items-center gap-2 whitespace-nowrap px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] outline-none ' +
                  (activeHidden ? '' : 'opacity-55 hover:opacity-100')
                }
              >
                +{hidden.length}
                <span aria-hidden>▾</span>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-20 mt-px min-w-[12rem] border border-ink bg-bone"
                >
                  {hidden.map((t) => {
                    const i = tabs.indexOf(t);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        role="menuitem"
                        onClick={() => select(t.id)}
                        className={
                          'flex w-full items-center justify-between whitespace-nowrap px-4 py-2.5 text-left font-mono text-[11px] uppercase tracking-[0.2em] hover:bg-ink hover:text-bone ' +
                          (t.id === active ? 'text-vermilion' : '')
                        }
                      >
                        {t.label}
                        {mark(i)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* The one indicator. Width is a scaleX of a 1px bar. */}
          <span
            ref={indicator}
            aria-hidden
            className="absolute bottom-0 left-0 h-0.5 w-px origin-left bg-vermilion"
            style={{
              transition: reduced
                ? undefined
                : 'transform 320ms cubic-bezier(0.22,1,0.36,1), opacity 160ms',
            }}
          />
        </div>
      )}

      {/* Only the active panel is mounted. */}
      <div
        role="tabpanel"
        id={activeTab.id + '-panel'}
        aria-labelledby={mode === 'select' ? undefined : activeTab.id + '-tab'}
        tabIndex={0}
        className="pt-6 outline-none"
      >
        {activeTab.content}
      </div>

      <p className="mt-4 border-t border-ink/20 pt-2 font-mono text-[9px] uppercase tracking-[0.2em] opacity-45">
        shape: {mode}
        {mode === 'overflow' ? ' · ' + visible + ' shown, ' + hidden.length + ' in menu' : ''}
      </p>
    </div>
  );
}
