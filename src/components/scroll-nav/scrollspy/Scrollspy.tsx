// ui-47 — Scrollspy
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScroller } from '@/lib/SmoothScroll';
import { SET2 } from '@/lib/palette';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface SpySection {
  label: string;
  index: string;
  color: string;
  title: string;
  body: string;
}

export interface ScrollspyProps {
  sections?: SpySection[];
  className?: string;
}

const DEFAULT_SECTIONS: SpySection[] = [
  {
    label: 'Strategy',
    index: '01',
    color: SET2.accent,
    title: 'Strategy',
    body: 'Where the whole thing is pointed before anyone opens a design tool. The marker sits here while this block owns the viewport.',
  },
  {
    label: 'Identity',
    index: '02',
    color: SET2.gold,
    title: 'Identity',
    body: 'The voice, the type, the colour — the parts people actually remember a year later.',
  },
  {
    label: 'Product',
    index: '03',
    color: SET2.green,
    title: 'Product',
    body: 'Screens that behave, with motion that earns its keep instead of showing off.',
  },
  {
    label: 'Motion',
    index: '04',
    color: SET2.violet,
    title: 'Motion',
    body: 'The layer you have been scrolling through this entire time.',
  },
];

/**
 * Sliding scrollspy: a sticky nav whose marker chases whichever section owns
 * the viewport (each section drives a ScrollTrigger toggle on the ambient
 * scroller), and clicking a link scrolls that section to centre.
 *
 * Reduced motion: the marker jumps to the active link instantly and links use
 * an instant scroll.
 */
export function Scrollspy({ sections = DEFAULT_SECTIONS, className = '' }: ScrollspyProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const scrollerRef = useScroller();

  useEffect(() => {
    const root = rootRef.current;
    const marker = markerRef.current;
    if (!root || !marker) return;
    const links = Array.from(root.querySelectorAll<HTMLElement>('[data-link]'));
    const secs = Array.from(root.querySelectorAll<HTMLElement>('[data-sec]'));

    const activate = (i: number) => {
      links.forEach((l, n) => (l.style.color = n === i ? SET2.navy : SET2.inkSoft));
      const link = links[i];
      gsap.to(marker, {
        y: link.offsetTop,
        height: link.offsetHeight,
        duration: reduced ? 0 : 0.4,
        ease: 'power3.out',
      });
    };
    activate(0);

    const sts = secs.map((sec, i) =>
      ScrollTrigger.create({
        trigger: sec,
        scroller: scrollerRef?.current ?? undefined,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => {
          if (self.isActive) activate(i);
        },
      }),
    );
    const linkHandlers = links.map((l, i) => {
      const h = () => secs[i].scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      l.addEventListener('click', h);
      return [l, h] as const;
    });

    return () => {
      sts.forEach((s) => s.kill());
      linkHandlers.forEach(([l, h]) => l.removeEventListener('click', h));
      gsap.killTweensOf(marker);
    };
  }, [reduced, sections, scrollerRef]);

  return (
    <div
      ref={rootRef}
      className={`grid grid-cols-1 items-start gap-10 md:grid-cols-[200px_1fr] ${className}`}
    >
      <nav className="relative grid gap-1 border-l border-navy-line pl-4 md:sticky md:top-[22vh]">
        <div
          ref={markerRef}
          className="absolute left-[-1px] top-0 h-[38px] w-[2px] bg-coral will-change-transform"
        />
        {sections.map((s, i) => (
          <a
            key={i}
            data-link
            className="cursor-pointer py-[10px] text-base font-medium"
            style={{ color: i === 0 ? SET2.navy : SET2.inkSoft }}
          >
            {s.label}
          </a>
        ))}
      </nav>

      <div className="grid gap-[clamp(36px,7vh,80px)]">
        {sections.map((s, i) => (
          <section key={i} data-sec className="border border-navy-line bg-cream p-[30px]">
            <span className="font-mono text-xs font-bold tracking-[0.14em] tabular-nums" style={{ color: s.color }}>
              {s.index}
            </span>
            <h3 className="mb-[10px] mt-2 text-[clamp(24px,3vw,38px)] font-medium tracking-[-0.02em] text-navy">
              {s.title}
            </h3>
            <p className="m-0 max-w-[44ch] leading-relaxed text-navy-soft">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
