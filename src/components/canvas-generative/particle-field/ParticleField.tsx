// ui-70 — ParticleField
import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

type Mode = 'particles' | 'mesh' | 'ascii';

export interface ParticleFieldProps {
  /** Which field to render. 'particles' (linked dots), 'mesh' (warping grid) or 'ascii'. */
  mode?: Mode;
  /** Base dot / line colour, hex. Default bone. */
  dotColor?: string;
  /** Cursor-proximity accent colour, hex. Default vermilion. */
  accentColor?: string;
  className?: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace('#', '');
  return [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16)];
}

/**
 * Cursor-reactive canvas field that fills its positioned parent. Particles
 * drift, wrap and are nudged away from the pointer while drawing an accent
 * link when close; 'mesh' warps a grid toward the cursor; 'ascii' scrambles a
 * character grid that brightens near the pointer. One rAF loop, pooled arrays.
 *
 * Reduced motion: paints a single static frame and never animates.
 */
export function ParticleField({
  mode = 'particles',
  dotColor = '#ece6d8',
  accentColor = '#ff4d23',
  className = '',
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ink = hexToRgb(dotColor);
    const accent = hexToRgb(accentColor);
    let raf = 0;
    let dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0;
    let H = 0;
    let mx = -9999;
    let my = -9999;

    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number };
    let parts: P[] = [];
    let cols = 0;
    let rows = 0;
    let chars: { c: string; a: number }[] = [];
    const ACHARS = '01<>/\\|-=+*#$@%&';

    const initParticles = () => {
      const N = Math.min(700, Math.floor((W * H) / 2600));
      parts = Array.from({ length: N }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.4 + 0.4,
        a: Math.random() * 0.4 + 0.1,
      }));
    };
    const initAscii = () => {
      const fs = 14;
      cols = Math.floor(W / fs);
      rows = Math.floor(H / fs);
      chars = Array.from({ length: cols * rows }, () => ({
        c: ACHARS[(Math.random() * ACHARS.length) | 0],
        a: Math.random() * 0.3,
      }));
    };

    const size = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = parent.clientWidth;
      H = parent.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (mode === 'particles') initParticles();
      if (mode === 'ascii') initAscii();
    };

    const drawParticles = () => {
      const [r, g, b] = ink;
      const [ar, ag, ab] = accent;
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = `rgba(${r},${g},${b},0.04)`;
      ctx.lineWidth = 1;
      const step = 80;
      for (let x = 0; x < W; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      const baseFill = `rgba(${r},${g},${b},`;
      ctx.lineWidth = 0.7;
      for (const p of parts) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const d2 = dx * dx + dy * dy;
        if (!reduced) {
          if (d2 < 22500) {
            const d = Math.sqrt(d2) || 1;
            const f = (150 - d) * 0.0024;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.98;
          p.vy *= 0.98;
          if (p.x < 0) p.x += W;
          if (p.x > W) p.x -= W;
          if (p.y < 0) p.y += H;
          if (p.y > H) p.y -= H;
        }
        ctx.fillStyle = baseFill + p.a + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        if (d2 < 30000) {
          ctx.strokeStyle = `rgba(${ar},${ag},${ab},${(1 - d2 / 30000) * 0.45})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mx, my);
          ctx.stroke();
        }
      }
    };

    const drawMesh = (t: number) => {
      const [r, g, b] = ink;
      const [ar, ag, ab] = accent;
      ctx.clearRect(0, 0, W, H);
      const c = 38;
      const rw = 22;
      const cw = W / c;
      const ch = H / rw;
      ctx.lineWidth = 0.6;
      for (let y = 0; y <= rw; y++) {
        ctx.beginPath();
        for (let x = 0; x <= c; x++) {
          const px = x * cw;
          const py = y * ch;
          const dxm = px - mx;
          const dym = py - my;
          const dm = Math.hypot(dxm, dym);
          const wave = Math.sin(x * 0.4 + t * 0.0014) * 6 + Math.cos(y * 0.5 + t * 0.0011) * 6;
          const pull = dm < 240 ? ((240 - dm) / 240) * 24 : 0;
          const ox = px + wave + (dm ? (-dxm / dm) * pull : 0);
          const oy = py + wave * 0.6 + (dm ? (-dym / dm) * pull : 0);
          const col = dm < 240 ? `rgba(${ar},${ag},${ab},${0.5 - dm / 600})` : `rgba(${r},${g},${b},0.12)`;
          ctx.strokeStyle = col;
          if (x === 0) ctx.moveTo(ox, oy);
          else {
            ctx.lineTo(ox, oy);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(ox, oy);
          }
        }
        ctx.stroke();
      }
    };

    const drawAscii = () => {
      const fs = 14;
      const [r, g, b] = ink;
      const [ar, ag, ab] = accent;
      ctx.clearRect(0, 0, W, H);
      ctx.font = `400 ${fs - 1}px "Space Mono", monospace`;
      ctx.textBaseline = 'top';
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const ch = chars[y * cols + x];
          if (!ch) continue;
          const px = x * fs;
          const py = y * fs;
          const d = Math.hypot(px - mx, py - my);
          const near = d < 160;
          const a = ch.a + (near ? ((160 - d) / 160) * 0.6 : 0);
          if (!reduced && Math.random() < (near ? 0.04 : 0.003)) ch.c = ACHARS[(Math.random() * ACHARS.length) | 0];
          ctx.fillStyle = near
            ? `rgba(${ar},${ag},${ab},${Math.min(1, a)})`
            : `rgba(${r},${g},${b},${Math.min(0.5, a * 0.5)})`;
          ctx.fillText(ch.c, px, py);
        }
      }
    };

    const start = performance.now();
    const frame = () => {
      const t = performance.now() - start;
      if (mode === 'mesh') drawMesh(t);
      else if (mode === 'ascii') drawAscii();
      else drawParticles();
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
    };
    const onLeave = () => {
      mx = -9999;
      my = -9999;
    };

    const ro = new ResizeObserver(() => size());
    ro.observe(parent);
    canvas.addEventListener('pointermove', onMove, { passive: true });
    canvas.addEventListener('pointerleave', onLeave);

    size();
    if (reduced) {
      // Single static frame — no loop.
      if (mode === 'mesh') drawMesh(0);
      else if (mode === 'ascii') drawAscii();
      else drawParticles();
    } else {
      frame();
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, [mode, dotColor, accentColor, reduced]);

  return <canvas ref={canvasRef} className={`absolute inset-0 h-full w-full ${className}`} />;
}
