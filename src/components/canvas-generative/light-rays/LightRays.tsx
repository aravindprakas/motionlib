// LightRays — additive canvas god-rays from an off-frame source
import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScroller } from '@/lib/SmoothScroll';
import { hexToRgb } from '@/lib/palette';

export interface LightRaysProps {
  /** How many rays fan out of the source. Default 16. */
  rays?: number;
  /** Ray colour — a hex string, or several to cycle across the fan. */
  color?: string | string[];
  /** Source position as a fraction of the box. Default [0.5, -0.12] — just above the top edge. */
  origin?: [number, number];
  /** Direction the fan points, in degrees. 90 = straight down. Default 90. */
  angle?: number;
  /** Total angular width of the fan, in degrees. Default 60. */
  spread?: number;
  /** How far down the box a ray reaches, as a fraction. Default 1.15. */
  length?: number;
  /** Peak opacity of a single ray. Default 0.22. */
  intensity?: number;
  /** Shimmer speed. Default 1. */
  speed?: number;
  /** CSS blur on the canvas, in px — this is what makes it read as light. Default 14. */
  blur?: number;
  /** Warm bloom at the source. Default true. */
  bloom?: boolean;
  /** Fade the rays out toward the far end. Default true. */
  fade?: boolean;
  className?: string;
}

interface Ray {
  angle: number; // radians, base direction
  width: number; // radians, half-width of the wedge
  drift: number; // radians of sway
  phase: number;
  rate: number; // shimmer rate
  weight: number; // per-ray opacity multiplier
  color: [number, number, number];
}

const DEG = Math.PI / 180;

/**
 * A source point sits off-frame and throws N soft wedges across the box. Each
 * wedge is filled with a linear gradient along its own axis and composited
 * with `lighter`, so overlaps bloom the way real light does instead of
 * stacking into flat opacity. Width, sway and brightness each ride their own
 * sine at a different rate, which keeps the shimmer from ever visibly looping.
 *
 * The softness is a CSS blur on the canvas element, not `ctx.filter` — the
 * compositor handles it on the GPU for free, where a per-frame canvas filter
 * would cost a full-surface repaint every tick.
 *
 * Sized in device pixels, paused off-screen via an IntersectionObserver rooted
 * on the ambient scroller. Reduced motion paints one static frame and never
 * starts the loop.
 */
export function LightRays({
  rays = 16,
  color = '#ffffff',
  origin = [0.5, -0.12],
  angle = 90,
  spread = 60,
  length = 1.15,
  intensity = 0.22,
  speed = 1,
  blur = 14,
  bloom = true,
  fade = true,
  className = '',
}: LightRaysProps) {
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

    const palette = (Array.isArray(color) ? color : [color]).map(hexToRgb);
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let t = 0;
    let visible = true;

    // Deterministic pseudo-random so the fan is stable across remounts.
    const rand = (n: number) => {
      const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
      return s - Math.floor(s);
    };

    // Built once — the loop only re-reads these, never reallocates.
    const fan: Ray[] = [];
    for (let i = 0; i < rays; i++) {
      const slot = rays === 1 ? 0.5 : i / (rays - 1);
      const jitter = (rand(i) - 0.5) * (spread / rays) * 1.6;
      fan.push({
        angle: (angle - spread / 2 + slot * spread + jitter) * DEG,
        width: (spread / rays) * (0.35 + rand(i + 11) * 0.9) * DEG,
        drift: (0.6 + rand(i + 23) * 1.6) * DEG,
        phase: rand(i + 37) * Math.PI * 2,
        rate: 0.35 + rand(i + 53) * 0.7,
        // Rays near the centre of the fan read brighter.
        weight: (0.45 + rand(i + 71) * 0.55) * (1 - Math.abs(slot - 0.5) * 0.7),
        color: palette[i % palette.length],
      });
    }

    const fit = () => {
      const r = host.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * DPR));
      canvas.height = Math.max(1, Math.round(r.height * DPR));
    };

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';

      const ox = origin[0] * W;
      const oy = origin[1] * H;
      const reach = Math.hypot(W, H) * length;

      for (let i = 0; i < fan.length; i++) {
        const ray = fan[i];
        const osc = Math.sin(t * ray.rate + ray.phase);
        const a = ray.angle + osc * ray.drift;
        const half = ray.width * (0.75 + (osc * 0.5 + 0.5) * 0.6);
        const alpha = intensity * ray.weight * (0.4 + (Math.sin(t * ray.rate * 1.7 + ray.phase) * 0.5 + 0.5) * 0.6);

        const ex = ox + Math.cos(a) * reach;
        const ey = oy + Math.sin(a) * reach;
        const [r, g, b] = ray.color;

        const grad = ctx.createLinearGradient(ox, oy, ex, ey);
        grad.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
        grad.addColorStop(0.35, `rgba(${r},${g},${b},${alpha * 0.65})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},${fade ? 0 : alpha * 0.2})`);

        // Wedge: a short chord at the source (so rays don't pinch to a point)
        // opening out to the full width at the far end.
        const nub = reach * 0.02;
        ctx.beginPath();
        ctx.moveTo(ox + Math.cos(a - half * 0.2) * nub, oy + Math.sin(a - half * 0.2) * nub);
        ctx.lineTo(ox + Math.cos(a - half) * reach, oy + Math.sin(a - half) * reach);
        ctx.lineTo(ox + Math.cos(a + half) * reach, oy + Math.sin(a + half) * reach);
        ctx.lineTo(ox + Math.cos(a + half * 0.2) * nub, oy + Math.sin(a + half * 0.2) * nub);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      }

      if (bloom) {
        const [r, g, b] = palette[0];
        const rad = Math.min(W, H) * 0.55;
        const pulse = 0.5 + (Math.sin(t * 0.5) * 0.5 + 0.5) * 0.5;
        const glow = ctx.createRadialGradient(ox, oy, 0, ox, oy, rad);
        glow.addColorStop(0, `rgba(${r},${g},${b},${intensity * 1.6 * pulse})`);
        glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(ox, oy, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
    };

    const ro = new ResizeObserver(() => {
      fit();
      draw();
    });
    ro.observe(host);
    fit();
    draw();

    if (reduced) {
      return () => ro.disconnect();
    }

    const frame = () => {
      if (visible) {
        t += 0.012 * speed;
        draw();
      }
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver((entries) => (visible = entries[0].isIntersecting), {
      root: scrollerRef?.current ?? null,
      threshold: 0,
    });
    io.observe(host);
    frame();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [
    reduced,
    rays,
    color,
    origin,
    angle,
    spread,
    length,
    intensity,
    speed,
    bloom,
    fade,
    scrollerRef,
  ]);

  return (
    <div ref={hostRef} className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {/* Bled past the edges so the CSS blur never reveals the canvas boundary. */}
      <canvas
        ref={canvasRef}
        className="absolute -inset-[8%] h-[116%] w-[116%]"
        style={{ filter: blur ? `blur(${blur}px)` : undefined }}
      />
    </div>
  );
}
