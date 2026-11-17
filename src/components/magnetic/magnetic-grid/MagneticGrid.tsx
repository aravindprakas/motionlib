// ui-9 — MagneticGrid
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { SET2_RAMP } from '@/lib/palette';

export interface MagneticGridProps {
  /** Number of tiles. Default 12. */
  count?: number;
  /** Per-tile colour ramp, cycled by index. */
  colors?: string[];
  /** Pointer activation radius in px, per tile. Default 260. */
  radius?: number;
  className?: string;
}

/**
 * Grid of tiles that lean toward the cursor: each tile translates and tilts in
 * 3D proportional to how close the pointer is, via one reused `quickTo` tween
 * per axis (zero allocation per pointer event). Falloff is linear to `radius`.
 *
 * Touch / reduced motion: renders a static grid — no listeners, no tweens.
 */
export function MagneticGrid({
  count = 12,
  colors = SET2_RAMP,
  radius = 260,
  className = '',
}: MagneticGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || typeof window === 'undefined') return;
    if (window.matchMedia('(hover: none)').matches) return;
    const grid = gridRef.current;
    if (!grid) return;

    const tiles = Array.from(grid.querySelectorAll<HTMLElement>('[data-tile]'));
    const setters = tiles.map((el) => ({
      el,
      x: gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' }),
      y: gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' }),
      rx: gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3' }),
      ry: gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3' }),
    }));

    const onMove = (e: PointerEvent) => {
      setters.forEach((s) => {
        const r = s.el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const pull = Math.max(0, 1 - Math.hypot(dx, dy) / radius);
        s.x(dx * 0.12 * pull);
        s.y(dy * 0.12 * pull);
        s.ry(dx * 0.05 * pull);
        s.rx(-dy * 0.05 * pull);
      });
    };
    const onLeave = () => setters.forEach((s) => { s.x(0); s.y(0); s.rx(0); s.ry(0); });

    grid.addEventListener('pointermove', onMove);
    grid.addEventListener('pointerleave', onLeave);
    return () => {
      grid.removeEventListener('pointermove', onMove);
      grid.removeEventListener('pointerleave', onLeave);
      gsap.killTweensOf(tiles);
      gsap.set(tiles, { x: 0, y: 0, rotationX: 0, rotationY: 0 });
    };
  }, [reduced, radius, count]);

  return (
    <div
      ref={gridRef}
      className={`grid grid-cols-3 gap-[14px] min-[520px]:grid-cols-4 min-[900px]:grid-cols-6 ${className}`}
      style={{ perspective: 900 }}
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          data-tile
          className="grid aspect-square place-items-center font-mono text-[13px] font-semibold text-cream will-change-transform [transform-style:preserve-3d]"
          style={{ background: colors[i % colors.length] }}
        >
          <span className="opacity-85">{String(i + 1).padStart(2, '0')}</span>
        </div>
      ))}
    </div>
  );
}
