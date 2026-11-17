// AttentionField — motion that knows whether anyone is still watching
import { useEffect, useRef, type ReactNode } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export type AttentionState = 'engaged' | 'drifting' | 'away';

export interface AttentionFieldProps {
  children: ReactNode;
  /** ms of no input before attention starts to fall. */
  idleAfter?: number;
  /** Seconds for a full breath cycle once the field is drifting. */
  breath?: number;
  /** Fires on each state change — pause a video, stop polling, dim a canvas. */
  onStateChange?: (state: AttentionState) => void;
  className?: string;
}

const ACTIVITY = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'] as const;

/**
 * Publishes how much of the user's attention it currently has, and lets the
 * children decide what to do about it.
 *
 * Interfaces treat presence as binary and only at the extremes: hover says
 * someone is on this element right now, and an idle timeout eventually logs you
 * out. Between those is the state a page is actually in most of the time —
 * open, visible, and unattended — and nothing responds to it, so ambient motion
 * keeps running at full volume for an empty chair, burning battery and looking
 * faintly hysterical when the person comes back. This tracks three inputs the
 * browser already knows (time since real input, tab visibility, whether the
 * field is on screen), collapses them into one smoothed `--attention` from 1 to
 * 0, and adds `--breath`, a slow oscillation whose amplitude is exactly what
 * attention has given up. Engaged: sharp and still. Away: quietly breathing.
 *
 * Both land on the field root, so children inherit them through CSS with no
 * per-child bookkeeping, and the loop stops as soon as the field settles.
 * Reduced motion pins `--breath` at 0 and keeps the state reporting, which is
 * the half that is not decorative.
 */
export function AttentionField({
  children,
  idleAfter = 4000,
  breath = 6,
  onStateChange,
  className = '',
}: AttentionFieldProps) {
  const box = useRef<HTMLDivElement>(null);
  const notify = useRef(onStateChange);
  notify.current = onStateChange;
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = box.current;
    if (!root) return;

    let attention = 1;
    let target = 1;
    let inView = true;
    let raf = 0;
    let idleTimer = 0;
    let state: AttentionState = 'engaged';
    const t0 = performance.now();

    const setState = (next: AttentionState) => {
      if (next === state) return;
      state = next;
      root.dataset.attention = next;
      notify.current?.(next);
    };
    root.dataset.attention = state;

    const frame = () => {
      // Attention drops away slowly and comes back at once — the reverse feels
      // like the interface doubting you were really there.
      attention += (target - attention) * (target > attention ? 0.2 : 0.03);
      if (Math.abs(target - attention) < 0.002) attention = target;

      const idle = 1 - attention;
      const wave = reduced ? 0 : Math.sin(((performance.now() - t0) / 1000 / breath) * Math.PI * 2);
      root.style.setProperty('--attention', attention.toFixed(4));
      root.style.setProperty('--breath', (wave * idle).toFixed(4));

      setState(attention > 0.85 ? 'engaged' : attention > 0.15 ? 'drifting' : 'away');

      // Keep going while settling, and while there is any breath left to animate.
      raf = attention !== target || (idle > 0.002 && !reduced) ? requestAnimationFrame(frame) : 0;
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const evaluate = () => {
      target = document.visibilityState === 'visible' && inView ? 1 : 0;
      wake();
    };

    const activity = () => {
      window.clearTimeout(idleTimer);
      if (document.visibilityState === 'visible' && inView) target = 1;
      idleTimer = window.setTimeout(() => {
        target = 0;
        wake();
      }, idleAfter);
      wake();
    };

    ACTIVITY.forEach((type) => window.addEventListener(type, activity, { passive: true }));
    document.addEventListener('visibilitychange', evaluate);
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      evaluate();
    });
    io.observe(root);

    activity();

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(idleTimer);
      ACTIVITY.forEach((type) => window.removeEventListener(type, activity));
      document.removeEventListener('visibilitychange', evaluate);
      io.disconnect();
    };
  }, [idleAfter, breath, reduced]);

  return (
    <div ref={box} className={className} style={{ ['--attention' as string]: 1, ['--breath' as string]: 0 }}>
      {children}
    </div>
  );
}
