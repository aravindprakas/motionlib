// ui-64 — VerticalTicker
import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScroller } from '@/lib/SmoothScroll';
import { SET2 } from '@/lib/palette';

export interface TickerLine {
  tag: string;
  color: string;
  text: string;
}

export interface VerticalTickerProps {
  lines?: TickerLine[];
  /** Scroll speed in px per millisecond. Default 0.05. */
  speed?: number;
  className?: string;
}

const DEFAULT_LINES: TickerLine[] = [
  { tag: 'NEW', color: SET2.accent, text: 'Component pack ships v2 — twenty fresh patterns' },
  { tag: 'PERF', color: SET2.green, text: 'Held at 60fps with all fifty running at once' },
  { tag: 'NOTE', color: SET2.gold, text: 'Tokens drive every colour, every ease' },
  { tag: 'LAB', color: SET2.violet, text: 'Canvas demos pause the instant they leave view' },
  { tag: 'A11Y', color: SET2.navy, text: 'Reduced-motion users get the calm version' },
];

/**
 * Vertical news ticker: the rail is doubled and translated upward on a rAF
 * loop, wrapping by half its height for a seamless infinite scroll. It pauses
 * on hover and while off-screen, and is masked top and bottom.
 *
 * Reduced motion: the rail is static — the loop never starts.
 */
export function VerticalTicker({ lines = DEFAULT_LINES, speed = 0.05, className = '' }: VerticalTickerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const scrollerRef = useScroller();

  useEffect(() => {
    if (reduced) return;
    const host = hostRef.current;
    const rail = railRef.current;
    if (!host || !rail) return;

    let y = 0;
    let half = rail.scrollHeight / 2;
    let raf = 0;
    let last = performance.now();
    let visible = true;
    let paused = false;

    const ro = new ResizeObserver(() => (half = rail.scrollHeight / 2));
    ro.observe(rail);
    const onEnter = () => (paused = true);
    const onLeave = () => (paused = false);
    host.addEventListener('pointerenter', onEnter);
    host.addEventListener('pointerleave', onLeave);
    const io = new IntersectionObserver((en) => (visible = en[0].isIntersecting), {
      root: scrollerRef?.current ?? null,
      threshold: 0,
    });
    io.observe(host);

    const frame = (now: number) => {
      const dt = now - last;
      last = now;
      if (visible && !paused) {
        y -= dt * speed;
        if (-y >= half) y += half;
        rail.style.transform = `translateY(${y}px)`;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener('pointerenter', onEnter);
      host.removeEventListener('pointerleave', onLeave);
    };
  }, [reduced, speed, scrollerRef, lines]);

  const doubled = [...lines, ...lines];

  return (
    <div
      ref={hostRef}
      className={`h-[320px] overflow-hidden border-y border-navy-line [-webkit-mask-image:linear-gradient(180deg,transparent,#000_16%,#000_84%,transparent)] [mask-image:linear-gradient(180deg,transparent,#000_16%,#000_84%,transparent)] ${className}`}
    >
      <div ref={railRef} className="flex flex-col will-change-transform">
        {doubled.map((l, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-navy-line px-1 py-[18px] text-[clamp(15px,1.9vw,22px)] font-medium tracking-[-0.01em] text-navy"
          >
            <span
              className="flex-none px-2 py-1 font-mono text-[11px] font-bold tracking-[0.1em] text-cream"
              style={{ background: l.color }}
            >
              {l.tag}
            </span>
            {l.text}
          </div>
        ))}
      </div>
    </div>
  );
}
