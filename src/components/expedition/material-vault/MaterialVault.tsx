// MaterialVault — cloth as documented specimens in a cabinet, pulled out one at a time
import { useRef, useState, type CSSProperties } from 'react';
import { useSizeBand } from '@/lib/useSizeBand';
import {
  DEFINITION_COPY,
  FABRICS,
  THREADS,
  definition,
  relativeLuminance,
  threadByCode,
  type Fabric,
} from '@/lib/embroidery';

export interface MaterialVaultProps {
  fabrics?: Fabric[];
  /** Controlled selection by fabric id. */
  value?: string;
  onChange?: (fabricId: string) => void;
  /**
   * Thread the ground is being judged against. Every sample is scored for how
   * well this thread will actually read on it.
   */
  threadCode?: string;
  onThreadChange?: (code: string) => void;
  /**
   * Metres on the shelf, by fabric id. Availability is a stock fact, not a
   * property of cloth, so it is injected rather than modelled in the library.
   */
  stock?: Record<string, number>;
  /** Threads offered for the test strip. Defaults to a six-thread working box. */
  threadCodes?: string[];
  className?: string;
}

const DEFAULT_STOCK: Record<string, number> = {
  'heavy-jersey': 420,
  'brushed-fleece': 180,
  oxford: 610,
  canvas: 46,
  linen: 0,
};

const DEFAULT_THREADS = ['1000', '1090', '1147', '1210', '1305', '1420'];

/**
 * A material vault, not a swatch row.
 *
 * Six coloured circles under a product photo tell a customer nothing about
 * cloth. What decides whether they are happy with the parcel is weight, weave,
 * stretch and whether their thread choice will even be visible on it — so every
 * sample here is a documented specimen with those four facts attached, and the
 * vault's whole job is to make picking one feel like handling cloth rather than
 * tapping a colour.
 *
 * The tactility is structural: samples sit in a cabinet, the chosen one is
 * physically pulled out of the row, and the drawer it came from stays open
 * behind it, so "what changed" is answered by the geometry and not by a toast.
 * The pull is one transform on one element — no layout animation, no shadow
 * animation, no WebGL cloth. The weave is two repeating gradients whose pitch
 * comes from the fabric's gsm, so a 400gsm canvas is visibly coarser than a
 * 150gsm oxford, at a cost of zero requests and zero elements.
 *
 * The test strip is the part a swatch picker never has: it scores the chosen
 * thread against every ground with the library's own `definition()`, so "this
 * tone-on-tone will disappear in daylight" is said *before* the order, in the
 * same words the shop floor would use.
 */
