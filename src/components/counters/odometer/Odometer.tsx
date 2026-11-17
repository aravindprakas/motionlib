// ui-67 — Odometer
import { useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScroller } from '@/lib/SmoothScroll';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface OdometerProps {
  /** The number to land on, as a string so leading zeros are kept (e.g. "00930"). */
  value: string;
  className?: string;
}

/**
 * Rolling-digit odometer: each column is a vertical strip of digits that spins
 * up and eases to rest on its target the first time it scrolls into view. Outer
 * (left) columns are given more loops, so the number resolves left-to-last.
 *
 * Reduced motion: every strip is placed on its final digit with no spin.
 */
export function Odometer({ value, className = '' }: OdometerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const scrollerRef = useScroller();

  const digits = useMemo(() => value.split(''), [value]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const reels = Array.from(root.querySelectorAll<HTMLElement>('[data-reel]'));
      const settle = (reel: HTMLElement) => {
        const strip = reel.querySelector<HTMLElement>('[data-strip]');
        if (strip) gsap.set(strip, { y: -(strip.children.length - 1) * reel.clientHeight });
      };
      if (reduced) {
        reels.forEach(settle);
        return;
      }
      ScrollTrigger.create({
        trigger: root,
        scroller: scrollerRef?.current ?? undefined,
        start: 'top 82%',
        once: true,
        onEnter: () => {
          reels.forEach((reel, i) => {
            const strip = reel.querySelector<HTMLElement>('[data-strip]');
            if (!strip) return;
            const stop = strip.children.length - 1;
            gsap.fromTo(
              strip,
              { y: 0 },
              { y: -stop * reel.clientHeight, duration: 1.7 + i * 0.16, ease: 'power4.out' },
            );
          });
        },
      });
    },
    { scope: rootRef, dependencies: [reduced, value] },
  );

  return (
    <div
      ref={rootRef}
      className={`flex gap-[2px] text-[clamp(48px,9vw,116px)] font-semibold leading-none tracking-[-0.04em] tabular-nums ${className}`}
    >
      {digits.map((d, i) => {
        const target = parseInt(d, 10) || 0;
        const loops = digits.length - i; // left columns spin more
        const stop = loops * 10 + target; // strip lands on a span showing the target
        const spans = Array.from({ length: stop + 1 }, (_, n) => n % 10);
        const color = i % 2 === 0 ? 'text-navy' : 'text-coral';
        return (
          <div key={i} data-reel className="relative h-[1em] w-[0.62em] overflow-hidden">
            <div data-strip className={`absolute left-0 top-0 will-change-transform ${color}`}>
              {spans.map((s, n) => (
                <span key={n} className="block h-[1em] text-center">
                  {s}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
