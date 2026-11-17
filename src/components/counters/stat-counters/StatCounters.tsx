// ui-66 — StatCounters
import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScroller } from '@/lib/SmoothScroll';

export interface Stat {
  value: number;
  suffix?: string;
  label: string;
}

export interface StatCountersProps {
  stats: Stat[];
  /** Show the scroll progress bar above the grid. Default true. */
  showProgress?: boolean;
  className?: string;
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/**
 * Scroll progress bar (scaleX transform) + stats that count up from zero the
 * first time they scroll into view.
 *
 * Fixes vs. the Store original: the progress bar read `window.scrollY`, which
 * is always 0 inside a scroll container — it now tracks the ambient Lenis
 * scroller via useScroller(); stats are a prop instead of hardcoded.
 */
export function StatCounters({ stats, showProgress = true, className = '' }: StatCountersProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const scrollerRef = useScroller();

  // Progress bar — listens to the actual scroll container.
  useEffect(() => {
    if (!showProgress || typeof window === 'undefined') return;
    const scroller = scrollerRef?.current ?? null;
    const listenTarget: EventTarget = scroller ?? window;

    function onScroll() {
      const top = scroller ? scroller.scrollTop : window.scrollY;
      const max = scroller
        ? scroller.scrollHeight - scroller.clientHeight
        : document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? top / max : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${clamp(p, 0, 1)})`;
    }

    listenTarget.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => {
      listenTarget.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [showProgress, scrollerRef]);

  // Count-up on first view.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === 'undefined') return;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-count]'));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const target = parseFloat(el.dataset.count || '0');
          const suffix = el.dataset.suffix ? ` ${el.dataset.suffix}` : '';
          observer.unobserve(el);
          if (reduced) {
            el.textContent = `${target}${suffix}`;
            return;
          }
          const duration = 1200;
          const t0 = performance.now();
          function tick(now: number) {
            const k = clamp((now - t0) / duration, 0, 1);
            const eased = 1 - Math.pow(1 - k, 3); // cubic ease-out
            el.textContent = `${Math.round(target * eased)}${suffix}`;
            if (k < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.5 },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [reduced, stats]);

  return (
    <div ref={rootRef} className={className}>
      {showProgress && (
        <div className="mb-4 h-[3px] w-full bg-ink/10">
          <div
            ref={barRef}
            className="h-full w-full origin-left bg-accent will-change-transform"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>
      )}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-px border border-ink/15 bg-ink/15">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-paper p-5">
            <div
              className="text-[clamp(2rem,5vw,3rem)] font-semibold leading-[0.9] tracking-[-0.03em]"
              data-count={stat.value}
              data-suffix={stat.suffix}
            >
              0
            </div>
            <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.1em] text-ink/50">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
