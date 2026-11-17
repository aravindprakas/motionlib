// ui-7 — MagneticButton
import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Pull strength, 0–1. How far the button travels toward the cursor. Default 0.4. */
  strength?: number;
  /** Activation radius in px, measured from the button's centre. Default 160. */
  radius?: number;
  children: ReactNode;
}

/**
 * Button that attracts toward the cursor inside `radius` and springs back to
 * origin when the cursor leaves. The inner label runs on a slower tween with a
 * smaller multiplier, so it lags behind the shell (subtle parallax).
 *
 * Reduced motion: renders a plain button — no listeners, no tweens.
 */
export function MagneticButton({
  strength = 0.4,
  radius = 160,
  children,
  className = '',
  ...rest
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || typeof window === 'undefined') return;
    const button = buttonRef.current;
    const label = labelRef.current;
    if (!button || !label) return;

    // quickTo reuses one tween per property — zero allocation per pointer event.
    // The elastic ease covers both the weighted follow and the springy return.
    const shellVars = { duration: 1, ease: 'elastic.out(1, 0.35)' } as const;
    const labelVars = { duration: 1.4, ease: 'elastic.out(1, 0.4)' } as const;
    const xTo = gsap.quickTo(button, 'x', shellVars);
    const yTo = gsap.quickTo(button, 'y', shellVars);
    const lxTo = gsap.quickTo(label, 'x', labelVars);
    const lyTo = gsap.quickTo(label, 'y', labelVars);

    let inside = false;

    const onPointerMove = (e: PointerEvent) => {
      const r = button.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy);

      if (dist < radius) {
        inside = true;
        // Magnetic falloff: pull is strongest near the centre and fades
        // linearly to 0 at the radius edge, so the button releases smoothly
        // instead of snapping when the cursor crosses the boundary.
        const pull = (1 - dist / radius) * strength;
        xTo(dx * pull);
        yTo(dy * pull);
        // Label follows at ~45% of the shell's displacement → visible lag.
        lxTo(dx * pull * 0.45);
        lyTo(dy * pull * 0.45);
      } else if (inside) {
        inside = false;
        xTo(0);
        yTo(0);
        lxTo(0);
        lyTo(0);
      }
    };

    // Listen on window so attraction starts before the pointer touches the
    // element itself (the whole radius is "magnetic").
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      gsap.killTweensOf([button, label]);
      gsap.set([button, label], { x: 0, y: 0 });
    };
  }, [strength, radius, reduced]);

  return (
    <button ref={buttonRef} className={`will-change-transform ${className}`} {...rest}>
      <span ref={labelRef} className="inline-block will-change-transform">
        {children}
      </span>
    </button>
  );
}
