import { useCallback, useEffect, useState, type RefObject } from 'react';

export type Side = 'top' | 'bottom';
export type Align = 'start' | 'end';

export interface AnchoredPosition {
  x: number;
  y: number;
  /** Resolved after collision handling — may differ from what was asked for. */
  side: Side;
  align: Align;
  /** transform-origin matching the resolved placement, for the scale entrance. */
  origin: string;
  /** False until the first real measurement, so nothing paints at 0,0. */
  ready: boolean;
}

export interface UseAnchoredPositionOptions {
  side?: Side;
  align?: Align;
  /** px between the anchor's edge and the panel's. */
  offset?: number;
  /** px kept clear of the viewport edge when shifting. */
  padding?: number;
  enabled?: boolean;
}

const ORIGIN: Record<`${Side}-${Align}`, string> = {
  'bottom-start': 'top left',
  'bottom-end': 'top right',
  'top-start': 'bottom left',
  'top-end': 'bottom right',
};

/**
 * Places a floating panel beside an anchor, in transform space only.
 *
 * The panel is `position: fixed` at the origin and moved with a single
 * `translate3d`. Writing `top`/`left` instead would put a layout on the critical
 * path of every scroll frame the panel is open — which is precisely the frame
 * budget a popover has no business spending.
 *
 * Collision handling is one measure pass: try the requested side, flip to the
 * opposite one if the panel does not fit and the opposite one does, then shift
 * along the cross axis to stay inside the viewport. The resolved placement comes
 * back out as `origin` so the scale entrance grows from the corner nearest the
 * trigger rather than from wherever the author guessed.
 *
 * Repositioning is rAF-coalesced and listens in the capture phase, so a panel
 * anchored inside a scrolled container tracks it without the container having to
 * announce itself.
 */
export function useAnchoredPosition(
  anchorRef: RefObject<HTMLElement>,
  panelRef: RefObject<HTMLElement>,
  {
    side = 'bottom',
    align = 'end',
    offset = 8,
    padding = 12,
    enabled = true,
  }: UseAnchoredPositionOptions = {},
): AnchoredPosition {
  const [pos, setPos] = useState<AnchoredPosition>({
    x: 0,
    y: 0,
    side,
    align,
    origin: ORIGIN[`${side}-${align}`],
    ready: false,
  });

  const measure = useCallback(() => {
    const anchor = anchorRef.current;
    const panel = panelRef.current;
    if (!anchor || !panel) return;

    const a = anchor.getBoundingClientRect();
    // The panel is mid-transition (scaled) while opening; use its untransformed
    // box so the resting position is solved once and never drifts.
    const w = panel.offsetWidth;
    const h = panel.offsetHeight;
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;

    let resolvedSide = side;
    const roomBelow = vh - a.bottom - offset;
    const roomAbove = a.top - offset;
    if (side === 'bottom' && roomBelow < h && roomAbove > roomBelow) resolvedSide = 'top';
    if (side === 'top' && roomAbove < h && roomBelow > roomAbove) resolvedSide = 'bottom';

    const y = resolvedSide === 'bottom' ? a.bottom + offset : a.top - offset - h;

    // Cross-axis: align to the requested edge, then shift back inside the
    // viewport. Shifting keeps the panel under the pointer; flipping the
    // alignment would move it out from under it.
    const wanted = align === 'end' ? a.right - w : a.left;
    const x = Math.min(Math.max(wanted, padding), Math.max(padding, vw - w - padding));

    setPos((prev) =>
      prev.ready &&
      Math.abs(prev.x - x) < 0.5 &&
      Math.abs(prev.y - y) < 0.5 &&
      prev.side === resolvedSide
        ? prev
        : {
            x,
            y,
            side: resolvedSide,
            align,
            origin: ORIGIN[`${resolvedSide}-${align}`],
            ready: true,
          },
    );
  }, [anchorRef, panelRef, side, align, offset, padding]);

  useEffect(() => {
    if (!enabled) {
      setPos((p) => (p.ready ? { ...p, ready: false } : p));
      return;
    }
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', schedule, { passive: true, capture: true });
    window.addEventListener('resize', schedule, { passive: true });

    const panel = panelRef.current;
    const ro = panel && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
    if (panel && ro) ro.observe(panel);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
      ro?.disconnect();
    };
  }, [enabled, measure, panelRef]);

  return pos;
}
