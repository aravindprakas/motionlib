// SpecimenComparison — specimens registered to shared scales, so a difference is a distance
import { useMemo, useRef, useState, type CSSProperties } from 'react';
import { ArtifactPlate } from '@/lib/ArtifactPlate';
import { DesignArt } from '@/lib/DesignArt';
import { useSizeBand } from '@/lib/useSizeBand';
import {
  RESOLVED,
  complexity,
  fillRatio,
  formatCount,
  type ResolvedArtifact,
} from '@/lib/expedition';

export interface SpecimenComparisonProps {
  /** The pool a specimen can be drawn from. */
  artifacts?: ResolvedArtifact[];
  /** Controlled selection, in slot order. */
  selectedIds?: string[];
  defaultSelectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  /** Slots on the bench. Three is the honest maximum on a laptop. */
  max?: number;
  className?: string;
}

/** One comparable property, with the axis it is plotted on. */
interface Axis {
  id: string;
  label: string;
  /** Value for a specimen. */
  read: (a: ResolvedArtifact) => number;
  /** Printed form of the value. */
  print: (a: ResolvedArtifact) => string;
  /** What the high end of the axis means, for the caption. */
  high: string;
}

const AXES: Axis[] = [
  {
    id: 'stitches',
    label: 'Stitch count',
    read: (a) => a.stitches,
    print: (a) => formatCount(a.stitches),
    high: 'longer run',
  },
  {
    id: 'density',
    label: 'Fill density',
    read: (a) => fillRatio(a),
    print: (a) => `${Math.round(fillRatio(a) * 100)}% solid`,
    high: 'more solid fill, less outline',
  },
  {
    id: 'complexity',
    label: 'Complexity',
    read: (a) => complexity(a),
    print: (a) => `${complexity(a)} of 5`,
    high: 'more thread changes for the size',
  },
  {
    id: 'colours',
    label: 'Colours',
    read: (a) => a.threads.length,
    print: (a) => `${a.threads.length} threads`,
    high: 'more machine stops',
  },
  {
    id: 'scale',
    label: 'Finished width',
    read: (a) => a.design.widthMm,
    print: (a) => `${a.design.widthMm}mm`,
    high: 'larger on the garment',
  },
  {
    id: 'ground',
    label: 'Ground weight',
    read: (a) => a.fabric.gsm,
    print: (a) => `${a.fabric.gsm}gsm`,
    high: 'heavier cloth',
  },
];

/**
 * Comparison as registration, not as a table.
 *
 * A spec table makes you read six numbers per column and do the arithmetic
 * yourself, which is why nobody uses comparison tables to actually decide. The
 * fix is to register every specimen to the *same* axis: once "stitch count" is
 * one line with three marks on it, "this one is twice the run" stops being a
 * calculation and becomes a distance you can see. The numbers are still printed
 * — they are just no longer the only channel.
 *
 * The scale frame does the thing a table structurally cannot: it draws the
 * selected motifs at their true relative size, in one box, so an 82mm sprig and
 * a 40mm chevron look like what they are. That comparison is impossible in text
 * and is the single most common thing customers get wrong.
 *
 * Compact bodies do not get a shrunken three-column layout. They get slots as a
 * segmented control: one specimen dominant, the axes keeping every mark on
 * screen with the active one emphasised. The comparison survives; only the
 * dominance changes.
 *
 * All of it is layout and opacity on at most three columns — no virtualisation,
 * no measurement, no per-frame work.
 */
