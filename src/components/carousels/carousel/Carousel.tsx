// ui-18 — Carousel
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScroller } from '@/lib/SmoothScroll';
import { SET2 } from '@/lib/palette';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface CarouselSlide {
  kicker: string;
  title: string;
  color: string;
  /** Optional text colour override (e.g. for light slides). */
  textColor?: string;
}

export interface CarouselProps {
  slides?: CarouselSlide[];
  /** Auto-advance interval in ms. Default 2600. */
  interval?: number;
  className?: string;
}

const DEFAULT_SLIDES: CarouselSlide[] = [
  { kicker: 'Discover', title: 'Map the terrain first.', color: SET2.navy },
  { kicker: 'Design', title: 'Explore wide, commit hard.', color: SET2.accent },
  { kicker: 'Build', title: 'Motion from the first commit.', color: SET2.green },
  { kicker: 'Ship', title: 'Measured and handed off clean.', color: SET2.violet },
  { kicker: 'Repeat', title: 'Then do it all again.', color: SET2.gold, textColor: SET2.navy },
];

/**
 * Center-scale carousel: the active slide is translated to centre, scaled up
 * and brought to full opacity while its neighbours shrink and dim. It advances
 * itself on an interval that only runs while the carousel is on screen, and the
 * dots jump to any slide.
 *
 * Reduced motion: no auto-advance and no eased transitions — the dots still
 * switch slides, instantly.
 */
export function Carousel({ slides = DEFAULT_SLIDES, interval = 2600, className = '' }: CarouselProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const scrollerRef = useScroller();

  useEffect(() => {
    const car = rootRef.current;
    if (!car) return;
    const track = car.querySelector<HTMLElement>('[data-track]');
    const slideEls = Array.from(car.querySelectorAll<HTMLElement>('[data-slide]'));
    const dotEls = Array.from(car.querySelectorAll<HTMLButtonElement>('[data-dot]'));
    if (!track) return;

    let idx = 0;
    let iv = 0;
    const slideDur = reduced ? 0 : 0.8;
    const scaleDur = reduced ? 0 : 0.7;

    const go = (n: number) => {
      idx = (n + slideEls.length) % slideEls.length;
      const slide = slideEls[idx];
      const offset = slide.offsetLeft + slide.offsetWidth / 2 - track.offsetWidth / 2;
      gsap.to(track, { x: -offset, duration: slideDur, ease: 'power3.out' });
      slideEls.forEach((s, i) =>
        gsap.to(s, {
          scale: i === idx ? 1 : 0.84,
          opacity: i === idx ? 1 : 0.5,
          duration: scaleDur,
          ease: 'power3.out',
        }),
      );
      dotEls.forEach((d, i) => {
        d.style.background = i === idx ? SET2.accent : SET2.line;
        d.style.transform = i === idx ? 'scale(1.5)' : 'scale(1)';
      });
    };
    const stop = () => {
      if (iv) {
        clearInterval(iv);
        iv = 0;
      }
    };
    const restart = () => {
      stop();
      if (!reduced) iv = window.setInterval(() => go(idx + 1), interval);
    };

    const dotHandlers = dotEls.map((d, i) => {
      const h = () => {
        go(i);
        restart();
      };
      d.addEventListener('click', h);
      return [d, h] as const;
    });
    const onResize = () => go(idx);
    window.addEventListener('resize', onResize);

    const stEnter = ScrollTrigger.create({
      trigger: car,
      scroller: scrollerRef?.current ?? undefined,
      start: 'top 85%',
      once: true,
      onEnter: () => go(0),
    });
    const stVis = ScrollTrigger.create({
      trigger: car,
      scroller: scrollerRef?.current ?? undefined,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => (self.isActive ? restart() : stop()),
    });
    go(0);

    return () => {
      stop();
      window.removeEventListener('resize', onResize);
      dotHandlers.forEach(([d, h]) => d.removeEventListener('click', h));
      stEnter.kill();
      stVis.kill();
      gsap.killTweensOf([track, ...slideEls]);
    };
  }, [reduced, interval, slides, scrollerRef]);

  return (
    <div ref={rootRef} className={`grid gap-7 ${className}`}>
      <div data-track className="relative flex items-center justify-center gap-[22px] will-change-transform">
        {slides.map((s, i) => (
          <div
            key={i}
            data-slide
            className="grid h-[44vh] w-[min(40vw,360px)] flex-none content-end gap-2 p-7 will-change-transform"
            style={{ background: s.color, color: s.textColor ?? SET2.cream }}
          >
            <span className="font-mono text-xs uppercase tracking-[0.14em] opacity-70">{s.kicker}</span>
            <h3 className="m-0 text-[clamp(22px,2.6vw,32px)] font-medium tracking-[-0.02em]">{s.title}</h3>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-[9px]">
        {slides.map((_, i) => (
          <button
            key={i}
            data-dot
            aria-label={`Go to slide ${i + 1}`}
            className="h-[9px] w-[9px] will-change-transform"
            style={{ background: SET2.line }}
          />
        ))}
      </div>
    </div>
  );
}
