// ArtifactCatalog — the catalogue wall: one set of records, three ways of looking at it
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { ArtifactPlate } from '@/lib/ArtifactPlate';
import { useSizeBand } from '@/lib/useSizeBand';
import {
  RARITY_COPY,
  RESOLVED,
  complexity,
  formatCount,
  stampDate,
  stratum,
  type ResolvedArtifact,
} from '@/lib/expedition';

/**
 * The three perspectives. Not filters — the same records, recomposed:
 * `archive` is the photographic wall, `specimens` is the index, `detail` is
 * one record under examination.
 */
export type CatalogMode = 'archive' | 'specimens' | 'detail';

export interface ArtifactCatalogProps {
  artifacts?: ResolvedArtifact[];
  mode?: CatalogMode;
  defaultMode?: CatalogMode;
  onModeChange?: (mode: CatalogMode) => void;
  selectedId?: string;
  onSelect?: (artifact: ResolvedArtifact) => void;
  /** Rendered as the record's action in `detail`. Omitted, no button appears. */
  onAcquire?: (artifact: ResolvedArtifact) => void;
  /** Skeleton plates while the accession list is in flight. */
  loading?: boolean;
  emptyLabel?: string;
  className?: string;
}

const MODES: { id: CatalogMode; label: string; hint: string }[] = [
  { id: 'archive', label: 'Archive', hint: 'Photographic plates with full metadata' },
  { id: 'specimens', label: 'Specimens', hint: 'Compact index, one line per record' },
  { id: 'detail', label: 'Detail', hint: 'One record under examination' },
];

/**
 * A catalogue wall, not a product grid.
 *
 * A grid of cards answers one question — "what does it look like" — and a
 * customer choosing embroidery needs three: what does it look like, how does it
 * compare with the forty other records, and what exactly am I looking at. Those
 * are three different densities, so the component recomposes rather than
 * re-filters: the plates that dominate `archive` become 28px index thumbnails
 * in `specimens` and one dominant examination plate in `detail`. Same records,
 * same DOM order, same selection — three geometries.
 *
 * The perspective control is a real radiogroup with roving focus and arrow
 * keys, because it changes what is on screen and a set of `aria-pressed`
 * buttons would not say that a choice is exclusive.
 *
 * Cost is deliberately flat. Plates are stateless and the mode change is a
 * class swap plus a capped `animation-delay` ladder — no measuring, no FLIP, no
 * per-item JS. A forty-record wall costs the same as a six-record one.
 */
