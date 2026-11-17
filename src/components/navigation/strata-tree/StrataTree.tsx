// StrataTree — a tree that keeps its ancestors on screen and its DOM small
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useSizeBand } from '@/lib/useSizeBand';

export interface TreeNode {
  id: string;
  label: string;
  meta?: string;
  children?: TreeNode[];
}

export interface StrataTreeProps {
  nodes: TreeNode[];
  /** Node ids expanded on first render. */
  defaultOpen?: string[];
  /** Row height in px. Rows are uniform — that is what makes the window cheap. */
  rowHeight?: number;
  /** Rows rendered above and below the visible window. */
  overscan?: number;
  /** Visible height of the scroller. */
  height?: number | string;
  onSelect?: (node: TreeNode, path: TreeNode[]) => void;
  className?: string;
}

interface Row {
  node: TreeNode;
  depth: number;
  path: TreeNode[];
  open: boolean;
  /** Total descendants, open or not — the weight of what a collapsed row hides. */
  weight: number;
}

/** Height of one condensed ancestor bar in the spine. */
const SPINE_H = 22;

function countAll(node: TreeNode): number {
  if (!node.children?.length) return 0;
  let n = node.children.length;
  for (const c of node.children) n += countAll(c);
  return n;
}

/**
 * A tree view whose two hardest problems are solved by the same idea: only
 * render what is on screen, and never let the user lose the thread.
 *
 * Ordinary tree views render every expanded node, so a deep repository or a
 * category index collapses framerate the moment someone expands the wrong
 * branch, and they indent, so on a phone the eighth level has no room left to
 * be anything. This flattens the open tree into a uniform row list and windows
 * it — a ten-thousand-node tree keeps roughly twenty elements in the DOM, and
 * expanding a branch costs one array rebuild rather than a recursive re-render.
 *
 * Depth is then read three ways at once rather than by indentation alone: rows
 * step back in Z inside a shared perspective, so nesting is literal distance;
 * the ancestors of whatever is at the top of the scroller condense into a spine
 * that stacks at the head of the viewport and gets pushed out by the next
 * branch, so context is never scrolled away; and a collapsed row carries a
 * hairline sized to the number of descendants it is hiding, so you can judge
 * the weight of a branch before opening it.
 *
 * Indentation is budgeted from the component's own width, so the same tree in a
 * narrow column caps its indent and leans on depth pips instead of running off
 * the edge. Scrolling drives no React state except when the window's first row
 * actually changes; the spine's push is written as a transform in the same
 * frame. Full ARIA tree semantics and keyboard model: arrows to move, expand
 * and collapse, Home/End to jump. Reduced motion flattens the Z and expands
 * instantly.
 */
