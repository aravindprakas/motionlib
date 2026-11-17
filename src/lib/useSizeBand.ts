import { useEffect, useState, type RefObject } from 'react';

/**
 * Container-driven responsiveness.
 *
 * A viewport media query is the wrong instrument for a component: the same
 * carousel is 1200px wide in a full-bleed section and 320px wide in a sidebar,
 * on the identical "desktop" viewport. Everything in this set therefore sizes
 * itself from *its own box* via one ResizeObserver, so a component dropped into
 * a narrow column behaves exactly as it does on a phone — mobile, tablet and
 * desktop stop being three separate code paths and become one continuous axis.
 *
 * Two channels come out of it:
 *  - `data-band` on the element + the returned value, for the rare decisions
 *    that genuinely change the DOM (a rail becoming a drum). Re-renders only
 *    when the band *changes*, never per pixel.
 *  - `--cw`, the unitless content width, for everything else — the layout math
 *    that CSS can do on its own without React hearing about it.
 *
 * `--cw` is deliberately consumed by transforms and opacity only. Feed it back
 * into a property that changes the element's own size and you have built a
 * resize loop.
 */
export type SizeBand = 'compact' | 'regular' | 'wide';

export interface SizeStops {
  /** px at which `compact` becomes `regular`. */
  regular: number;
  /** px at which `regular` becomes `wide`. */
  wide: number;
}

export const DEFAULT_STOPS: SizeStops = { regular: 560, wide: 920 };

export function useSizeBand(
  ref: RefObject<HTMLElement>,
  stops: SizeStops = DEFAULT_STOPS,
): SizeBand {
  const [band, setBand] = useState<SizeBand>('regular');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const apply = (w: number) => {
      if (w <= 0) return;
      const next: SizeBand = w >= stops.wide ? 'wide' : w >= stops.regular ? 'regular' : 'compact';
      el.style.setProperty('--cw', String(Math.round(w)));
      if (el.dataset.band !== next) {
        el.dataset.band = next;
        setBand(next);
      }
    };

    apply(el.getBoundingClientRect().width);

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const box = entry.contentBoxSize?.[0];
      apply(box ? box.inlineSize : entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, stops.regular, stops.wide]);

  return band;
}

/** Coarse pointer = touch-first. Used to widen hit targets, never to hide behaviour. */
export function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState<boolean>(() =>
    typeof window !== 'undefined' && 'matchMedia' in window
      ? window.matchMedia('(pointer: coarse)').matches
      : false,
  );
  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return;
    const mq = window.matchMedia('(pointer: coarse)');
    const on = (e: MediaQueryListEvent) => setCoarse(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return coarse;
}
