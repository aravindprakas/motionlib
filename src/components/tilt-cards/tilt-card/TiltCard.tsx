// ui-10 — TiltCard
import { createContext, useContext, type PointerEvent, type ReactNode } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { useReducedMotion } from '@/lib/useReducedMotion';

interface TiltContextValue {
  /** Sprung, normalized pointer position: -0.5 … 0.5 on each axis. */
  sx: MotionValue<number>;
  sy: MotionValue<number>;
}

const TiltContext = createContext<TiltContextValue | null>(null);

export interface TiltCardProps {
  /** Max tilt in degrees when the pointer reaches a card edge. Default 12. */
  intensity?: number;
  /** Bone-tinted light sweep that tracks the pointer. Default true. */
  glare?: boolean;
  className?: string;
  children: ReactNode;
}

const TILT_SPRING = { stiffness: 260, damping: 22, mass: 0.9 };

/**
 * 3D pointer-tilt card. Pointer position is normalized to -0.5…0.5, sprung,
 * then mapped to rotateX/rotateY. Children can opt into parallax depth via
 * `TiltCardLayer` (translateZ + counter-shift).
 *
 * Reduced motion: static card — no listeners, no transforms.
 */
export function TiltCard({
  intensity = 12,
  glare = true,
  className = '',
  children,
}: TiltCardProps) {
  const reduced = useReducedMotion();

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const glareRaw = useMotionValue(0);
  const sx = useSpring(px, TILT_SPRING);
  const sy = useSpring(py, TILT_SPRING);

  // Pointer at right edge (px = +0.5) → rotateY = +intensity: the card's
  // right side dips toward the cursor. Vertical axis is inverted so the top
  // dips when the pointer is at the top.
  const rotateY = useTransform(sx, (v) => v * 2 * intensity);
  const rotateX = useTransform(sy, (v) => v * -2 * intensity);
  // Glare sweeps well past both edges so it fully exits the card.
  const glareX = useTransform(sx, [-0.5, 0.5], ['-120%', '220%']);
  const glareOpacity = useSpring(glareRaw, { stiffness: 180, damping: 28 });

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };

  const onPointerEnter = () => {
    if (!reduced) glareRaw.set(1);
  };

  const onPointerLeave = () => {
    px.set(0);
    py.set(0);
    glareRaw.set(0);
  };

  return (
    <div style={{ perspective: 1000 }} className={className}>
      <motion.div
        onPointerMove={onPointerMove}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        style={reduced ? undefined : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative h-full w-full border border-ink bg-bone will-change-transform"
      >
        <TiltContext.Provider value={{ sx, sy }}>{children}</TiltContext.Provider>

        {glare && !reduced && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={{ transform: 'translateZ(2px)' }}
          >
            <motion.div
              className="absolute inset-y-0 w-1/2 will-change-transform"
              style={{
                x: glareX,
                opacity: glareOpacity,
                background:
                  'linear-gradient(100deg, transparent 20%, rgba(236, 230, 216, 0.6) 50%, transparent 80%)',
              }}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}

export interface TiltCardLayerProps {
  /**
   * translateZ in px. Positive lifts the layer toward the viewer (more
   * parallax); negative pushes it behind the card plane. Default 0.
   */
  depth?: number;
  className?: string;
  children?: ReactNode;
}

/**
 * Depth layer for TiltCard children. Besides translateZ, layers counter-shift
 * against the pointer proportionally to depth — foreground layers appear to
 * lift, background layers drift the other way.
 */
export function TiltCardLayer({ depth = 0, className = '', children }: TiltCardLayerProps) {
  const ctx = useContext(TiltContext);
  const reduced = useReducedMotion();
  const zero = useMotionValue(0);

  // 0.6 px of counter-shift per px of depth per half-card of pointer travel.
  const x = useTransform(ctx?.sx ?? zero, (v) => v * -depth * 0.6);
  const y = useTransform(ctx?.sy ?? zero, (v) => v * -depth * 0.6);

  const style = reduced || !ctx ? undefined : { x, y, z: depth };
  return (
    <motion.div className={className} style={style}>
      {children}
    </motion.div>
  );
}
