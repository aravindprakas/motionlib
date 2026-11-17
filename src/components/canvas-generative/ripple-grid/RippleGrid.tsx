// ui-73 — RippleGrid
import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScroller } from '@/lib/SmoothScroll';
import { SET2 } from '@/lib/palette';

export interface RippleGridProps {
  /** Spacing between dots in CSS px. Default 30. */
  gap?: number;
  /** Resting dot colour. Default navy. */
  baseColor?: string;
  /** Colour of dots the wave is passing through. Default accent. */
  hotColor?: string;
  tip?: string;
  className?: string;
}

/**
 * Grid of square dots on canvas. A click drops a ripple whose expanding band
 * lifts and tints the dots it crosses; up to six ripples run at once and expire
 * on their own. Sized in device pixels, paused off-screen.
 *
 * Reduced motion: the resting dot grid is painted once — clicks add no waves.
 */
export function RippleGrid({
  gap = 30,
  baseColor = SET2.navy,
  hotColor = SET2.accent,
  tip = 'click anywhere inside',
  className = '',
}: RippleGridProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const scrollerRef = useScroller();

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const G = gap * DPR;
    let dots: { x: number; y: number }[] = [];
    let ripples: { x: number; y: number; t: number }[] = [];
    let raf = 0;
    let visible = true;

    const build = () => {
      const r = host.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * DPR));
      canvas.height = Math.max(1, Math.round(r.height * DPR));
      dots = [];
      for (let y = G / 2; y < canvas.height; y += G)
        for (let x = G / 2; x < canvas.width; x += G) dots.push({ x, y });
    };
    const square = (x: number, y: number, half: number) => ctx.fillRect(x - half, y - half, half * 2, half * 2);
    const staticDraw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = baseColor;
      ctx.globalAlpha = 0.28;
      for (const d of dots) square(d.x, d.y, 1.6 * DPR);
      ctx.globalAlpha = 1;
    };
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ripples.forEach((rp) => (rp.t += 0.012));
      ripples = ripples.filter((rp) => rp.t < 1.4);
      for (const d of dots) {
        let lift = 0;
        for (const rp of ripples) {
          const dist = Math.hypot(d.x - rp.x, d.y - rp.y) / DPR;
          const band = Math.abs(dist - rp.t * 520);
          if (band < 60) lift += (1 - band / 60) * (1 - rp.t / 1.4);
        }
        lift = Math.min(1, lift);
        ctx.fillStyle = lift > 0.05 ? hotColor : baseColor;
        ctx.globalAlpha = 0.28 + lift * 0.72;
        square(d.x, d.y, (1.6 + lift * 4) * DPR);
      }
      ctx.globalAlpha = 1;
    };
    const addRipple = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      ripples.push({ x: (e.clientX - r.left) * DPR, y: (e.clientY - r.top) * DPR, t: 0 });
      if (ripples.length > 6) ripples.shift();
    };

    const ro = new ResizeObserver(() => {
      build();
      (reduced ? staticDraw : draw)();
    });
    ro.observe(host);
    build();

    if (reduced) {
      staticDraw();
      return () => ro.disconnect();
    }

    host.addEventListener('pointerdown', addRipple);
    const frame = () => {
      if (visible) draw();
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver((en) => (visible = en[0].isIntersecting), {
      root: scrollerRef?.current ?? null,
      threshold: 0,
    });
    io.observe(host);
    frame();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener('pointerdown', addRipple);
    };
  }, [reduced, gap, baseColor, hotColor, scrollerRef]);

  return (
    <div
      ref={hostRef}
      className={`relative h-[62vh] cursor-crosshair touch-none overflow-hidden border border-navy-line bg-cream ${className}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <span className="pointer-events-none absolute bottom-5 left-0 right-0 text-center font-mono text-xs uppercase tracking-[0.16em] text-navy-soft">
        {tip}
      </span>
    </div>
  );
}
