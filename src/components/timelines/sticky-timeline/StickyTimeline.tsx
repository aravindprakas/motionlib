// ui-49 — StickyTimeline
import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScroller } from '@/lib/SmoothScroll';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface TimelineEvent {
  year: string;
  title: string;
  body: string;
}

export interface StickyTimelineProps {
  events?: TimelineEvent[];
  className?: string;
}

const DEFAULT_EVENTS: TimelineEvent[] = [
  { year: '2019', title: 'Studio opens', body: 'Two people, one borrowed desk, a wall of sticky notes.' },
  { year: '2021', title: 'First product', body: 'Shipped the design system that everything else stands on.' },
  { year: '2023', title: 'The motion era', body: 'Animation stopped being a garnish and became the language.' },
  { year: '2026', title: 'Fifty components', body: 'This very library — open, token-driven, and still growing.' },
];

/**
 * Editorial timeline whose accent spine fills as you scroll past it (scrubbed
 * height), events slide in on a one-shot stagger, and each event's dot lights
 * while it owns the viewport — all bound to the ambient scroller.
 *
 * Reduced motion: the spine is shown full, every event is visible and its dot
 * lit, with no scrubbing or sliding.
 */
export function StickyTimeline({ events = DEFAULT_EVENTS, className = '' }: StickyTimelineProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const scrollerRef = useScroller();

  useGSAP(
    () => {
      const root = rootRef.current;
      const fill = fillRef.current;
      if (!root || !fill) return;
      const evs = Array.from(root.querySelectorAll<HTMLElement>('[data-ev]'));
      if (reduced) {
        gsap.set(fill, { height: '100%' });
        gsap.set(evs, { opacity: 1, x: 0 });
        evs.forEach((ev) => ev.setAttribute('data-on', 'true'));
        return;
      }
      gsap.to(fill, {
        height: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          scroller: scrollerRef?.current ?? undefined,
          start: 'top 60%',
          end: 'bottom 70%',
          scrub: true,
        },
      });
      gsap.from(evs, {
        x: -24,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: root,
          scroller: scrollerRef?.current ?? undefined,
          start: 'top 78%',
          once: true,
        },
      });
      evs.forEach((ev) =>
        ScrollTrigger.create({
          trigger: ev,
          scroller: scrollerRef?.current ?? undefined,
          start: 'top 62%',
          end: 'bottom 62%',
          onToggle: (self) => ev.setAttribute('data-on', self.isActive ? 'true' : 'false'),
        }),
      );
    },
    { scope: rootRef, dependencies: [reduced, events] },
  );

  return (
    <div ref={rootRef} className={`grid grid-cols-[3px_1fr] gap-x-[30px] pl-1.5 ${className}`}>
      <div className="relative bg-navy-line">
        <div ref={fillRef} className="absolute inset-x-0 top-0 h-0 bg-coral will-change-[height]" />
      </div>
      <div className="grid gap-[clamp(40px,8vh,90px)] py-1.5">
        {events.map((ev, i) => (
          <div key={i} data-ev data-on="false" className="group relative will-change-transform">
            <span className="absolute left-[-45px] top-1 h-[15px] w-[15px] border-[3px] border-navy-line bg-cream transition-colors duration-300 group-data-[on=true]:border-coral group-data-[on=true]:bg-coral" />
            <span className="font-mono text-[13px] font-bold tracking-[0.14em] text-coral tabular-nums">
              {ev.year}
            </span>
            <h3 className="mb-2 mt-1.5 text-[clamp(22px,3vw,36px)] font-medium tracking-[-0.02em] text-navy">
              {ev.title}
            </h3>
            <p className="m-0 max-w-[46ch] leading-relaxed text-navy-soft">{ev.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
