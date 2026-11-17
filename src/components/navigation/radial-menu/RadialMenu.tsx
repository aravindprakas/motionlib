// ui-106 — RadialMenu
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { SET2 } from '@/lib/palette';

export interface RadialItem {
  label: string;
  color: string;
}

export interface RadialMenuProps {
  items?: RadialItem[];
  /** Arc radius in px the petals spring out to. Default 96. */
  radius?: number;
  className?: string;
}

const DEFAULT_ITEMS: RadialItem[] = [
  { label: 'Work', color: SET2.accent },
  { label: 'About', color: SET2.gold },
  { label: 'Lab', color: SET2.green },
  { label: 'Notes', color: SET2.violet },
  { label: 'Shop', color: SET2.navy },
  { label: 'Say hi', color: SET2.navy700 },
];

/**
 * Core button whose "+" rotates to a "×" while six labelled petals spring out
 * on an evenly-spaced arc with staggered `back.out` timing — each petal carries
 * its own token colour. Opens on hover, and the core click toggles it.
 *
 * Reduced motion: the same open/close still works, but instantly — every tween
 * runs at zero duration with no stagger.
 */
export function RadialMenu({ items = DEFAULT_ITEMS, radius = 96, className = '' }: RadialMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const plusRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const openRef = useRef(false);

  useEffect(() => {
    const root = rootRef.current;
    const plus = plusRef.current;
    if (!root || !plus) return;
    const petals = Array.from(root.querySelectorAll<HTMLElement>('[data-petal]'));
    const core = root.querySelector<HTMLButtonElement>('[data-core]');
    const dur = reduced ? 0 : 0.5;

    const set = (state: boolean) => {
      openRef.current = state;
      gsap.to(plus, { rotation: state ? 135 : 0, duration: reduced ? 0 : 0.4, ease: 'back.out(2)' });
      petals.forEach((p, i) => {
        const ang = ((-90 + (i / petals.length) * 360) * Math.PI) / 180;
        gsap.to(p, {
          x: state ? Math.cos(ang) * radius : 0,
          y: state ? Math.sin(ang) * radius : 0,
          opacity: state ? 1 : 0,
          scale: state ? 1 : 0.4,
          duration: dur,
          ease: state ? 'back.out(1.7)' : 'power3.in',
          delay: state && !reduced ? i * 0.04 : 0,
        });
      });
    };

    const onEnter = () => set(true);
    const onLeave = () => set(false);
    const onClick = () => set(!openRef.current);
    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointerleave', onLeave);
    core?.addEventListener('click', onClick);

    return () => {
      root.removeEventListener('pointerenter', onEnter);
      root.removeEventListener('pointerleave', onLeave);
      core?.removeEventListener('click', onClick);
      gsap.killTweensOf([plus, ...petals]);
    };
  }, [reduced, items, radius]);

  return (
    <div ref={rootRef} className={`relative grid h-[220px] w-[220px] flex-none place-items-center ${className}`}>
      <button
        data-core
        className="z-[2] grid h-[84px] w-[84px] place-items-center bg-navy text-cream"
        aria-label="Toggle menu"
      >
        <span ref={plusRef} className="inline-block text-[34px] font-light leading-none will-change-transform">
          +
        </span>
      </button>
      {items.map((it) => (
        <a
          key={it.label}
          data-petal
          className="absolute left-1/2 top-1/2 -ml-8 -mt-8 grid h-16 w-16 cursor-pointer place-items-center font-mono text-[11px] font-semibold tracking-[0.04em] text-cream opacity-0 will-change-transform"
          style={{ background: it.color }}
        >
          <span>{it.label}</span>
        </a>
      ))}
    </div>
  );
}
