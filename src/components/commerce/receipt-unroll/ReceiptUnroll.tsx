// ReceiptUnroll — the order confirmation prints rather than appears
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface ReceiptLine {
  label: string;
  value: string;
  /** Renders as a subtotal rule above it. */
  rule?: boolean;
}

export interface ReceiptUnrollProps {
  orderId: string;
  lines: ReceiptLine[];
  total: string;
  footer?: string;
  /** ms between printed lines. Default 90. */
  step?: number;
  className?: string;
}

/**
 * The order summary feeds out of the top like a thermal receipt — line by line,
 * ending on a torn edge.
 *
 * Order confirmation is the one screen in commerce with nothing left to sell,
 * and the only job left is to convince the shopper the transaction is real and
 * finished. A receipt that assembles itself does that better than a static
 * panel, because the physical metaphor carries a promise no copy does: this was
 * recorded, and there is a copy.
 *
 * Each line clips upward with a per-line delay and the paper's own height
 * animates with it — the total is the last thing to land, deliberately, since
 * that is the figure the shopper is waiting to verify. Under reduced motion the
 * whole receipt is simply present.
 */
export function ReceiptUnroll({
  orderId,
  lines,
  total,
  footer = 'Keep this for your records',
  step = 90,
  className = '',
}: ReceiptUnrollProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [printing, setPrinting] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setPrinting(true);
      return;
    }
    const host = hostRef.current;
    if (!host) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          requestAnimationFrame(() => requestAnimationFrame(() => setPrinting(true)));
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(host);
    return () => io.disconnect();
  }, [reduced]);

  const all = [...lines, { label: 'Total paid', value: total, rule: true }];

  const row = (l: ReceiptLine, i: number) => (
    <div
      key={l.label}
      className="grid"
      style={{
        gridTemplateRows: printing ? '1fr' : '0fr',
        opacity: printing ? 1 : 0,
        transition: reduced
          ? undefined
          : `grid-template-rows 220ms ease-out ${i * step}ms, opacity 160ms linear ${i * step + 60}ms`,
      }}
    >
      <div className="overflow-hidden">
        {l.rule && <div className="my-2 border-t border-dashed border-ink/35" />}
        <div className="flex items-baseline justify-between gap-6 py-[3px]">
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink/70">
            {l.label}
          </span>
          <span className={`font-mono text-[11px] tabular-nums ${l.rule ? 'text-sm font-bold' : ''}`}>
            {l.value}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div ref={hostRef} className={`w-full max-w-xs ${className}`}>
      <div className="border-x border-t border-ink bg-bone px-5 pb-4 pt-5">
        <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em]">Arvi Store</p>
        <p className="mt-1 text-center font-mono text-[10px] text-ink/50">Order {orderId}</p>
        <div className="my-3 border-t border-dashed border-ink/35" />
        {all.map(row)}
        <p
          className="mt-4 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-ink/45"
          style={{
            opacity: printing ? 1 : 0,
            transition: reduced ? undefined : `opacity 240ms ease ${all.length * step + 160}ms`,
          }}
        >
          {footer}
        </p>
      </div>

      {/* Torn edge. */}
      <svg viewBox="0 0 100 4" preserveAspectRatio="none" className="block h-2 w-full" aria-hidden>
        <path
          d="M0,0 L0,2 L4,4 L8,1.4 L12,3.6 L16,1 L20,3.4 L24,1.2 L28,3.8 L32,1.6 L36,3.2 L40,1 L44,3.6 L48,1.4 L52,3.8 L56,1.2 L60,3.4 L64,1.6 L68,3 L72,1.2 L76,3.6 L80,1.4 L84,3.2 L88,1 L92,3.6 L96,1.4 L100,3 L100,0 Z"
          className="fill-bone stroke-ink"
          strokeWidth={0.4}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
