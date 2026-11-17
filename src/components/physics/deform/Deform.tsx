// Deform — squash and stretch derived from an element's own movement
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface DeformProps {
  children: ReactNode;
  /** Stretch per 1000px/s of travel. 0.2 is lively, 0.08 is furniture. */
  amount?: number;
  /** Velocity smoothing, 0 → 1. Higher trails further behind the movement. */
  smoothing?: number;
  /** Hard ceiling on the stretch factor, so a teleport cannot shear the box. */
  max?: number;
  /** Also lean the element back against its own acceleration. */
  lean?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Squashes and stretches an element along whatever direction it happens to be
 * moving — without being told that it is moving, or by what.
 *
 * Squash and stretch is the oldest trick in animation and almost nothing on the
 * web does it, because the usual way in is to know the animation: you are the
 * spring, so you can derive the deformation from your own velocity. That only
 * works for motion you own. This element instead *watches itself*: each frame it
 * measures its own box, differentiates position to get velocity, and applies the
 * deformation to an inner wrapper — rotate to the heading, scale along and
 * across it, rotate back. Because the measurement is of the real rendered
 * position, the source is irrelevant: a CSS transition, a drag, a layout shift,
 * a parent carousel, another library's spring. Anything that moves it deforms it.
 *
 * The measured element and the deformed element are deliberately different nodes
 * — reading a box you are also scaling is how you build a feedback loop that
 * shakes itself apart. Reduced motion renders the wrapper inert.
 */
export function Deform({
  children,
  amount = 0.16,
  smoothing = 0.72,
  max = 1.4,
  lean = 0,
  className = '',
  style,
}: DeformProps) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const shell = outer.current;
    const skin = inner.current;
    if (!shell || !skin || reduced) return;

    let px = 0;
    let py = 0;
    let vx = 0;
    let vy = 0;
    let seeded = false;
    let visible = true;
    let raf = 0;

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(frame);
    });
    io.observe(shell);

    function frame() {
      const r = shell!.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;

      if (!seeded) {
        px = x;
        py = y;
        seeded = true;
      }

      // Per-frame delta is velocity in px/frame; scale to px/s for readable props.
      const dx = (x - px) * 60;
      const dy = (y - py) * 60;
      px = x;
      py = y;
      vx += (dx - vx) * (1 - smoothing);
      vy += (dy - vy) * (1 - smoothing);

      const speed = Math.hypot(vx, vy);
      const stretch = Math.min(max, 1 + (speed / 1000) * amount);
      const squash = 1 / stretch;
      const angle = (Math.atan2(vy, vx) * 180) / Math.PI;
      const tilt = lean ? Math.max(-18, Math.min(18, (-vx / 1000) * lean * 18)) : 0;

      skin!.style.transform =
        speed < 12
          ? tilt
            ? `rotate(${tilt.toFixed(2)}deg)`
            : 'none'
          : `rotate(${angle.toFixed(2)}deg) scale(${stretch.toFixed(4)}, ${squash.toFixed(4)}) rotate(${(-angle).toFixed(2)}deg)` +
            (tilt ? ` rotate(${tilt.toFixed(2)}deg)` : '');

      raf = visible ? requestAnimationFrame(frame) : 0;
    }

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      skin.style.transform = '';
    };
  }, [amount, smoothing, max, lean, reduced]);

  return (
    <div ref={outer} className={className} style={style}>
      {/* The wrapper fills its parent so it stays layout-transparent: against an
          auto-height box these percentages resolve to auto and change nothing,
          and against a sized box the children still see the size they expect. */}
      <div ref={inner} style={{ width: '100%', height: '100%', willChange: 'transform' }}>
        {children}
      </div>
    </div>
  );
}
