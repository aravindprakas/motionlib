// ThreadDrawer — assign a thread to every block, and find out what it does on the cloth
import { useMemo, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { DesignArt } from '@/lib/DesignArt';
import {
  DEFINITION_COPY,
  DESIGNS,
  DUR,
  FABRICS,
  MOTION,
  THREADS,
  contrastRatio,
  definition,
  threadByCode,
  type Definition,
  type EmbroideryDesign,
  type Fabric,
} from '@/lib/embroidery';

export interface ThreadDrawerProps {
  design?: EmbroideryDesign;
  fabrics?: Fabric[];
  /** Controlled colourway: block id → thread code. */
  value?: Record<string, string>;
  onChange?: (colourway: Record<string, string>) => void;
  onFabricChange?: (fabric: Fabric) => void;
  className?: string;
}

const VERDICT_CLASS: Record<Definition, string> = {
  crisp: 'text-ink',
  soft: 'text-ink/60',
  lost: 'text-vermilion',
};

/**
 * A colourway built one block at a time, judged against the cloth it will be
 * stitched on.
 *
 * A swatch row asks "which colour do you like?" — the wrong question. Thread
 * has no colour on its own; it has a colour *against a fabric*. Navy on navy is
 * a legitimate, expensive, tone-on-tone choice and it is also the single most
 * common way a customer ends up disappointed, because on a screen at 100%
 * zoom it looked like something. So every choice here is scored against the
 * selected ground and told plainly: reads at arm's length, reads close up only,
 * or disappears.
 *
 * It is also per-block, not per-product. Real embroidery is four to eight
 * separate threads and the interesting decisions are the relationships between
 * them; a single "colour" variant picker cannot express a colourway at all.
 *
 * The verdict is honest maths — relative luminance and contrast ratio, the same
 * arithmetic as text contrast, with thresholds moved down to where thread
 * actually stops reading. Everything recolours through one prop; there is no
 * animation to schedule, only a 120ms colour transition so a swap feels
 * material rather than instant.
 */
export function ThreadDrawer({
  design = DESIGNS[0],
  fabrics = FABRICS,
  value,
  onChange,
  onFabricChange,
  className = '',
}: ThreadDrawerProps) {
  const reduced = useReducedMotion();
  const spoolsRef = useRef<HTMLDivElement>(null);
  const [internal, setInternal] = useState<Record<string, string>>({});
  const [activeBlock, setActiveBlock] = useState(design.blocks[0].id);
  const [fabric, setFabric] = useState<Fabric>(fabrics[0]);

  const colourway = value ?? internal;

  const setThread = (code: string) => {
    const next = { ...colourway, [activeBlock]: code };
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };

  const pickFabric = (f: Fabric) => {
    setFabric(f);
    onFabricChange?.(f);
  };

  /** One pass over the blocks: every verdict the panel needs, computed once. */
  const verdicts = useMemo(
    () =>
      design.blocks.map((b) => {
        const t = threadByCode(colourway[b.id] ?? b.thread);
        return {
          block: b,
          thread: t,
          verdict: definition(t.hex, fabric.hex),
          ratio: contrastRatio(t.hex, fabric.hex),
        };
      }),
    [design, colourway, fabric],
  );

  const active = verdicts.find((v) => v.block.id === activeBlock) ?? verdicts[0];
  const lost = verdicts.filter((v) => v.verdict === 'lost');
  const swap = reduced ? '0ms' : `${DUR.micro}ms`;

  return (
    <div className={`grid gap-8 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] ${className}`}>
      {/* The cloth, with the colourway on it. */}
      <div>
        <div
          className="border border-ink p-6 transition-colors"
          style={{ background: fabric.hex, transitionDuration: reduced ? '0ms' : `${DUR.std}ms` }}
        >
          <DesignArt
            design={design}
            threads={colourway}
            className="block h-auto w-full"
            style={{ transition: `filter ${swap} linear` }}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {fabrics.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => pickFabric(f)}
              aria-pressed={fabric.id === f.id}
              className={`flex min-h-[44px] items-center gap-2 border px-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
                fabric.id === f.id ? 'border-ink text-ink' : 'border-ink/25 text-ink/55 hover:text-ink'
              } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
              style={{ transitionDuration: swap }}
            >
              <span
                aria-hidden
                className="block h-5 w-5 border border-ink/30"
                style={{ background: f.hex }}
              />
              {f.name}
            </button>
          ))}
        </div>

        <p className="mt-3 max-w-prose font-mono text-[10px] leading-relaxed text-ink/55">
          {fabric.gsm} gsm · {fabric.weave} · {fabric.stretch}. {fabric.note}
        </p>
      </div>

      <div className="min-w-0">
        {/* Which block am I dressing? */}
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink/55">
          Colour blocks · run order
        </p>
        <ul className="mt-3 flex list-none flex-wrap gap-px border border-ink bg-ink p-0">
          {verdicts.map(({ block, thread, verdict }) => (
            <li key={block.id} className="flex-1 basis-[8rem]">
              <button
                type="button"
                onClick={() => setActiveBlock(block.id)}
                aria-pressed={activeBlock === block.id}
                className={`flex min-h-[52px] w-full items-center gap-2 px-3 py-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent ${
                  activeBlock === block.id ? 'bg-ink text-bone' : 'bg-bone text-ink'
                }`}
                style={{ transitionDuration: swap }}
              >
                <span
                  aria-hidden
                  className="block h-6 w-6 shrink-0 border border-black/20"
                  style={{ background: thread.hex, transition: `background ${swap} linear` }}
                />
                <span className="min-w-0">
                  <span className="block truncate font-mono text-[10px] uppercase tracking-[0.12em]">
                    {block.label}
                  </span>
                  <span
                    className={`block font-mono text-[9px] uppercase tracking-[0.12em] ${
                      activeBlock === block.id ? 'text-bone/60' : 'text-ink/45'
                    }`}
                  >
                    {verdict}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* The box. A radio group whose value is the active block's thread. */}
        <div className="mt-6 flex items-baseline justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink/55">
            Thread for {active.block.label}
          </p>
          <p className="font-mono text-[10px] tabular-nums text-ink/45">
            {active.thread.code} · {active.thread.name}
          </p>
        </div>

        <div
          ref={spoolsRef}
          role="radiogroup"
          aria-label={`Thread for ${active.block.label}`}
          onKeyDown={(e) => {
            const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
            if (!d) return;
            e.preventDefault();
            const i = THREADS.findIndex((t) => t.code === active.thread.code);
            const next = THREADS[Math.min(THREADS.length - 1, Math.max(0, i + d))];
            setThread(next.code);
            spoolsRef.current
              ?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
              [THREADS.indexOf(next)]?.focus();
          }}
          className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(56px,1fr))] gap-2"
        >
          {THREADS.map((t) => {
            const on = t.code === active.thread.code;
            const d = definition(t.hex, fabric.hex);
            return (
              <button
                key={t.code}
                type="button"
                role="radio"
                aria-checked={on}
                tabIndex={on ? 0 : -1}
                onClick={() => setThread(t.code)}
                title={`${t.code} ${t.name} — ${DEFINITION_COPY[d]}`}
                className={`group relative min-h-[64px] border p-1 transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  on ? 'border-ink' : 'border-ink/20 hover:border-ink/50'
                }`}
                style={{
                  transitionDuration: swap,
                  transitionTimingFunction: MOTION.settle,
                  transform: on && !reduced ? 'translateY(-2px)' : 'none',
                }}
              >
                {/* A spool: wound thread, not a flat chip. */}
                <span
                  aria-hidden
                  className="block h-9 w-full"
                  style={{
                    background: `repeating-linear-gradient(90deg, ${t.hex} 0 3px, rgba(0,0,0,0.16) 3px 4px)`,
                  }}
                />
                <span className="mt-1 block font-mono text-[9px] tabular-nums text-ink/60">
                  {t.code}
                </span>
                {d === 'lost' && (
                  <span
                    aria-hidden
                    className="absolute right-1 top-1 block h-1.5 w-1.5 bg-vermilion"
                  />
                )}
                <span className="sr-only">
                  {t.name}. {DEFINITION_COPY[d]}
                </span>
              </button>
            );
          })}
        </div>

        <p
          aria-live="polite"
          className={`mt-4 font-mono text-[11px] leading-relaxed ${VERDICT_CLASS[active.verdict]}`}
        >
          {active.thread.name} on {fabric.name} — {DEFINITION_COPY[active.verdict]}{' '}
          <span className="tabular-nums opacity-60">({active.ratio.toFixed(2)}:1)</span>
        </p>

        {lost.length > 0 && (
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-vermilion">
            {lost.length} {lost.length === 1 ? 'block' : 'blocks'} will not read on this cloth:{' '}
            {lost.map((l) => l.block.label).join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}
