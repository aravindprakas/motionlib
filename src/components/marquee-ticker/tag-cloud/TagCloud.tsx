// ui-65 — TagCloud
import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScroller } from '@/lib/SmoothScroll';
import { SET2 } from '@/lib/palette';

export interface TagCloudItem {
  label: string;
  color: string;
}

export interface TagCloudProps {
  tags?: TagCloudItem[];
  className?: string;
}

const DEFAULT_TAGS: TagCloudItem[] = [
  { label: 'Motion', color: SET2.accent },
  { label: 'Systems', color: SET2.navy },
  { label: 'Type', color: SET2.green },
  { label: 'Colour', color: SET2.gold },
  { label: 'Identity', color: SET2.violet },
  { label: 'Product', color: SET2.navy700 },
  { label: 'Canvas', color: SET2.accent },
  { label: 'Scroll', color: SET2.green },
  { label: 'Pointer', color: SET2.gold },
  { label: 'Spring', color: SET2.violet },
];

type Drift = { ax: number; ay: number; px: number; py: number; sp: number };

/**
 * Tags scattered at random rest positions that each drift on their own slow
 * sine/cosine orbit — a soft, endless float. Positions re-seed on resize, and
 * the rAF loop pauses whenever the cloud scrolls out of view.
 *
 * Reduced motion: tags are placed once and never drift.
 */
export function TagCloud({ tags = DEFAULT_TAGS, className = '' }: TagCloudProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const scrollerRef = useScroller();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const els = Array.from(host.querySelectorAll<HTMLElement>('[data-tag]'));
    const drift = new Map<HTMLElement, Drift>();

    const place = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      els.forEach((t) => {
        t.style.left = `${Math.random() * Math.max(0, w - t.offsetWidth)}px`;
        t.style.top = `${Math.random() * Math.max(0, h - t.offsetHeight)}px`;
        t.style.transform = 'translate(0px, 0px)';
        drift.set(t, {
          ax: 10 + Math.random() * 26,
          ay: 10 + Math.random() * 26,
          px: Math.random() * Math.PI * 2,
          py: Math.random() * Math.PI * 2,
          sp: 0.4 + Math.random() * 0.5,
        });
      });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(host);

    if (reduced) return () => ro.disconnect();

    let raf = 0;
    let t = 0;
    let visible = true;
    const io = new IntersectionObserver((en) => (visible = en[0].isIntersecting), {
      root: scrollerRef?.current ?? null,
      threshold: 0,
    });
    io.observe(host);
    const frame = () => {
      if (visible) {
        t += 0.016;
        els.forEach((el) => {
          const d = drift.get(el);
          if (!d) return;
          el.style.transform = `translate(${Math.sin(t * d.sp + d.px) * d.ax}px, ${
            Math.cos(t * d.sp + d.py) * d.ay
          }px)`;
        });
      }
      raf = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [reduced, tags, scrollerRef]);

  return (
    <div
      ref={hostRef}
      className={`relative h-[56vh] overflow-hidden border border-navy-line bg-cream ${className}`}
    >
      {tags.map((tg, i) => (
        <span
          key={i}
          data-tag
          className="absolute whitespace-nowrap px-[22px] py-3 text-[clamp(15px,2vw,24px)] font-semibold tracking-[-0.01em] text-cream will-change-transform"
          style={{ background: tg.color }}
        >
          {tg.label}
        </span>
      ))}
    </div>
  );
}
