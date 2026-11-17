// FocusFlight — one ring that travels between focused elements
import { useEffect, useRef, type ReactNode } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface FocusFlightProps {
  children: ReactNode;
  /** Only fly for keyboard focus. Pointer users already know where they clicked. */
  keyboardOnly?: boolean;
  /** ms per 100px travelled, clamped by min/max. */
  pace?: number;
  minDuration?: number;
  maxDuration?: number;
  /** Extra px around the focused box. */
  inset?: number;
  /** Classes for the ring itself — border, colour, whatever you outline with. */
  ringClassName?: string;
  onArrive?: (el: HTMLElement) => void;
  className?: string;
}

/**
 * Gives keyboard focus a body: one ring that flies from the last focused element
 * to the next and takes its shape on the way.
 *
 * Focus is the only navigation in the interface that teleports. A pointer user
 * watches their own hand cross the page; a keyboard user presses Tab and a box
 * appears somewhere else, with nothing connecting the two — which is why people
 * lose the focus ring constantly on dense layouts and why so many teams quietly
 * delete the outline instead of fixing it. Moving the ring solves it directly:
 * the eye follows continuous motion for free, and the flight time is
 * proportional to distance, so a hop to the next field feels different from a
 * jump across the page. The ring also adopts each target's size and corner
 * radius as it lands, so it reads as the same object arriving rather than a
 * generic overlay.
 *
 * The native outline stays exactly where it is — this is drawn on top of it, not
 * instead of it, and it never touches focus order or the accessibility tree.
 * Reduced motion places the ring without the flight.
 */
export function FocusFlight({
  children,
  keyboardOnly = true,
  pace = 90,
  minDuration = 150,
  maxDuration = 460,
  inset = 4,
  ringClassName = 'border-2 border-vermilion',
  onArrive,
  className = '',
}: FocusFlightProps) {
  const box = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const arrive = useRef(onArrive);
  arrive.current = onArrive;
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = box.current;
    const mark = ring.current;
    if (!root || !mark) return;

    let byKeyboard = false;
    let last: { x: number; y: number; w: number; h: number } | null = null;

    const onKey = (e: KeyboardEvent) => {
      // Only navigation keys count as keyboard intent; typing in a field does not.
      if (e.key === 'Tab' || e.key.startsWith('Arrow') || e.key === 'Home' || e.key === 'End') byKeyboard = true;
    };
    const onPointer = () => {
      byKeyboard = false;
    };

    const place = (el: HTMLElement) => {
      const base = root.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      const next = {
        x: r.left - base.left - inset,
        y: r.top - base.top - inset,
        w: r.width + inset * 2,
        h: r.height + inset * 2,
      };
      const radius = getComputedStyle(el).borderRadius;

      mark.style.opacity = '1';
      mark.style.borderRadius = radius;
      mark.style.width = `${next.w}px`;
      mark.style.height = `${next.h}px`;
      mark.style.transform = `translate(${next.x}px, ${next.y}px)`;

      if (last && !reduced) {
        const dist = Math.hypot(next.x - last.x, next.y - last.y);
        const duration = Math.max(minDuration, Math.min(maxDuration, (dist / 100) * pace));
        mark.animate(
          [
            {
              transform: `translate(${last.x}px, ${last.y}px)`,
              width: `${last.w}px`,
              height: `${last.h}px`,
            },
            { transform: `translate(${next.x}px, ${next.y}px)`, width: `${next.w}px`, height: `${next.h}px` },
          ],
          { duration, easing: 'cubic-bezier(0.2,0.85,0.25,1)' },
        );
      } else if (!reduced) {
        mark.animate([{ opacity: 0, transform: `translate(${next.x}px, ${next.y}px) scale(1.15)` }, { opacity: 1 }], {
          duration: 180,
          easing: 'ease-out',
        });
      }

      last = next;
      arrive.current?.(el);
    };

    const onFocusIn = (e: FocusEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el || !root.contains(el)) return;
      if (keyboardOnly && !byKeyboard) {
        mark.style.opacity = '0';
        return;
      }
      place(el);
    };

    const onFocusOut = (e: FocusEvent) => {
      const next = e.relatedTarget as Node | null;
      if (!next || !root.contains(next)) mark.style.opacity = '0';
    };

    window.addEventListener('keydown', onKey, true);
    window.addEventListener('pointerdown', onPointer, true);
    root.addEventListener('focusin', onFocusIn);
    root.addEventListener('focusout', onFocusOut);

    return () => {
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('pointerdown', onPointer, true);
      root.removeEventListener('focusin', onFocusIn);
      root.removeEventListener('focusout', onFocusOut);
    };
  }, [keyboardOnly, pace, minDuration, maxDuration, inset, reduced]);

  return (
    <div ref={box} className={'relative ' + className}>
      <div
        ref={ring}
        aria-hidden
        className={'pointer-events-none absolute left-0 top-0 z-20 opacity-0 ' + ringClassName}
        style={{ transition: 'opacity 140ms linear', willChange: 'transform, width, height' }}
      />
      {children}
    </div>
  );
}
