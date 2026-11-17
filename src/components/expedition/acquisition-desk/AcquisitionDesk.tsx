// AcquisitionDesk — the acquisition record: a ledger you can read, with one unmistakable action
import { useId, useMemo, useRef, useState } from 'react';
import { ArtifactPlate } from '@/lib/ArtifactPlate';
import { useSizeBand } from '@/lib/useSizeBand';
import {
  CONDITION_COPY,
  RARITY_COPY,
  RESOLVED,
  acquisition,
  formatMoney,
  stampDate,
  stratum,
  type ResolvedArtifact,
} from '@/lib/expedition';

export type AcquisitionStatus = 'idle' | 'submitting' | 'acquired' | 'error';

export interface AcquisitionDeskProps {
  artifact?: ResolvedArtifact;
  /** Interventions from the restoration bench, printed into the record. */
  interventions?: { key: string; from: string; to: string }[];
  /** Finished width on the cloth, if restoration changed it. */
  widthMm?: number;
  quantity?: number;
  defaultQuantity?: number;
  onQuantityChange?: (quantity: number) => void;
  onAcquire?: (input: { artifact: ResolvedArtifact; quantity: number }) => void;
  status?: AcquisitionStatus;
  errorMessage?: string;
  currency?: string;
  className?: string;
}

/**
 * The acquisition record.
 *
 * This is the one screen in the set where the metaphor has to get out of the
 * way, and the way to keep both is to notice that an archival acquisition record
 * and a good checkout summary want exactly the same thing: every fact that
 * affects the transaction, on ruled lines, in one column, with nothing folded
 * away. So the ledger *is* the summary — no accordions, no "see details", no
 * price that appears only after a step — and the action sitting under it says
 * what it does in plain words.
 *
 * Every number on the sheet comes from `acquisition()`, which is a thin wrapper
 * over the same `estimate()` the shop floor uses. A quantity change re-tallies
 * the whole record at once, and the lines that changed re-stamp so the customer
 * can see what moved. Lead time is derived from machine minutes rather than
 * promised as a constant, which is both more honest and less work to maintain.
 *
 * The action is a real submit with a real busy state and a real failure state.
 * Out-of-stock is not a disabled mystery: the button says the piece is archived
 * and the record says what archived means.
 */
