// SatellitePopover — a popover you can walk to, and stay in by standing still
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useReducedMotion } from '@/lib/useReducedMotion';

export type Side = 'top' | 'right' | 'bottom' | 'left';

export interface SatellitePopoverProps {
  /** The trigger. Rendered inside an inline wrapper that owns the events. */
  children: ReactNode;
  content: ReactNode;
  /** Preferred side. Falls through the other three when it does not fit. */
  side?: Side;
  /** px between anchor and panel. */
  offset?: number;
  /** Open on hover as well as click. */
  hover?: boolean;
  /** ms of continuous dwell after which the panel pins itself open. 0 disables. */
  pinAfter?: number;
  /** ms the safe corridor stays open after the pointer leaves the trigger. */
  grace?: number;
  /** Viewport width (px) below which the panel becomes a drag-dismissable sheet. */
  sheetBelow?: number;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

const ORDER: Record<Side, Side[]> = {
  top: ['top', 'bottom', 'right', 'left'],
  bottom: ['bottom', 'top', 'right', 'left'],
  left: ['left', 'right', 'top', 'bottom'],
  right: ['right', 'left', 'top', 'bottom'],
};

/** Barycentric sign test — is p on the inside of every edge of abc. */
function inTriangle(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number,
  cx: number, cy: number,
): boolean {
  const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
  const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
  const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
  const neg = d1 < 0 || d2 < 0 || d3 < 0;
  const pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}

/**
 * A popover that survives the walk between the trigger and itself.
 *
 * The everyday failure of hover popovers is geometric: the pointer has to cross
 * the gap to reach the panel, and the moment it leaves the trigger the panel is
 * gone — so anything interactive inside it is a coin flip, and authors paper
 * over it with close delays that make the panel feel sticky and wrong. This
 * closes on *direction* instead of on time. When the pointer leaves the trigger
 * it opens a corridor — the triangle spanned by the exit point and the panel's
 * near edge — and while the pointer stays inside that corridor the panel stays
 * up no matter how slowly you travel. Step outside it and the panel closes at
 * once. Nothing is waiting on a timer, so it never feels sluggish or stuck.
 *
 * Dwell is the second dimension. Hovering runs a hairline clock around the
 * panel's edge; hold still past it and the popover pins itself — it stops being
 * a hover preview and becomes a real dialog with focus moved into it, Escape to
 * leave and a click-outside to dismiss. Reading it long enough to want it is the
 * gesture that keeps it.
 *
 * Placement is solved in one measure pass: preferred side first, then the other
 * three, then a shift along the cross axis to stay on screen. The panel is
 * `position: fixed` and moved with a transform only — no `top`/`left` writes, so
 * repositioning on scroll never triggers layout. Below `sheetBelow` the whole
 * thing becomes a bottom sheet with drag-to-dismiss, because on a phone there
 * is no "beside". Portalled to the body, so no ancestor's overflow or stacking
 * context can clip it. Reduced motion removes the entrance and the dwell ring
 * but keeps every behaviour.
 */
export function SatellitePopover({
  children,
  content,
  side = 'top',
  offset = 10,
  hover = true,
  pinAfter = 650,
  grace = 500,
  sheetBelow = 600,
  onOpenChange,
  className = '',
}: SatellitePopoverProps) {
  const anchor = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const id = useId();

  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [placed, setPlaced] = useState<Side>(side);
  const openRef = useRef(open);
  openRef.current = open;
  const changeRef = useRef(onOpenChange);
  changeRef.current = onOpenChange;

  const setOpenState = useCallback((next: boolean) => {
    setOpen((prev) => {
      if (prev !== next) changeRef.current?.(next);
      return next;
    });
    if (!next) setPinned(false);
  }, []);

  // ── sheet vs satellite: the panel's container is the viewport, so ask it ────
  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return;
    const mq = window.matchMedia('(max-width: ' + sheetBelow + 'px)');
    const on = () => setSheet(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [sheetBelow]);

  // ── placement: one measure, transform-only writes ──────────────────────────
  useEffect(() => {
    if (!open || sheet) return;
    const a = anchor.current;
    const p = panel.current;
    if (!a || !p) return;
    let raf = 0;
    let lastSide: Side | null = null;

    const place = () => {
      raf = 0;
      const ar = a.getBoundingClientRect();
      const pr = p.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;
      const pad = 8;

      const fits: Record<Side, boolean> = {
        top: ar.top - pr.height - offset >= pad,
        bottom: ar.bottom + pr.height + offset <= vh - pad,
        left: ar.left - pr.width - offset >= pad,
        right: ar.right + pr.width + offset <= vw - pad,
      };
      const chosen = ORDER[side].find((s) => fits[s]) ?? side;

      let x = 0;
      let y = 0;
      if (chosen === 'top' || chosen === 'bottom') {
        x = ar.left + ar.width / 2 - pr.width / 2;
        y = chosen === 'top' ? ar.top - pr.height - offset : ar.bottom + offset;
      } else {
        x = chosen === 'left' ? ar.left - pr.width - offset : ar.right + offset;
        y = ar.top + ar.height / 2 - pr.height / 2;
      }
      // Shift along the cross axis rather than letting it hang off screen.
      x = Math.min(Math.max(x, pad), vw - pr.width - pad);
      y = Math.min(Math.max(y, pad), vh - pr.height - pad);

      p.style.transform = 'translate3d(' + Math.round(x) + 'px,' + Math.round(y) + 'px,0)';
      p.dataset.side = chosen;
      if (chosen !== lastSide) {
        lastSide = chosen;
        setPlaced(chosen);
      }
    };

    // Cancel-and-request: a frame requested while hidden may never run, and a
    // stale id would wedge repositioning shut.
    const schedule = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(place);
    };

    place();
    window.addEventListener('scroll', schedule, { passive: true, capture: true });
    window.addEventListener('resize', schedule, { passive: true });
    const ro = new ResizeObserver(schedule);
    ro.observe(p);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
      ro.disconnect();
    };
  }, [open, sheet, side, offset]);

  // ── the corridor: close on direction, not on a timer ───────────────────────
  const armCorridor = useCallback(
    (exitX: number, exitY: number) => {
      const p = panel.current;
      if (!p || pinned) return;
      const r = p.getBoundingClientRect();
      // Near-edge corners, fanned out so sloppy diagonals still count.
      const fan = 24;
      const corners: Record<Side, [number, number, number, number]> = {
        top: [r.left - fan, r.bottom, r.right + fan, r.bottom],
        bottom: [r.left - fan, r.top, r.right + fan, r.top],
        left: [r.right, r.top - fan, r.right, r.bottom + fan],
        right: [r.left, r.top - fan, r.left, r.bottom + fan],
      };
      const [bx, by, cx, cy] = corners[(p.dataset.side as Side) ?? placed];

      let expired = 0;
      const move = (e: PointerEvent) => {
        if (inTriangle(e.clientX, e.clientY, exitX, exitY, bx, by, cx, cy)) return;
        const overPanel = r.left <= e.clientX && e.clientX <= r.right && r.top <= e.clientY && e.clientY <= r.bottom;
        if (overPanel) return;
        stop();
        setOpenState(false);
      };
      const stop = () => {
        window.clearTimeout(expired);
        document.removeEventListener('pointermove', move);
      };
      // The corridor is a promise to travel, not a licence to idle in it.
      expired = window.setTimeout(() => {
        stop();
        if (!panel.current?.matches(':hover') && !anchor.current?.matches(':hover')) setOpenState(false);
      }, grace);
      document.addEventListener('pointermove', move);
      return stop;
    },
    [grace, pinned, placed, setOpenState],
  );

  const corridorStop = useRef<(() => void) | undefined>();

  // ── dwell clock ────────────────────────────────────────────────────────────
  const dwell = useRef(0);
  const clock = useRef<HTMLSpanElement>(null);
  const anim = useRef<Animation | null>(null);

  const startDwell = useCallback(() => {
    if (!pinAfter || pinned) return;
    window.clearTimeout(dwell.current);
    dwell.current = window.setTimeout(() => setPinned(true), pinAfter);
    // WAAPI rather than a named keyframe, so the component carries no global CSS.
    anim.current?.cancel();
    if (clock.current && !reduced) {
      anim.current = clock.current.animate(
        [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
        { duration: pinAfter, easing: 'linear', fill: 'forwards' },
      );
    }
  }, [pinAfter, pinned, reduced]);

  const cancelDwell = useCallback(() => {
    window.clearTimeout(dwell.current);
    anim.current?.cancel();
    anim.current = null;
  }, []);

  // ── pinned behaviours: focus, escape, outside click ────────────────────────
  useEffect(() => {
    if (!open || !pinned) return;
    const p = panel.current;
    const previous = document.activeElement as HTMLElement | null;
    p?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpenState(false);
      previous?.focus?.();
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (p?.contains(t) || anchor.current?.contains(t)) return;
      setOpenState(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open, pinned, setOpenState]);

  useEffect(
    () => () => {
      window.clearTimeout(dwell.current);
      anim.current?.cancel();
      corridorStop.current?.();
    },
    [],
  );

  // ── sheet drag-to-dismiss ──────────────────────────────────────────────────
  const onSheetPointerDown = (e: React.PointerEvent) => {
    const p = panel.current;
    if (!p || !sheet) return;
    const startY = e.clientY;
    let dy = 0;
    p.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => {
      dy = Math.max(0, ev.clientY - startY);
      p.style.transform = 'translate3d(0,' + dy.toFixed(1) + 'px,0)';
    };
    const up = () => {
      p.removeEventListener('pointermove', move);
      p.removeEventListener('pointerup', up);
      p.removeEventListener('pointercancel', up);
      if (dy > 90) setOpenState(false);
      else p.style.transform = 'translate3d(0,0,0)';
    };
    p.addEventListener('pointermove', move);
    p.addEventListener('pointerup', up);
    p.addEventListener('pointercancel', up);
  };

  const panelNode = open ? (
    <>
      {sheet && (
        <div
          aria-hidden
          onPointerDown={() => setOpenState(false)}
          className={'fixed inset-0 z-40 bg-ink/30' + (reduced ? '' : ' animate-modal-fade-in')}
        />
      )}
      <div
        ref={panel}
        id={id}
        role="dialog"
        aria-modal={sheet && pinned ? true : undefined}
        tabIndex={-1}
        data-pinned={pinned}
        onPointerEnter={() => {
          corridorStop.current?.();
          startDwell();
        }}
        onPointerLeave={(e) => {
          cancelDwell();
          if (!pinned && !sheet) corridorStop.current = armCorridor(e.clientX, e.clientY);
        }}
        className={
          sheet
            ? 'fixed inset-x-0 bottom-0 z-50 max-h-[80vh] touch-none overflow-y-auto border-t border-ink bg-bone p-5 outline-none' +
              (reduced ? '' : ' animate-modal-fade-in')
            : 'fixed left-0 top-0 z-50 w-[min(22rem,calc(100vw-1rem))] border border-ink bg-bone p-4 outline-none will-change-transform'
        }
      >
        {sheet && (
          <div
            onPointerDown={onSheetPointerDown}
            className="mx-auto mb-4 h-1 w-12 cursor-grab bg-ink/30"
            aria-hidden
          />
        )}

        {/* Dwell clock — the panel's own top edge, filling. */}
        {!reduced && pinAfter > 0 && (
          <span
            ref={clock}
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 h-px w-full origin-left scale-x-0 bg-vermilion"
          />
        )}

        {pinned && (
          <button
            type="button"
            onClick={() => setOpenState(false)}
            className="absolute right-2 top-2 border border-ink px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] hover:bg-ink hover:text-bone"
          >
            esc
          </button>
        )}

        {content}

        <p className="mt-3 border-t border-ink/20 pt-2 font-mono text-[9px] uppercase tracking-[0.2em] opacity-45">
          {pinned ? 'pinned' : sheet ? 'drag down to dismiss' : placed + ' · dwell to pin'}
        </p>
      </div>
    </>
  ) : null;

  return (
    <span
      ref={anchor}
      className={'relative inline-flex ' + className}
      onPointerEnter={(e) => {
        if (!hover || e.pointerType === 'touch') return;
        corridorStop.current?.();
        setOpenState(true);
        startDwell();
      }}
      onPointerLeave={(e) => {
        cancelDwell();
        if (!hover || pinned) return;
        corridorStop.current = armCorridor(e.clientX, e.clientY);
      }}
      onClick={() => {
        if (openRef.current && pinned) setOpenState(false);
        else {
          setOpenState(true);
          setPinned(true);
        }
      }}
      onFocus={() => setOpenState(true)}
      onBlur={(e) => {
        if (!pinned && !e.currentTarget.contains(e.relatedTarget as Node)) setOpenState(false);
      }}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={open ? id : undefined}
    >
      {children}
      {typeof document !== 'undefined' && panelNode
        ? createPortal(panelNode, document.body)
        : null}
    </span>
  );
}
