// ComicText — halftone comic-book lettering with a springy pop-in
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface ComicTextProps {
  /** The word. Kept to a single line by design — this is a sound effect, not a paragraph. */
  children: string;
  /** Cap height in rem. Default 5. */
  fontSize?: number;
  /** Letter fill behind the halftone dots. Default gold. */
  color?: string;
  /** Halftone dot colour. Default vermilion. */
  dotColor?: string;
  /** Outer ink outline. Default near-black. */
  strokeColor?: string;
  /** Inner outline sitting between fill and ink. Default bone. */
  innerColor?: string;
  /** Hard drop shadow. Default near-black. */
  shadowColor?: string;
  /** Tilt of the whole word in degrees. Default -4. */
  tilt?: number;
  /** Halftone dot pitch in px. Default 9. */
  dotSize?: number;
  /** Draw a jagged impact burst behind the word. Default false. */
  burst?: boolean;
  /** Burst colour. Default the dot colour. */
  burstColor?: string;
  /** 'view' pops once on entry, 'hover' on pointer-enter, 'mount' immediately. Default 'view'. */
  trigger?: 'view' | 'hover' | 'mount';
  className?: string;
}

/**
 * Comic lettering built as one SVG: a hard offset shadow, a heavy ink outline
 * and a thin inner outline are three stacked `<text>` runs drawn with
 * `paint-order: stroke`, so each stroke sits behind the glyph instead of
 * eating into it. The face is a userSpace `<pattern>` of dots over a flat
 * fill — a real halftone, so it stays crisp at any size and never tiles
 * visibly across letters.
 *
 * The box is measured from `getBBox()` after fonts settle rather than guessed
 * from character count, so the outline and burst always fit the actual glyphs.
 *
 * No canvas, no images, no animation library — the pop is a single springy CSS
 * transform, skipped under reduced motion.
 */
export function ComicText({
  children,
  fontSize = 5,
  color = '#e8a23d',
  dotColor = '#ff4d23',
  strokeColor = '#0c0b0e',
  innerColor = '#ece6d8',
  shadowColor = '#0c0b0e',
  tilt = -4,
  dotSize = 9,
  burst = false,
  burstColor,
  trigger = 'view',
  className = '',
}: ComicTextProps) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, '');
  const dotsId = `comic-dots-${uid}`;

  const hostRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const [box, setBox] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [popped, setPopped] = useState(false);
  const reduced = useReducedMotion();

  const px = fontSize * 16;
  const inkWidth = px * 0.14;
  const innerWidth = px * 0.06;
  const shadow = px * 0.055;
  const pad = inkWidth + shadow + (burst ? px * 0.55 : px * 0.12);

  // Measure the real glyph box; re-measure once webfonts land, since the
  // display face changes the metrics out from under the first pass.
  useLayoutEffect(() => {
    const measure = () => {
      const el = textRef.current;
      if (!el) return;
      try {
        const b = el.getBBox();
        setBox({ x: b.x, y: b.y, w: b.width, h: b.height });
      } catch {
        /* not laid out yet */
      }
    };
    measure();
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    fonts?.ready.then(measure).catch(() => undefined);
  }, [children, fontSize, px]);

  useEffect(() => {
    if (reduced || trigger === 'mount') {
      setPopped(true);
      return;
    }
    if (trigger !== 'view') return;
    const host = hostRef.current;
    if (!host) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPopped(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(host);
    return () => io.disconnect();
  }, [trigger, reduced]);

  // Jagged starburst sized to the measured word.
  const burstPath = useMemo(() => {
    if (!burst || !box.w) return '';
    const cx = box.x + box.w / 2;
    const cy = box.y + box.h / 2;
    const rx = box.w / 2 + px * 0.5;
    const ry = box.h / 2 + px * 0.45;
    const spikes = 18;
    let d = '';
    for (let i = 0; i < spikes * 2; i++) {
      const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
      const wob = i % 2 === 0 ? 1 : 0.66 + ((i * 37) % 11) / 55;
      const x = cx + Math.cos(a) * rx * wob;
      const y = cy + Math.sin(a) * ry * wob;
      d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)} `;
    }
    return `${d}Z`;
  }, [burst, box, px]);

  const textProps = {
    x: 0,
    y: 0,
    fontSize: px,
    fontWeight: 700,
    fontFamily: '"Space Grotesk", system-ui, sans-serif',
    letterSpacing: px * -0.02,
    style: { paintOrder: 'stroke' as const },
  };

  return (
    <span
      ref={hostRef}
      className={`inline-block ${className}`}
      onPointerEnter={trigger === 'hover' ? () => setPopped(true) : undefined}
    >
      <svg
        role="img"
        aria-label={children}
        width={box.w ? box.w + pad * 2 : 0}
        height={box.h ? box.h + pad * 2 : 0}
        viewBox={box.w ? `${box.x - pad} ${box.y - pad} ${box.w + pad * 2} ${box.h + pad * 2}` : undefined}
        className="overflow-visible"
        style={{
          transformOrigin: 'center',
          transform: popped
            ? `scale(1) rotate(${tilt}deg)`
            : `scale(0.35) rotate(${tilt - 14}deg)`,
          opacity: popped ? 1 : 0,
          transition: reduced
            ? undefined
            : 'transform 520ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 220ms ease-out',
        }}
      >
        <defs>
          <pattern id={dotsId} patternUnits="userSpaceOnUse" width={dotSize} height={dotSize}>
            <rect width={dotSize} height={dotSize} fill={color} />
            <circle cx={dotSize * 0.25} cy={dotSize * 0.25} r={dotSize * 0.22} fill={dotColor} />
            <circle cx={dotSize * 0.75} cy={dotSize * 0.75} r={dotSize * 0.22} fill={dotColor} />
          </pattern>
        </defs>

        {burst && (
          <path
            d={burstPath}
            fill={burstColor ?? dotColor}
            stroke={strokeColor}
            strokeWidth={px * 0.05}
            strokeLinejoin="round"
            opacity={0.9}
          />
        )}

        {/* Hard offset shadow. */}
        <text
          {...textProps}
          transform={`translate(${shadow} ${shadow})`}
          fill={shadowColor}
          stroke={shadowColor}
          strokeWidth={inkWidth}
          strokeLinejoin="round"
        >
          {children}
        </text>

        {/* Heavy ink outline. */}
        <text {...textProps} fill={strokeColor} stroke={strokeColor} strokeWidth={inkWidth} strokeLinejoin="round">
          {children}
        </text>

        {/* Thin inner outline. */}
        <text {...textProps} fill={innerColor} stroke={innerColor} strokeWidth={innerWidth} strokeLinejoin="round">
          {children}
        </text>

        {/* Halftone face — also the node we measure. */}
        <text ref={textRef} {...textProps} fill={`url(#${dotsId})`}>
          {children}
        </text>
      </svg>
    </span>
  );
}
