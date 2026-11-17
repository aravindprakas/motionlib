// SwatchWipe — the colourway wipes in from the swatch you actually touched
import { useCallback, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface Colorway {
  label: string;
  /** Any CSS colour. Stand-in for a product shot. */
  hex: string;
  /** Optional product image; drawn over the colour if given. */
  src?: string;
}

export interface SwatchWipeProps {
  colorways: Colorway[];
  /** Wipe time in ms. Default 420. */
  duration?: number;
  /** Called after the wipe commits. */
  onChange?: (index: number) => void;
  className?: string;
}

interface Incoming {
  index: number;
  x: number;
  y: number;
  open: boolean;
}

/**
 * Picking a colourway does not cross-fade the product shot — it wipes the new
 * one in as an expanding circle whose origin is the swatch you pressed. The
 * swap reads as *caused by* the swatch rather than as a generic transition,
 * which is the whole point: on a PDP the shopper needs to believe the image
 * they are now looking at belongs to the chip they just touched.
 *
 * One `clip-path` on one layer. The outgoing shot never moves, so there is no
 * cross-fade mush and no second repaint; the incoming layer is discarded the
 * moment it commits, so the DOM stays at two panels regardless of how many
 * colourways are wired up.
 *
 * Reduced motion swaps instantly.
 */
export function SwatchWipe({
  colorways,
  duration = 420,
  onChange,
  className = '',
}: SwatchWipeProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [incoming, setIncoming] = useState<Incoming | null>(null);
  const reduced = useReducedMotion();

  const select = useCallback(
    (index: number, el: HTMLElement) => {
      if (index === active || incoming) return;
      if (reduced) {
        setActive(index);
        onChange?.(index);
        return;
      }
      const panel = panelRef.current;
      if (!panel) return;
      const p = panel.getBoundingClientRect();
      const s = el.getBoundingClientRect();
      // Origin in panel space — the swatch usually sits outside the panel, so
      // these are frequently negative, which is exactly what we want.
      setIncoming({
        index,
        x: s.left + s.width / 2 - p.left,
        y: s.top + s.height / 2 - p.top,
        open: false,
      });
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setIncoming((c) => (c ? { ...c, open: true } : c))),
      );
    },
    [active, incoming, reduced, onChange],
  );

  const commit = () => {
    if (!incoming) return;
    setActive(incoming.index);
    onChange?.(incoming.index);
    setIncoming(null);
  };

  const layer = (c: Colorway) => (
    <div className="absolute inset-0" style={{ background: c.hex }}>
      {c.src && <img src={c.src} alt="" className="h-full w-full object-cover" />}
    </div>
  );

  return (
    <div className={`w-full max-w-sm ${className}`}>
      <div ref={panelRef} className="relative aspect-square overflow-hidden border border-ink">
        {layer(colorways[active])}
        {incoming && (
          <div
            className="absolute inset-0"
            onTransitionEnd={commit}
            style={{
              clipPath: `circle(${incoming.open ? 150 : 0}% at ${incoming.x}px ${incoming.y}px)`,
              transition: `clip-path ${duration}ms cubic-bezier(0.65,0,0.35,1)`,
            }}
          >
            {layer(colorways[incoming.index])}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-[0.18em]">
          {colorways[incoming?.index ?? active].label}
        </p>
        <div className="flex gap-2">
          {colorways.map((c, i) => (
            <button
              key={c.label}
              type="button"
              aria-label={c.label}
              aria-pressed={i === (incoming?.index ?? active)}
              onClick={(e) => select(i, e.currentTarget)}
              className={`h-6 w-6 cursor-pointer border transition-[outline-offset] ${
                i === (incoming?.index ?? active)
                  ? 'border-ink outline outline-1 outline-offset-2 outline-ink'
                  : 'border-ink/30'
              }`}
              style={{ background: c.hex }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
