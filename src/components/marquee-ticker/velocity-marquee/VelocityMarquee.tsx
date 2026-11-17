// ui-63 — VelocityMarquee
import { useRef, type ReactNode, type RefObject } from 'react';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useScroller } from '@/lib/SmoothScroll';

/** Wraps v into [min, max) — keeps the marquee's x offset cycling forever. */
function wrap(min: number, max: number, v: number): number {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
}

export interface VelocityMarqueeProps {
  /** Items to loop. Rendered 4× so a 25% translation wraps seamlessly. */
  items?: ReactNode[];
  /** Alternative to `items`: a single node to loop. */
  children?: ReactNode;
  /**
   * Base speed in % of one chunk per second. Sign sets the resting direction
   * (negative = leftward start). Default 4.
   */
  baseVelocity?: number;
  className?: string;
}

/**
 * Infinite marquee whose speed and skew react to scroll velocity, and whose
 * direction flips with scroll direction. Reads the Lenis scroller from context
 * so `useScroll` tracks the smooth-scrolled container, not the window.
 *
 * Reduced motion: renders one static row — no rAF loop at all.
 */
export function VelocityMarquee({
  items,
  children,
  baseVelocity = 4,
  className = '',
}: VelocityMarqueeProps) {
  const reduced = useReducedMotion();
  const scrollerRef = useScroller();

  const baseX = useMotionValue(0);
  const { scrollY } = useScroll({
    container: (scrollerRef ?? undefined) as RefObject<HTMLElement> | undefined,
  });
  const scrollVelocity = useVelocity(scrollY);
  // Spring the raw px/s velocity so speed bursts decay smoothly.
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  // Map ±1000 px/s → ±4× speed multiplier. Unclamped: flinging harder keeps
  // accelerating the marquee.
  const velocityFactor = useTransform(smoothVelocity, [-1000, 1000], [-4, 4], {
    clamp: false,
  });
  // Skew leans the type against the scroll direction (clamped to ±10°).
  const skewX = useTransform(smoothVelocity, [-1500, 1500], [10, -10]);

  // 4 identical chunks → each chunk is 25% of the strip. Wrapping x within
  // [-25%, 0%) makes the loop invisible.
  const x = useTransform(baseX, (v) => `${wrap(-25, 0, v)}%`);

  const directionFactor = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    const vf = velocityFactor.get();
    // Scroll direction flips the travel direction and sticks until reversed.
    if (vf < 0) directionFactor.current = -1;
    else if (vf > 0) directionFactor.current = 1;

    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    // Scroll velocity multiplies the base speed (|vf| of 4 → 5× total).
    moveBy += moveBy * Math.abs(vf);
    baseX.set(baseX.get() + moveBy);
  });

  const content = items ?? [children];

  if (reduced) {
    return (
      <div className={`overflow-hidden whitespace-nowrap ${className}`}>
        <div className="flex w-max items-center">
          <Chunk content={content} ariaHidden={false} />
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <motion.div className="flex w-max items-center will-change-transform" style={{ x, skewX }}>
        {[0, 1, 2, 3].map((i) => (
          <Chunk key={i} content={content} ariaHidden={i > 0} />
        ))}
      </motion.div>
    </div>
  );
}

function Chunk({ content, ariaHidden }: { content: ReactNode[]; ariaHidden: boolean }) {
  return (
    <div aria-hidden={ariaHidden || undefined} className="flex shrink-0 items-center">
      {content.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="px-6">{item}</span>
          <span aria-hidden className="text-vermilion">
            ✺
          </span>
        </span>
      ))}
    </div>
  );
}