export function ArtifactCatalog({
  artifacts = RESOLVED,
  mode,
  defaultMode = 'archive',
  onModeChange,
  selectedId,
  onSelect,
  onAcquire,
  loading = false,
  emptyLabel = 'No records in this territory yet.',
  className = '',
}: ArtifactCatalogProps) {
  const rootRef = useRef<HTMLElement>(null);
  const band = useSizeBand(rootRef, { regular: 620, wide: 1000 });
  const radiosRef = useRef<(HTMLButtonElement | null)[]>([]);

  const [internalMode, setInternalMode] = useState<CatalogMode>(defaultMode);
  const activeMode = mode ?? internalMode;
  const [internalSel, setInternalSel] = useState(artifacts[0]?.record.id ?? '');
  const activeSel = selectedId ?? internalSel;
  const selected = artifacts.find((a) => a.record.id === activeSel) ?? artifacts[0];

  const setMode = (next: CatalogMode) => {
    if (mode === undefined) setInternalMode(next);
    onModeChange?.(next);
  };

  const select = (a: ResolvedArtifact) => {
    if (selectedId === undefined) setInternalSel(a.record.id);
    onSelect?.(a);
  };

  /** Arrow keys move between perspectives and commit, as a radiogroup should. */
  const onRadioKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (i + delta + MODES.length) % MODES.length;
    setMode(MODES[next].id);
    radiosRef.current[next]?.focus();
  };

  // Selecting a record in the wall or the index means "examine this one" — but
  // only on a screen too narrow to show wall and record at once. On a wide
  // canvas the record panel is already visible beside the wall, so hijacking
  // the mode there would take the wall away for no reason.
  const selectAndExamine = (a: ResolvedArtifact) => {
    select(a);
    if (band === 'compact' && activeMode !== 'detail') setMode('detail');
  };

  const empty = !loading && artifacts.length === 0;

  return (
    <section ref={rootRef} className={`exp exp-cat ${className}`} aria-label="Artifact catalogue">
      <header className="exp-cat__bar exp-section">
        <div>
          <span className="exp-label">Accession catalogue</span>
          <p className="exp-meta exp-cat__count">
            {loading ? 'Reading drawers…' : `${artifacts.length} records · sorted by stratum`}
          </p>
        </div>

        <div className="exp-cat__modes" role="radiogroup" aria-label="Catalogue perspective">
          {MODES.map((m, i) => (
            <button
              key={m.id}
              ref={(el) => {
                radiosRef.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={activeMode === m.id}
              title={m.hint}
              tabIndex={activeMode === m.id ? 0 : -1}
              className="exp-cat__mode"
              onClick={() => setMode(m.id)}
              onKeyDown={(e) => onRadioKey(e, i)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </header>

      <div className="exp-cat__body exp-section" data-mode={activeMode}>
        {empty && <p className="exp-cat__empty exp-caption">{emptyLabel}</p>}

        {loading && (
          <ul className="exp-cat__wall" aria-hidden="true">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <li key={i} className="exp-cat__skeleton" style={{ animationDelay: `${i * 60}ms` }} />
            ))}
          </ul>
        )}

        {!loading && !empty && activeMode === 'archive' && (
          <ul className="exp-cat__wall">
            {artifacts.map((a, i) => (
              <li key={a.record.id} className="exp-cat__cell" style={{ '--i': Math.min(i, 6) } as CSSProperties}>
                <ArchiveCard
                  artifact={a}
                  selected={a.record.id === activeSel}
                  onSelect={() => selectAndExamine(a)}
                />
              </li>
            ))}
          </ul>
        )}

        {!loading && !empty && activeMode === 'specimens' && (
          <>
            <div className="exp-cat__indexHead exp-label" aria-hidden="true">
              <span>Accession</span>
              <span>Record</span>
              <span>Territory</span>
              <span>Complexity</span>
              <span>Stitches</span>
              <span>Status</span>
            </div>
            <ul className="exp-cat__index">
              {artifacts.map((a, i) => (
                <li key={a.record.id} style={{ '--i': Math.min(i, 6) } as CSSProperties}>
                  <SpecimenRow
                    artifact={a}
                    selected={a.record.id === activeSel}
                    onSelect={() => selectAndExamine(a)}
                  />
                </li>
              ))}
            </ul>
          </>
        )}

        {!loading && !empty && activeMode === 'detail' && selected && (
          <DetailView
            artifact={selected}
            artifacts={artifacts}
            onSelect={select}
            onAcquire={onAcquire}
          />
        )}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- archive -- */

function ArchiveCard({
  artifact,
  selected,
  onSelect,
}: {
  artifact: ResolvedArtifact;
  selected: boolean;
  onSelect: () => void;
}) {
  const { record, territory, fabric } = artifact;
  const archived = record.available === 0;
  return (
    <button type="button" className="exp-cat__card" aria-pressed={selected} onClick={onSelect}>
      <ArtifactPlate artifact={artifact} ratio="4 / 5" className="exp-cat__cardPlate" />
      <span className="exp-cat__cardHead">
        <span className="exp-meta">{record.accession}</span>
        <span className="exp-meta">{stratum(record.depth)}</span>
      </span>
      <span className="exp-heading exp-cat__cardName">{record.name}</span>
      <span className="exp-caption exp-cat__cardMeta">
        {territory.name} · {fabric.name}
      </span>
      <span className="exp-cat__cardFoot">
        <span className={`exp-chip ${archived ? 'exp-chip--archived' : 'exp-chip--available'}`}>
          {archived ? 'Archived' : `${record.available} released`}
        </span>
        <Complexity value={complexity(artifact)} />
      </span>
    </button>
  );
}

/* -------------------------------------------------------------- specimens -- */

function SpecimenRow({
  artifact,
  selected,
  onSelect,
}: {
  artifact: ResolvedArtifact;
  selected: boolean;
  onSelect: () => void;
}) {
  const { record, territory, stitches } = artifact;
  const archived = record.available === 0;
  return (
    <button type="button" className="exp-cat__row" aria-pressed={selected} onClick={onSelect}>
      <span className="exp-meta exp-cat__rowAcc">
        <ArtifactPlate
          artifact={artifact}
          ratio="1 / 1"
          zoom={0.9}
          marks={false}
          className="exp-cat__rowPlate"
        />
        {record.accession}
      </span>
      <span className="exp-cat__rowName">{record.name}</span>
      <span className="exp-caption exp-cat__rowCell">{territory.name}</span>
      <span className="exp-cat__rowCell">
        <Complexity value={complexity(artifact)} />
      </span>
      <span className="exp-meta exp-cat__rowCell">{formatCount(stitches)}</span>
      <span className={`exp-meta exp-cat__rowCell ${archived ? 'exp-cat__rowCell--faint' : ''}`}>
        {archived ? 'Archived' : `${record.available} avail.`}
      </span>
    </button>
  );
}

/* ----------------------------------------------------------------- detail -- */

function DetailView({
  artifact,
  artifacts,
  onSelect,
  onAcquire,
}: {
  artifact: ResolvedArtifact;
  artifacts: ResolvedArtifact[];
  onSelect: (a: ResolvedArtifact) => void;
  onAcquire?: (a: ResolvedArtifact) => void;
}) {
  const { record, territory, fabric, garment, threads, stitches } = artifact;
  const railRef = useRef<HTMLDivElement>(null);

  // Keep the examined record's thumbnail in view when selection changes from
  // outside the rail (the wall, the index, a map click).
  useEffect(() => {
    const el = railRef.current?.querySelector<HTMLElement>('[aria-pressed="true"]');
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [record.id]);

  return (
    <div className="exp-cat__detail">
      <ArtifactPlate
        key={record.id}
        artifact={artifact}
        ratio="1 / 1"
        zoom={1.12}
        className="exp-cat__detailPlate"
      />

      <div className="exp-cat__detailRecord">
        <span className="exp-label">{record.accession}</span>
        <h3 className="exp-title">{record.name}</h3>
        <p className="exp-body">{record.narrative}</p>

        <dl className="exp-stamp exp-cat__detailStamp">
          <dt>Territory</dt>
          <dd>{territory.name}</dd>
          <dt>Stratum</dt>
          <dd>
            {stratum(record.depth)} · recorded {stampDate(record.recorded)}
          </dd>
          <dt>Ground</dt>
          <dd>
            {fabric.name} · {fabric.gsm}gsm · {fabric.weave}
          </dd>
          <dt>Carrier</dt>
          <dd>{garment.name}</dd>
          <dt>Run</dt>
          <dd>
            {formatCount(stitches)} stitches · {threads.length} threads
          </dd>
          <dt>Class</dt>
          <dd>{RARITY_COPY[record.rarity]}</dd>
        </dl>

        {onAcquire && (
          <button
            type="button"
            className="exp-action exp-action--primary"
            disabled={record.available === 0}
            onClick={() => onAcquire(artifact)}
          >
            {record.available === 0 ? 'Archived — not released' : 'Acquire this specimen'}
          </button>
        )}
      </div>

      <div className="exp-cat__rail" ref={railRef} role="group" aria-label="Other records">
        {artifacts.map((a) => (
          <button
            key={a.record.id}
            type="button"
            className="exp-cat__railItem"
            aria-pressed={a.record.id === record.id}
            onClick={() => onSelect(a)}
          >
            <ArtifactPlate artifact={a} ratio="1 / 1" zoom={0.85} marks={false} />
            <span className="exp-sr">{a.record.name}</span>
            <span className="exp-meta" aria-hidden="true">
              {a.record.accession.split('-').pop()}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ complexity -- */

/** Five steps, filled to the derived score. Text alternative is not optional. */
function Complexity({ value }: { value: number }) {
  return (
    <span className="exp-cat__cx" title={`Embroidery complexity ${value} of 5`}>
      <span className="exp-sr">Complexity {value} of 5</span>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className="exp-cat__cxStep" data-on={n <= value || undefined} aria-hidden="true" />
      ))}
    </span>
  );
}
