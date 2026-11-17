// ZoomLoupe — hard-edged inspection lens for product detail shots
import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

export interface ZoomLoupeProps {
  src: string;
  alt: string;
  /** Magnification. Default 2.6. */
  zoom?: number;
  /** Lens edge length in px. Default 168. */
  size?: number;
  /** Readout of the region under the lens, e.g. a weave or stitch label. */
  caption?: string;
  className?: string;
}

/**
 * A square lens tracks the pointer over the product shot at 1:1 — deliberately
 * with zero easing or lag. A loupe that smooths its own motion feels like a
 * toy; a shopper checking a weave or a stitch wants the lens exactly where
 * their finger is, and any interpolation reads as the page lying about where
 * they are pointing.
 *
 * The magnified view is one `background-position` on one element, so no second
 * copy of the image is decoded and nothing re-layouts. Position is written
 * straight to `style` inside the pointer handler and never enters React state,
 * so a full-speed pointer stream costs zero renders.
 *
 * Square, not circular, and no drop shadow — the crop edge doubles as a
 * straightedge for judging alignment and scale.
 */
export function ZoomLoupe({
  src,
  alt,
  zoom = 2.6,
  size = 168,
  caption,
  className = '',
}: ZoomLoupeProps) {
  const figureRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  const track = (e: ReactPointerEvent<HTMLDivElement>) => {
    const figure = figureRef.current;
    const lens = lensRef.current;
    if (!figure || !lens) return;
    const r = figure.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - r.left, r.width));
    const y = Math.max(0, Math.min(e.clientY - r.top, r.height));

    lens.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2}px, 0)`;
    lens.style.backgroundSize = `${r.width * zoom}px ${r.height * zoom}px`;
    lens.style.backgroundPosition = `${size / 2 - x * zoom}px ${size / 2 - y * zoom}px`;
  };

  return (
    <div className={`w-full max-w-md ${className}`}>
      <div
        ref={figureRef}
        className="relative touch-none overflow-hidden border border-ink"
        onPointerEnter={() => setLive(true)}
        onPointerLeave={() => setLive(false)}
        onPointerDown={() => setLive(true)}
        onPointerMove={track}
      >
        <img src={src} alt={alt} className="block w-full select-none" draggable={false} />
        <div
          ref={lensRef}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 border border-ink bg-bone bg-no-repeat"
          style={{
            width: size,
            height: size,
            backgroundImage: `url(${src})`,
            opacity: live ? 1 : 0,
            // Only the fade is animated. The travel never is.
            transition: 'opacity 120ms linear',
          }}
        />
      </div>
      {caption && (
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">
          {caption}
        </p>
      )}
    </div>
  );
}