export function SpecimenComparison({
  artifacts = RESOLVED,
  selectedIds,
  defaultSelectedIds,
  onSelectionChange,
  max = 3,
  className = '',
}: SpecimenComparisonProps) {
  const rootRef = useRef<HTMLElement>(null);
  const band = useSizeBand(rootRef, { regular: 620, wide: 1000 });
  const [internal, setInternal] = useState<string[]>(
    defaultSelectedIds ?? artifacts.slice(0, Math.min(2, max)).map((a) => a.record.id),
  );
  const ids = selectedIds ?? internal;
  const [activeSlot, setActiveSlot] = useState(0);
  const [openAspects, setOpenAspects] = useState(false);

  const chosen = ids
    .map((id) => artifacts.find((a) => a.record.id === id))
    .filter((a): a is ResolvedArtifact => Boolean(a));

  const commit = (next: string[]) => {
    if (selectedIds === undefined) setInternal(next);
    onSelectionChange?.(next);
  };

  const add = (id: string) => {
    if (ids.includes(id) || ids.length >= max) return;
    commit([...ids, id]);
    setActiveSlot(ids.length);
  };

  const remove = (id: string) => {
    const next = ids.filter((x) => x !== id);
    commit(next);
    setActiveSlot((s) => Math.max(0, Math.min(s, next.length - 1)));
  };

  /**
   * Axis ranges come from the whole pool, not from the chosen specimens — so a
   * mark's position means the same thing before and after you add a third
   * specimen. Ranges that rescale on selection are how comparison UIs end up
   * lying.
   */
  const ranges = useMemo(() => {
    const out: Record<string, { min: number; max: number }> = {};
    for (const axis of AXES) {
      const vals = artifacts.map(axis.read);
      const min = Math.min(...vals);
      const max2 = Math.max(...vals);
      out[axis.id] = { min, max: max2 === min ? min + 1 : max2 };
    }
    return out;
  }, [artifacts]);

  const pos = (axis: Axis, a: ResolvedArtifact) => {
    const { min, max: hi } = ranges[axis.id];
    return ((axis.read(a) - min) / (hi - min)) * 100;
  };

  const compact = band === 'compact';
  const visible = compact ? chosen.slice(activeSlot, activeSlot + 1) : chosen;
  const widest = Math.max(1, ...chosen.map((a) => a.design.widthMm));

  return (
    <section ref={rootRef} className={`exp exp-cmp ${className}`} aria-label="Specimen comparison">
      <div className="exp-cmp__grid exp-section">
        <header className="exp-cmp__head">
          <div>
            <span className="exp-label">Comparison bench</span>
            <p className="exp-meta">
              {chosen.length} of {max} slots · axes fixed to the whole catalogue
            </p>
          </div>
          {compact && chosen.length > 1 && (
            <div className="exp-cmp__slots" role="tablist" aria-label="Specimen slot">
              {chosen.map((a, i) => (
                <button
                  key={a.record.id}
                  type="button"
                  role="tab"
                  aria-selected={i === activeSlot}
                  tabIndex={i === activeSlot ? 0 : -1}
                  className="exp-cmp__slot"
                  onClick={() => setActiveSlot(i)}
                >
                  {String.fromCharCode(65 + i)}
                </button>
              ))}
            </div>
          )}
        </header>

        {chosen.length === 0 ? (
          <p className="exp-cmp__empty exp-caption">
            No specimens on the bench. Add one from the drawer below.
          </p>
        ) : (
          <>
            {/* True relative scale. The one comparison a table cannot make. */}
            <figure className="exp-cmp__scale">
              <svg viewBox="0 0 200 200" aria-hidden="true" focusable="false">
                <rect x="0.5" y="0.5" width="199" height="199" className="exp-cmp__scaleBox" />
                {chosen.map((a, i) => {
                  const k = a.design.widthMm / widest;
                  const on = compact ? i === activeSlot : true;
                  return (
                    <g
                      key={a.record.id}
                      className="exp-cmp__scaleItem"
                      data-on={on || undefined}
                      transform={`translate(100 100) scale(${k}) translate(-100 -100)`}
                    >
                      <DesignArt design={a.design} ghost />
                    </g>
                  );
                })}
              </svg>
              <figcaption className="exp-meta">
                Drawn to true relative size — {chosen.map((a) => `${a.design.widthMm}mm`).join(' · ')}
              </figcaption>
            </figure>

            <div className="exp-cmp__columns" data-count={visible.length}>
              {visible.map((a, i) => {
                const letter = String.fromCharCode(65 + (compact ? activeSlot : i));
                return (
                  <article key={a.record.id} className="exp-cmp__column">
                    <header className="exp-cmp__columnHead">
                      <span className="exp-cmp__letter" aria-hidden="true">
                        {letter}
                      </span>
                      <span>
                        <span className="exp-heading">{a.record.name}</span>
                        <span className="exp-meta">{a.record.accession}</span>
                      </span>
                      <button
                        type="button"
                        className="exp-action exp-action--quiet exp-cmp__remove"
                        onClick={() => remove(a.record.id)}
                      >
                        <span className="exp-sr">Remove {a.record.name} from the bench</span>
                        <span aria-hidden="true">×</span>
                      </button>
                    </header>
                    <ArtifactPlate artifact={a} ratio="1 / 1" zoom={1.05} />
                    <dl className="exp-stamp exp-cmp__columnStamp">
                      <dt>Ground</dt>
                      <dd>{a.fabric.name}</dd>
                      <dt>Carrier</dt>
                      <dd>{a.garment.name}</dd>
                      <dt>Technique</dt>
                      <dd>
                        {Array.from(new Set(a.design.blocks.map((b) => b.type))).join(' · ')}
                      </dd>
                    </dl>
                    {openAspects && (
                      <ul className="exp-cmp__threads" aria-label={`Threads in ${a.record.name}`}>
                        {a.threads.map((t) => (
                          <li key={t.code}>
                            <span
                              className="exp-cmp__threadChip"
                              style={{ background: t.hex }}
                              aria-hidden="true"
                            />
                            <span className="exp-meta">
                              {t.code} {t.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                );
              })}
            </div>

            {/* The registered axes. Every chosen specimen is marked on each. */}
            <div className="exp-cmp__axes">
              {AXES.map((axis) => (
                <div key={axis.id} className="exp-cmp__axis">
                  <span className="exp-label exp-label--ink">{axis.label}</span>
                  <div className="exp-cmp__axisLine">
                    {chosen.map((a, i) => (
                      <span
                        key={a.record.id}
                        className="exp-cmp__mark"
                        data-on={(!compact || i === activeSlot) || undefined}
                        style={{ left: `${pos(axis, a)}%`, '--slot': i } as CSSProperties}
                      >
                        <span className="exp-sr">
                          {a.record.name}: {axis.print(a)}
                        </span>
                        <span className="exp-cmp__markLetter" aria-hidden="true">
                          {String.fromCharCode(65 + i)}
                        </span>
                      </span>
                    ))}
                  </div>
                  <span className="exp-meta exp-cmp__axisValues">
                    {chosen.map((a, i) => (
                      <span key={a.record.id} data-on={(!compact || i === activeSlot) || undefined}>
                        {String.fromCharCode(65 + i)} {axis.print(a)}
                      </span>
                    ))}
                  </span>
                </div>
              ))}
              <p className="exp-caption exp-cmp__axisNote">
                Rightward on every axis means: {AXES.map((a) => a.high).join('; ')}.
              </p>
            </div>

            <button
              type="button"
              className="exp-action exp-cmp__disclose"
              aria-expanded={openAspects}
              onClick={() => setOpenAspects((v) => !v)}
            >
              {openAspects ? 'Hide thread breakdown' : 'Show thread breakdown'}
            </button>
          </>
        )}

        <div className="exp-cmp__drawer">
          <span className="exp-label">Drawer · add a specimen</span>
          <ul className="exp-cmp__pool">
            {artifacts.map((a) => {
              const on = ids.includes(a.record.id);
              const full = !on && ids.length >= max;
              return (
                <li key={a.record.id}>
                  <button
                    type="button"
                    className="exp-cmp__poolItem"
                    aria-pressed={on}
                    disabled={full}
                    title={full ? `Bench is full — remove a specimen first` : undefined}
                    onClick={() => (on ? remove(a.record.id) : add(a.record.id))}
                  >
                    <ArtifactPlate artifact={a} ratio="1 / 1" zoom={0.82} marks={false} />
                    <span className="exp-cmp__poolName">{a.record.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