export function MaterialVault({
  fabrics = FABRICS,
  value,
  onChange,
  threadCode,
  onThreadChange,
  stock = DEFAULT_STOCK,
  threadCodes = DEFAULT_THREADS,
  className = '',
}: MaterialVaultProps) {
  const rootRef = useRef<HTMLElement>(null);
  const band = useSizeBand(rootRef, { regular: 620, wide: 1000 });
  const [internal, setInternal] = useState(fabrics[0]?.id ?? '');
  const [internalThread, setInternalThread] = useState(threadCodes[2] ?? THREADS[0].code);

  const activeId = value ?? internal;
  const fabric = fabrics.find((f) => f.id === activeId) ?? fabrics[0];
  const code = threadCode ?? internalThread;
  const thread = threadByCode(code);

  const pick = (id: string) => {
    if (value === undefined) setInternal(id);
    onChange?.(id);
  };

  const pickThread = (next: string) => {
    if (threadCode === undefined) setInternalThread(next);
    onThreadChange?.(next);
  };

  const metres = stock[fabric.id] ?? 0;
  const def = definition(thread.hex, fabric.hex);

  return (
    <section ref={rootRef} className={`exp exp-vault ${className}`} aria-label="Material vault">
      <div className="exp-vault__grid exp-section">
        <header className="exp-vault__head">
          <div>
            <span className="exp-label">Material vault</span>
            <p className="exp-meta">{fabrics.length} grounds held · pull one out to examine it</p>
          </div>
          <span className={`exp-chip ${metres === 0 ? 'exp-chip--archived' : 'exp-chip--available'}`}>
            {metres === 0 ? 'Out of stock' : `${metres}m on the shelf`}
          </span>
        </header>

        {/* The cabinet. Each front is a drawer; the chosen one is pulled out. */}
        <div className="exp-vault__cabinet" role="radiogroup" aria-label="Ground">
          {fabrics.map((f, i) => {
            const on = f.id === activeId;
            const pitch = Math.max(3, Math.min(9, Math.round(f.gsm / 46)));
            const out = (stock[f.id] ?? 0) === 0;
            return (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={on}
                tabIndex={on ? 0 : -1}
                className="exp-vault__drawer"
                data-on={on || undefined}
                onClick={() => pick(f.id)}
                onKeyDown={(e) => {
                  const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
                  if (!d) return;
                  e.preventDefault();
                  pick(fabrics[(i + d + fabrics.length) % fabrics.length].id);
                }}
              >
                <span className="exp-vault__slot" aria-hidden="true" />
                <span
                  className="exp-vault__sample"
                  style={
                    {
                      background: f.hex,
                      '--pitch': `${pitch}px`,
                      '--tilt': `${(i % 2 ? 1 : -1) * 0.5}deg`,
                    } as CSSProperties
                  }
                >
                  <span className="exp-vault__sampleWeave" aria-hidden="true" />
                  <span className="exp-vault__sampleEdge" aria-hidden="true" />
                </span>
                <span className="exp-vault__drawerLabel">
                  <span className="exp-vault__drawerName">{f.name}</span>
                  <span className="exp-meta">
                    {f.gsm}gsm{out ? ' · out' : ''}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* The record for whatever is out of the cabinet. */}
        <div className="exp-vault__record" aria-live="polite">
          <span className="exp-label">{fabric.id.toUpperCase()} · specimen record</span>
          <h3 className="exp-title">{fabric.name}</h3>
          <dl className="exp-stamp exp-vault__stamp">
            <dt>Weight</dt>
            <dd>{fabric.gsm} g/m²</dd>
            <dt>Weave</dt>
            <dd>{fabric.weave}</dd>
            <dt>Stretch</dt>
            <dd>{fabric.stretch}</dd>
            <dt>Finish</dt>
            <dd>{fabric.hex.toUpperCase()}</dd>
            <dt>Shelf</dt>
            <dd>{metres === 0 ? 'Documented only — none held' : `${metres} metres`}</dd>
          </dl>
          <p className="exp-caption exp-vault__note">{fabric.note}</p>
        </div>

        {/* Thread against ground: the judgement a swatch picker never makes. */}
        <div className="exp-vault__test">
          <span className="exp-label">Thread on this ground</span>
          <div className="exp-vault__strip" style={{ background: fabric.hex }}>
            {threadCodes.map((c) => {
              const t = threadByCode(c);
              const d = definition(t.hex, fabric.hex);
              return (
                <button
                  key={c}
                  type="button"
                  className="exp-vault__stitch"
                  aria-pressed={c === code}
                  aria-label={`${t.name}, code ${t.code} — ${DEFINITION_COPY[d]}`}
                  onClick={() => pickThread(c)}
                  style={
                    {
                      '--thread': t.hex,
                      '--ink': relativeLuminance(fabric.hex) > 0.4 ? '#1b1a18' : '#f8f5ef',
                    } as CSSProperties
                  }
                >
                  <span className="exp-vault__stitchRun" aria-hidden="true" />
                  <span className="exp-meta exp-vault__stitchCode" aria-hidden="true">
                    {t.code}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="exp-caption" data-definition={def}>
            {thread.code} {thread.name} on {fabric.name} — {DEFINITION_COPY[def]}
          </p>
          {band !== 'compact' && (
            <p className="exp-caption exp-vault__hint">
              Arrow keys move through the cabinet. Every sample keeps its own weave pitch, set by
              its weight.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