export function StrataTree({
  nodes,
  defaultOpen = [],
  rowHeight = 34,
  overscan = 6,
  height = 420,
  onSelect,
  className = '',
}: StrataTreeProps) {
  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const spine = useRef<HTMLDivElement>(null);
  const band = useSizeBand(root, { regular: 480, wide: 760 });
  const reduced = useReducedMotion();

  const [open, setOpen] = useState<Set<string>>(() => new Set(defaultOpen));
  const [selected, setSelected] = useState<string | null>(null);
  /** First row not hidden behind the spine. Drives both the window and the spine. */
  const [topIndex, setTopIndex] = useState(0);
  const [visible, setVisible] = useState(14);
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;

  /** The open tree, flattened. Rebuilt only when the tree or the open set changes. */
  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    const walk = (list: TreeNode[], depth: number, path: TreeNode[]) => {
      for (const node of list) {
        const isOpen = open.has(node.id);
        out.push({ node, depth, path, open: isOpen, weight: countAll(node) });
        if (isOpen && node.children?.length) walk(node.children, depth + 1, [...path, node]);
      }
    };
    walk(nodes, 0, []);
    return out;
  }, [nodes, open]);

  const maxDepth = useMemo(() => rows.reduce((m, r) => Math.max(m, r.depth), 0), [rows]);
  /** Indent budget: never spend more than a third of our own width on nesting. */
  const indent = band === 'compact' ? 12 : band === 'regular' ? 18 : 24;

  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const topRef = useRef(topIndex);
  topRef.current = topIndex;

  // ── windowing + spine, both driven by one scroll read per frame ────────────
  useEffect(() => {
    const sc = scroller.current;
    if (!sc) return;
    let raf = 0;

    const read = () => {
      raf = 0;
      const top = sc.scrollTop;
      const list = rowsRef.current;
      const count = Math.ceil(sc.clientHeight / rowHeight) + overscan * 2;

      // The spine covers the rows under it, so the row that matters is the first
      // one below it. Its own depth sets the spine's height, so resolve once.
      const raw = Math.min(list.length - 1, Math.max(0, Math.floor(top / rowHeight)));
      const guess = (list[raw]?.path.length ?? 0) * SPINE_H;
      const next = Math.min(
        list.length - 1,
        Math.max(0, Math.floor((top + guess) / rowHeight)),
      );
      if (next !== topRef.current) {
        topRef.current = next;
        setTopIndex(next);
      }
      setVisible((v) => (v === count ? v : count));

      // Push the spine off the top when the next shallower branch arrives.
      const sp = spine.current;
      if (sp) {
        const depth = list[next]?.path.length ?? 0;
        const h = depth * SPINE_H;
        let push = 0;
        if (h > 0) {
          for (let i = next + 1; i < list.length; i++) {
            if (list[i].depth < depth) {
              const gap = i * rowHeight - top;
              if (gap < h) push = gap - h;
              break;
            }
          }
        }
        sp.style.transform = 'translate3d(0,' + Math.round(push) + 'px,0)';
      }
    };

    // Cancel-and-request rather than guarding on a stored id: a frame requested
    // while the tab was hidden may never run, and a stale id would then wedge
    // this handler shut for the rest of the session.
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(read);
    };

    read();
    sc.addEventListener('scroll', onScroll, { passive: true });
    const ro = new ResizeObserver(onScroll);
    ro.observe(sc);
    return () => {
      cancelAnimationFrame(raf);
      sc.removeEventListener('scroll', onScroll);
      ro.disconnect();
    };
  }, [rowHeight, overscan]);

  const toggle = useCallback((id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const focusRow = useCallback(
    (i: number) => {
      const sc = scroller.current;
      if (!sc) return;
      const clamped = Math.min(Math.max(i, 0), rows.length - 1);
      const top = clamped * rowHeight;
      const spineH = rows[clamped].path.length * SPINE_H;
      if (top - spineH < sc.scrollTop) sc.scrollTop = Math.max(0, top - spineH);
      else if (top + rowHeight > sc.scrollTop + sc.clientHeight)
        sc.scrollTop = top + rowHeight - sc.clientHeight;
      setSelected(rows[clamped].node.id);
      requestAnimationFrame(() => {
        sc.querySelector<HTMLElement>('[data-idx="' + clamped + '"]')?.focus();
      });
    },
    [rows, rowHeight],
  );

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const row = rows[i];
    const hasKids = Boolean(row.node.children?.length);
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusRow(i + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusRow(i - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (hasKids && !row.open) toggle(row.node.id);
        else if (hasKids) focusRow(i + 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (hasKids && row.open) toggle(row.node.id);
        else if (row.depth > 0) {
          const parent = row.path[row.path.length - 1];
          const pi = rows.findIndex((r) => r.node.id === parent.id);
          if (pi >= 0) focusRow(pi);
        }
        break;
      case 'Home':
        e.preventDefault();
        focusRow(0);
        break;
      case 'End':
        e.preventDefault();
        focusRow(rows.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        setSelected(row.node.id);
        selectRef.current?.(row.node, row.path);
        if (hasKids) toggle(row.node.id);
        break;
      default:
    }
  };

  const start = Math.max(0, topIndex - overscan);
  const slice = rows.slice(start, Math.min(rows.length, start + visible));
  const spineRows = rows[topIndex]?.path ?? [];

  return (
    <div ref={root} className={'border border-ink bg-bone ' + className}>
      <div className="flex items-center justify-between border-b border-ink px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em]">
        <span>
          {rows.length} rows open · depth {maxDepth + 1}
        </span>
        <span className="opacity-60">{slice.length} in DOM</span>
      </div>

      <div className="relative">
        {/* Condensed ancestors — context that refuses to scroll away. */}
        <div
          ref={spine}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-10 will-change-transform"
        >
          {spineRows.map((n, d) => (
            <div
              key={n.id}
              className="flex items-center gap-2 border-b border-ink/15 bg-bone/95 px-3 backdrop-blur-[2px]"
              style={{ height: SPINE_H, paddingLeft: 12 + d * indent }}
            >
              <span className="h-px w-2 bg-vermilion" />
              <span className="truncate font-mono text-[10px] uppercase tracking-[0.2em] opacity-70">
                {n.label}
              </span>
            </div>
          ))}
        </div>

        <div
          ref={scroller}
          role="tree"
          aria-label="Hierarchy"
          className="overflow-y-auto overflow-x-hidden"
          style={{
            height,
            perspective: reduced ? undefined : '900px',
            perspectiveOrigin: '18% 50%',
          }}
        >
          <div style={{ height: rows.length * rowHeight, position: 'relative' }}>
            {slice.map((row, k) => {
              const i = start + k;
              const hasKids = Boolean(row.node.children?.length);
              const on = selected === row.node.id;
              return (
                <div
                  key={row.node.id}
                  data-idx={i}
                  role="treeitem"
                  tabIndex={on || (!selected && i === 0) ? 0 : -1}
                  aria-level={row.depth + 1}
                  aria-expanded={hasKids ? row.open : undefined}
                  aria-selected={on}
                  onKeyDown={(e) => onKey(e, i)}
                  onClick={() => {
                    setSelected(row.node.id);
                    selectRef.current?.(row.node, row.path);
                    if (hasKids) toggle(row.node.id);
                  }}
                  className="absolute inset-x-0 flex cursor-pointer items-center gap-2 pr-3 outline-none transition-colors duration-150 hover:bg-ink/[0.04] focus-visible:bg-ink/[0.06] data-[on=true]:bg-ink/[0.07]"
                  data-on={on}
                  style={{
                    top: i * rowHeight,
                    height: rowHeight,
                    paddingLeft: 12 + row.depth * indent,
                    // Depth as literal distance. Flat under reduced motion.
                    transform: reduced ? undefined : 'translateZ(' + row.depth * -14 + 'px)',
                    opacity: reduced ? 1 : Math.max(0.5, 1 - row.depth * 0.07),
                  }}
                >
                  {/* Disclosure: a rule that turns, not an icon font. */}
                  <span
                    aria-hidden
                    className="relative flex h-4 w-4 shrink-0 items-center justify-center"
                  >
                    {hasKids ? (
                      <>
                        <span className="absolute h-px w-2.5 bg-ink" />
                        <span
                          className="absolute h-px w-2.5 bg-ink transition-transform duration-200"
                          style={{
                            transform: row.open ? 'rotate(0deg)' : 'rotate(90deg)',
                            transitionDuration: reduced ? '0ms' : undefined,
                          }}
                        />
                      </>
                    ) : (
                      <span className="h-1 w-1 bg-ink/30" />
                    )}
                  </span>

                  <span
                    className={
                      'truncate text-[13px] ' +
                      (hasKids ? 'font-display font-medium' : 'font-mono text-[11px] opacity-80')
                    }
                  >
                    {row.node.label}
                  </span>

                  {row.node.meta && band !== 'compact' && (
                    <span className="ml-auto shrink-0 font-mono text-[9px] uppercase tracking-[0.18em] opacity-45">
                      {row.node.meta}
                    </span>
                  )}

                  {/* Weight of a closed branch: how much is behind this row. */}
                  {hasKids && !row.open && row.weight > 0 && (
                    <span
                      aria-hidden
                      className={
                        'h-px shrink-0 bg-vermilion/60 ' + (row.node.meta && band !== 'compact' ? 'ml-3' : 'ml-auto')
                      }
                      style={{ width: Math.min(56, 6 + row.weight * 1.6) }}
                      title={row.weight + ' hidden'}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
