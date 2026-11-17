// ui-72 — WaveBars
import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScroller } from '@/lib/SmoothScroll';
import { SET2_RAMP, hexToRgb } from '@/lib/palette';

export interface WaveBarsProps {
  /** Number of bars. Default 50. */
  bars?: number;
  /** Bar colours, cycled by index. */
  colors?: string[];
  caption?: string;
  className?: string;
}

/**
 * Canvas waveform: N bars whose heights ride two overlapping sine waves, tinted
 * across the token ramp. One rAF loop, sized in device pixels, and paused the
 * instant it scrolls out of view via an IntersectionObserver rooted on the
 * ambient scroller.
 *
 * Reduced motion: a single static frame is painted; the loop never starts.
 */
export function WaveBars({
  bars = 50,
  colors = SET2_RAMP,
  caption = 'Fifty bars on overlapping sine waves, tinted across the token ramp.',
  className = '',
}: WaveBarsProps) {
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

    const rgb = colors.map(hexToRgb);
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let t = 0;
    let visible = true;

    const fit = () => {
      const r = host.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * DPR));
      canvas.height = Math.max(1, Math.round(r.height * DPR));
    };
    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const gap = W / bars;
      const bw = gap * 0.5;
      for (let i = 0; i < bars; i++) {
        const ph = i * 0.4;
        const amp =
          (Math.sin(t + ph) * 0.5 + 0.5) * 0.6 + (Math.sin(t * 1.7 + ph * 0.6) * 0.5 + 0.5) * 0.4;
        const bh = amp * H * 0.7;
        const c = rgb[i % rgb.length];
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},0.9)`;
        ctx.fillRect(i * gap + (gap - bw) / 2, (H - bh) / 2, bw, bh);
      }
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
        t += 0.06;
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
  }, [reduced, bars, colors, scrollerRef]);

  return (
    <div ref={hostRef} className={`relative h-[64vh] overflow-hidden bg-navy-900 ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {caption && (
        <div className="absolute bottom-[clamp(24px,5vw,48px)] left-[clamp(24px,5vw,56px)] z-[1] max-w-[30ch] text-sm text-cream/70">
          {caption}
        </div>
      )}
    </div>
  );
}
