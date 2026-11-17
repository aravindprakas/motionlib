// InTheBox — the carton opens onto what you're actually buying
import { useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface BoxItem {
  name: string;
  qty?: string;
  /** Marks an accessory as sold separately — the honest half of the feature. */
  excluded?: boolean;
}

export interface InTheBoxProps {
  contents: BoxItem[];
  label?: string;
  className?: string;
}

/**
 * A carton that opens on click, its lid rotating back on a real hinge, with the
 * contents listing out behind it — including, explicitly, what is *not* in the
 * box.
 *
 * "What actually arrives" is one of the most-asked pre-sale questions and one of
 * the most common causes of a bad unboxing, which is where reviews are won or
 * lost. Stating the exclusions in the same breath as the inclusions costs a few
 * sales and prevents the one-star review that costs many more.
 *
 * CSS 3D only: the lid is a single `rotateX` about a top edge inside a
 * perspective context, so there is no library, no canvas, and the whole scene
 * is four elements. Reduced motion renders the box already open.
 */
export function InTheBox({ contents, label = 'In the box', className = '' }: InTheBoxProps) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(reduced);

  return (
    <div className={`w-full max-w-md ${className}`}>
      <div style={{ perspective: '900px' }}>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="relative block w-full cursor-pointer text-left"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Lid — hinged along its top edge. */}
          <div
            className="relative z-10 border border-ink bg-bone px-5 py-4"
            style={{
              transformOrigin: 'top center',
              transform: `rotateX(${open ? -104 : 0}deg)`,
              transition: reduced ? undefined : 'transform 520ms cubic-bezier(0.4,0,0.2,1)',
              backfaceVisibility: 'hidden',
            }}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.24em]">{label}</p>
            <p className="mt-1 font-mono text-[10px] text-ink/45">
              {open ? 'Close' : `${contents.filter((c) => !c.excluded).length} items — open`}
            </p>
          </div>

          {/* Interior */}
          <div className="-mt-px border border-ink bg-ink/[0.04] px-5 py-4">
            <ul className="space-y-2">
              {contents.map((c, i) => (
                <li
                  key={c.name}
                  className="flex items-baseline justify-between gap-4"
                  style={{
                    opacity: open ? 1 : 0,
                    transform: open ? 'translateY(0)' : 'translateY(-6px)',
                    transition: reduced
                      ? undefined
                      : `opacity 260ms ease ${180 + i * 60}ms, transform 260ms ease ${180 + i * 60}ms`,
                  }}
                >
                  <span
                    className={`font-mono text-[11px] uppercase tracking-[0.12em] ${
                      c.excluded ? 'text-ink/40 line-through decoration-ink/30' : ''
                    }`}
                  >
                    {c.name}
                  </span>
                  <span className="shrink-0 font-mono text-[11px] text-ink/50">
                    {c.excluded ? 'sold separately' : (c.qty ?? '×1')}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </button>
      </div>
    </div>
  );
}
