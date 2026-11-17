// ui-46 — ScrollRails
import { useEffect, useRef, useState, type RefObject } from 'react';

export interface ScrollRailsProps {
  /** Scroll container to measure. Defaults to the window. */
  scrollRef?: RefObject<HTMLElement>;
  /** Text shown vertically up the left rail. */
  leftLabel?: string;
  /** Text shown up the right rail (below the arrow). */
  rightLabel?: string;
}

/**
 * Fixed side rails with vertical mono labels and a live scroll-percentage
 * readout — the specimen-plate furniture that frames a long editorial page.
 * Sticks to the top of its scroll container, so it can be scoped to any panel.
 * Measures `scrollRef` if given, otherwise the window.
 */
export function ScrollRails({ scrollRef, leftLabel = 'IDX · 01 → 06', rightLabel = 'SCROLL · DOWN' }: ScrollRailsProps) {
  const [pct, setPct] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    const target: HTMLElement | Window = scrollRef?.current ?? window;

    const read = () => {
      if (target instanceof Window) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setPct(max > 0 ? Math.round((window.scrollY / max) * 100) : 0);
      } else {
        const max = target.scrollHeight - target.clientHeight;
        setPct(max > 0 ? Math.round((target.scrollTop / max) * 100) : 0);
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(read);
    };

    read();
    const et: EventTarget = target;
    et.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf.current);
      et.removeEventListener('scroll', onScroll);
    };
  }, [scrollRef]);

  const rail =
    'pointer-events-none absolute top-0 flex h-screen w-16 flex-col items-center justify-between py-8 font-mono text-[10px] uppercase tracking-[0.08em] text-ink/50';

  return (
    <div className="pointer-events-none sticky top-0 z-30 h-0">
      <div className={`${rail} left-0 border-r border-ink/15`}>
        <span className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap">{leftLabel}</span>
        <span>{String(pct).padStart(2, '0')}%</span>
      </div>
      <div className={`${rail} right-0 border-l border-ink/15`}>
        <span>↳</span>
        <span className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap">{rightLabel}</span>
      </div>
    </div>
  );
}