export function AcquisitionDesk({
  artifact = RESOLVED[0],
  interventions = [],
  widthMm,
  quantity,
  defaultQuantity = 1,
  onQuantityChange,
  onAcquire,
  status = 'idle',
  errorMessage = 'The register did not accept that. Nothing has been charged.',
  currency = '₹',
  className = '',
}: AcquisitionDeskProps) {
  const rootRef = useRef<HTMLElement>(null);
  const band = useSizeBand(rootRef, { regular: 620, wide: 980 });
  const qtyId = useId();
  const [internalQty, setInternalQty] = useState(defaultQuantity);
  const qty = quantity ?? internalQty;

  const { record } = artifact;
  const archived = record.available === 0;
  const ceiling = archived ? 0 : record.available;

  const setQty = (next: number) => {
    const clamped = Math.max(1, Math.min(Math.max(1, ceiling), Math.round(next) || 1));
    if (quantity === undefined) setInternalQty(clamped);
    onQuantityChange?.(clamped);
  };

  const quote = useMemo(
    () => acquisition({ artifact, quantity: qty, widthMm }, currency),
    [artifact, qty, widthMm, currency],
  );

  const atCeiling = !archived && qty >= ceiling;
  const busy = status === 'submitting';
  const done = status === 'acquired';

  return (
    <section
      ref={rootRef}
      className={`exp exp-desk ${className}`}
      aria-label={`Acquisition record for ${record.name}`}
    >
      <div className="exp-desk__grid exp-section">
        <header className="exp-desk__head">
          <span className="exp-label">Acquisition record</span>
          <h2 className="exp-title">{record.name}</h2>
          <p className="exp-meta">
            {record.accession} · {stratum(record.depth)} · opened {stampDate(record.recorded)}
          </p>
        </header>

        <figure className="exp-desk__figure">
          <ArtifactPlate artifact={artifact} mode="carrier" ratio="4 / 5" />
          <figcaption className="exp-meta">
            {artifact.garment.name} · {artifact.fabric.name}
          </figcaption>
        </figure>

        <div className="exp-desk__sheet">
          {/* The ledger. Every line that affects the transaction, unfolded. */}
          <dl className="exp-desk__ledger">
            {quote.lines.map((line) => (
              <div
                key={line.label}
                className="exp-desk__line"
                data-emphasis={line.emphasis || undefined}
              >
                <dt>{line.label}</dt>
                {/* Keyed on the value so a change re-stamps rather than
                    silently swapping — the only motion on this screen. */}
                <dd key={line.value}>{line.value}</dd>
              </div>
            ))}
          </dl>

          {interventions.length > 0 && (
            <div className="exp-desk__interventions">
              <span className="exp-label">Restoration carried out</span>
              <ul>
                {interventions.map((i) => (
                  <li key={i.key + i.to}>
                    <span className="exp-meta">{i.key}</span>
                    <span className="exp-desk__from">{i.from}</span>
                    <span aria-hidden="true">→</span>
                    <span className="exp-desk__to">{i.to}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="exp-desk__production">
            <span className="exp-label">Production</span>
            <p className="exp-caption">
              {Math.round(quote.minutesTotal)} machine minutes for {qty} unit
              {qty > 1 ? 's' : ''} · {quote.metres.toFixed(1)}m of thread ·{' '}
              {artifact.threads.length} colour changes. Dispatch in{' '}
              <strong>{quote.leadDays} working days</strong>.
            </p>
            <p className="exp-caption">
              {RARITY_COPY[record.rarity]} · {CONDITION_COPY[record.condition]}
            </p>
          </div>
        </div>

        {/* The desk. One action, and everything that qualifies it, together. */}
        <div className="exp-desk__actions" data-compact={band === 'compact' || undefined}>
          <div className="exp-desk__qty">
            <label className="exp-label" htmlFor={qtyId}>
              Units
            </label>
            <div className="exp-desk__stepper">
              <button
                type="button"
                className="exp-desk__step"
                onClick={() => setQty(qty - 1)}
                disabled={archived || qty <= 1}
                aria-label="One fewer unit"
              >
                −
              </button>
              <input
                id={qtyId}
                className="exp-desk__qtyInput"
                type="number"
                inputMode="numeric"
                min={1}
                max={Math.max(1, ceiling)}
                value={qty}
                disabled={archived}
                onChange={(e) => setQty(Number(e.target.value))}
              />
              <button
                type="button"
                className="exp-desk__step"
                onClick={() => setQty(qty + 1)}
                disabled={archived || atCeiling}
                aria-label="One more unit"
              >
                +
              </button>
            </div>
            <p className="exp-meta exp-desk__ceiling">
              {archived
                ? 'None released'
                : atCeiling
                  ? `${ceiling} released — that is all of them`
                  : `${ceiling} released`}
            </p>
          </div>

          <div className="exp-desk__total">
            <span className="exp-label">Acquisition total</span>
            <p className="exp-desk__totalValue" key={quote.total}>
              {formatMoney(quote.total, currency)}
            </p>
            <p className="exp-meta">
              {formatMoney(quote.unitPrice, currency)} per unit · tax included
            </p>
          </div>

          <button
            type="button"
            className="exp-action exp-action--primary exp-desk__commit"
            disabled={archived || busy || done}
            aria-busy={busy || undefined}
            onClick={() => onAcquire?.({ artifact, quantity: qty })}
          >
            {archived
              ? 'Archived — not released'
              : busy
                ? 'Entering in the register…'
                : done
                  ? 'Acquired · entered in the register'
                  : `Acquire ${qty} · ${formatMoney(quote.total, currency)}`}
          </button>

          <p className="exp-caption exp-desk__foot" role={status === 'error' ? 'alert' : undefined}>
            {status === 'error'
              ? errorMessage
              : done
                ? `Entered as ${record.accession}. A copy of this record has been sent to you.`
                : 'Acquisition transfers the specimen record with the garment. Nothing is charged until you press this.'}
          </p>
        </div>
      </div>
    </section>
  );
}
