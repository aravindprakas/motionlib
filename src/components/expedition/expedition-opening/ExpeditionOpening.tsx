// ExpeditionOpening — opening the archive, not landing on a page
import { useRef, useState } from 'react';
import { ArtifactPlate } from '@/lib/ArtifactPlate';
import { useSizeBand } from '@/lib/useSizeBand';
import {
  RARITY_COPY,
  RESOLVED,
  stampDate,
  stratum,
  type ResolvedArtifact,
} from '@/lib/expedition';

export interface ExpeditionMeta {
  /** Expedition number. Printed as the first thing on the screen. */
  code: string;
  season: string;
  /** Where the survey was run — the archive's own region, not a country. */
  region: string;
  /** One sentence of what this expedition was looking for. */
  brief: string;
}

export interface ExpeditionOpeningProps {
  expedition?: ExpeditionMeta;
  /** The finds in this expedition. The first is featured on mount. */
  artifacts?: ResolvedArtifact[];
  /** Controlled featured artifact id. */
  featuredId?: string;
  onFeaturedChange?: (id: string) => void;
  /** The discovery action. Given no handler the button is not rendered. */
  onOpen?: (artifact: ResolvedArtifact) => void;
  openLabel?: string;
  className?: string;
}

const DEFAULT_EXPEDITION: ExpeditionMeta = {
  code: 'EXP·07',
  season: 'Season 2026',
  region: 'Coimbatore Survey',
  brief:
    'Six pieces recovered, documented and re-cut for wear. Everything below is a record first and a garment second.',
};

/**
 * The opening of an archive.
 *
 * A conventional hero answers "what is this company"; this answers "what have
 * we found, and where is it filed" — because that is the question the rest of
 * the interface is organised around, and a customer who learns the archive's
 * grammar here can read every other screen in the set without being taught
 * again. Expedition code, stratum, accession number and site all appear once,
 * in the positions they keep for the whole product.
 *
 * The featured artifact is a real control, not a slideshow: the strip along the
 * bottom is a set of pressed buttons, the plate swaps on a focus pull, and the
 * change is announced. Nothing auto-advances — an archive does not shuffle its
 * own drawers while you are reading.
 *
 * Composition is decided by the component's own width via `useSizeBand`, so the
 * opening reads correctly at 320px, in a 768px tablet column and full-bleed at
 * 2560px without three separate code paths. The plate is one `<div>` with two
 * gradients and an inline SVG, so the swap costs a composite and nothing else.
 */
export function ExpeditionOpening({
  expedition = DEFAULT_EXPEDITION,
  artifacts = RESOLVED,
  featuredId,
  onFeaturedChange,
  onOpen,
  openLabel = 'Open the record',
  className = '',
}: ExpeditionOpeningProps) {
  const rootRef = useRef<HTMLElement>(null);
  const band = useSizeBand(rootRef, { regular: 640, wide: 1040 });
  const [internalId, setInternalId] = useState(artifacts[0]?.record.id ?? '');
  const activeId = featuredId ?? internalId;
  const featured = artifacts.find((a) => a.record.id === activeId) ?? artifacts[0];

  const select = (id: string) => {
    if (featuredId === undefined) setInternalId(id);
    onFeaturedChange?.(id);
  };

  if (!featured) return null;
  const { record, territory, fabric } = featured;

  return (
    <section
      ref={rootRef}
      className={`exp exp-open ${className}`}
      aria-labelledby={`${record.id}-open-title`}
    >
      <div className="exp-open__grid exp-section">
        <header className="exp-open__marker">
          <span className="exp-label exp-label--ink">{expedition.code}</span>
          <span className="exp-open__markerRule" aria-hidden="true" />
          <span className="exp-meta">{expedition.season}</span>
          <span className="exp-open__markerRule" aria-hidden="true" />
          <span className="exp-meta">{expedition.region}</span>
        </header>

        <figure className="exp-open__figure">
          <div className="exp-open__plateWrap">
            {/* Keyed so a swap remounts the plate and re-runs the focus pull.
                The plate is stateless, so a remount costs one paint. */}
            <ArtifactPlate
              key={record.id}
              artifact={featured}
              ratio={band === 'compact' ? '4 / 5' : '5 / 6'}
              loading="eager"
              className="exp-open__plate"
            />
            <span className="exp-open__depth" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((d) => (
                <span
                  key={d}
                  className="exp-open__depthMark"
                  data-active={d === record.depth || undefined}
                />
              ))}
            </span>
          </div>
          <figcaption className="exp-open__figcap exp-meta">
            {stratum(record.depth)} · {record.site} · recorded {stampDate(record.recorded)}
          </figcaption>
        </figure>

        <div className="exp-open__record">
          <p className="exp-label">Featured find · {record.accession}</p>
          <h1 id={`${record.id}-open-title`} className="exp-display exp-open__title">
            {record.name}
          </h1>

          <dl className="exp-stamp exp-open__stamp">
            <dt>Territory</dt>
            <dd>{territory.name}</dd>
            <dt>Ground</dt>
            <dd>
              {fabric.name} · {fabric.gsm}gsm
            </dd>
            <dt>Classification</dt>
            <dd>{RARITY_COPY[record.rarity]}</dd>
          </dl>

          {onOpen && (
            <button type="button" className="exp-action exp-action--primary exp-open__cta" onClick={() => onOpen(featured)}>
              {openLabel}
              <svg width="22" height="8" viewBox="0 0 22 8" aria-hidden="true" focusable="false">
                <path d="M0 4h20M17 1l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </button>
          )}

          <p className="exp-body exp-open__narrative">{record.narrative}</p>
          <p className="exp-caption exp-open__brief">{expedition.brief}</p>
        </div>

        <nav className="exp-open__index" aria-label="Other finds in this expedition">
          <ul className="exp-open__indexList">
            {artifacts.map((a, i) => {
              const on = a.record.id === activeId;
              return (
                <li key={a.record.id}>
                  <button
                    type="button"
                    className="exp-open__indexItem"
                    aria-pressed={on}
                    onClick={() => select(a.record.id)}
                  >
                    <span className="exp-open__indexNo exp-meta">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <ArtifactPlate
                      artifact={a}
                      ratio="1 / 1"
                      zoom={0.8}
                      marks={false}
                      className="exp-open__indexPlate"
                    />
                    <span className="exp-open__indexName">{a.record.name}</span>
                    <span className="exp-meta exp-open__indexAcc">{a.record.accession}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* The swap is visual; this is how it reaches a screen reader. */}
      <p aria-live="polite" className="exp-sr">
        Featured find: {record.name}, accession {record.accession}, {territory.name}.
      </p>
    </section>
  );
}
