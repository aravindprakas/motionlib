// ui-74 — ConfettiBurst
import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScroller } from '@/lib/SmoothScroll';
import { SET2_RAMP, hexToRgb } from '@/lib/palette';

export interface ConfettiBurstProps {
  label?: string;
  /** Particle colours, picked at random. */
  colors?: string[];
  /** Particles per burst. Default 90. */
  count?: number;
  className?: string;
}

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  c: [number, number, number];
  life: number;
  sz: number;
  rot: number;
  vr: number;
};

/**
 * Button that fires a token-coloured confetti burst from its own centre, with
 * gravity, drag, rotation and fade integrated on a single rAF loop (particle
 * pool capped so it can be mashed). Fires once when first scrolled into view;
 * paused while off-screen.
 *
 * Reduced motion: the button is fully usable but stays calm — no burst, no loop.
 */
export function ConfettiBurst({ label = 'Ship it ✦', colors = SET2_RAMP, count = 90, className = '' }: ConfettiBurstProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();
  const scrollerRef = useScroller();

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const btn = btnRef.current;
    if (!host || !canvas || !btn) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (reduced) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const rgb = colors.map(hexToRgb);
    let parts: Particle[] = [];
    let raf = 0;
    let visible = true;

    const fit = () => {
      const r = host.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * DPR));
      canvas.height = Math.max(1, Math.round(r.height * DPR));
    };
    const burst = () => {
      const r = btn.getBoundingClientRect();
      const cr = canvas.getBoundingClientRect();
      const ox = (r.left + r.width / 2 - cr.left) * DPR;
      const oy = (r.top + r.height / 2 - cr.top) * DPR;
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = (3 + Math.random() * 9) * DPR;
        parts.push({
          x: ox,
          y: oy,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 4 * DPR,
          c: rgb[(Math.random() * rgb.length) | 0],
          life: 1,
          sz: (3 + Math.random() * 4) * DPR,
          rot: Math.random() * 6.28,
          vr: (Math.random() - 0.5) * 0.4,
        });
      }
      if (parts.length > 400) parts.splice(0, parts.length - 400);
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.vy += 0.35 * DPR;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= 0.012;
        if (p.life <= 0 || p.y > canvas.height + 40) {
          parts.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = `rgb(${p.c[0]},${p.c[1]},${p.c[2]})`;
        ctx.fillRect(-p.sz / 2, -p.sz / 2, p.sz, p.sz * 1.6);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    };

    const ro = new ResizeObserver(fit);
    ro.observe(host);
    fit();

    btn.addEventListener('click', burst);
    const frame = () => {
      if (visible) draw();
      raf = requestAnimationFrame(frame);
    };
    let fired = false;
    const io = new IntersectionObserver(
      (en) => {
        visible = en[0].isIntersecting;
        if (visible && !fired) {
          fired = true;
          burst();
        }
      },
      { root: scrollerRef?.current ?? null, threshold: 0.4 },
    );
    io.observe(host);
    frame();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      btn.removeEventListener('click', burst);
    };
  }, [reduced, colors, count, scrollerRef]);

  return (
    <div ref={hostRef} className={`relative grid h-[56vh] place-items-center overflow-hidden bg-navy-900 ${className}`}>
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
      <button
        ref={btnRef}
        className="relative z-[1] bg-coral px-[42px] py-5 text-lg font-semibold tracking-[0.01em] text-cream transition-transform duration-200 will-change-transform active:scale-95"
      >
        {label}
      </button>
    </div>
  );
}
