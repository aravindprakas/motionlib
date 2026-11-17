// CollectionVault — an exhibition room: one piece dominant, the rest orbiting it in rank
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArtifactPlate } from '@/lib/ArtifactPlate';
import { useSizeBand } from '@/lib/useSizeBand';
import {
  CONDITION_COPY,
  RARITY_COPY,
  RESOLVED,
  formatCount,
  stampDate,
  type ResolvedArtifact,
} from '@/lib/expedition';

export interface CollectionVaultProps {
  artifacts?: ResolvedArtifact[];
  /** Collection title, printed as the exhibition's own label. */
  collection?: string;
  /** Controlled dominant artifact. */
  featuredId?: string;
  onFeaturedChange?: (id: string) => void;
  /** The product action on the dominant piece. */
  onOpen?: (artifact: ResolvedArtifact) => void;
  openLabel?: string;
  className?: string;
}

/**
 * The collection room.
 *
 * A gallery grid says every piece is equally important, which is the one thing a
 * collection is never true about. An exhibition has a hang: something is
 * dominant, two things support it, the rest are in the room. So this component
 * holds a *rank* rather than a list — selecting a piece promotes it and demotes
 * the current dominant into the supporting ring, keeping everything else's
 * relative order. The layout hierarchy is the state.
 *
 * That rotation is also what makes it browsable without a carousel: there is no
 * hidden off-screen queue, no autoplay, no wrap-around confusion. Every piece in
 * the room is visible and one press from the wall.
 *
 * Ranks are declared once as CSS custom properties on the container and the
 * plates read them, so promotion is a class/attribute change and a transform —
 * no measuring, no FLIP, no re-layout of the room. Under reduced motion the
 * swap is instant and nothing else changes.
 *
 * Compact bodies get a strongly ordered vertical exhibition instead of a
 * miniature wall: dominant piece full width with its full label, then the room
 * in rank order. The hierarchy survives; the geometry does not pretend.
 */
export function CollectionVault({
  artifacts = RESOLVED,
  collection = 'The Coimbatore Collection',
  featuredId,
  onFeaturedChange,
  onOpen,
  openLabel = 'Take this piece',
  className = '',
}: CollectionVaultProps) {
  const rootRef = useRef<HTMLElement>(null);
  const band = useSizeBand(rootRef, { regular: 640, wide: 1040 });
  const [internalId, setInternalId] = useState(artifacts[0]?.record.id ?? '');
  const activeId = featuredId ?? internalId;

  const promote = useCallback(
    (id: string) => {
      if (featuredId === undefined) setInternalId(id);
      onFeaturedChange?.(id);
    },
    [featuredId, onFeaturedChange],
  );

  // The hang: dominant first, then the room in its original order. Rotating
  // rather than sorting keeps neighbours next to each other, so the room does
  // not reshuffle itself every time you look at something.
  const index = Math.max(0, artifacts.findIndex((a) => a.record.id === activeId));
  const hang = [...artifacts.slice(index), ...artifacts.slice(0, index)];
  const dominant = hang[0];
  const supports = hang.slice(1);

  const step = useCallback(
    (delta: number) => {
      const next = artifacts[(index + delta + artifacts.length) % artifacts.length];
      promote(next.record.id);
    },
    [artifacts, index, promote],
  );

  // Left/Right move along the hang whenever focus is inside the room.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
      else return;
      e.preventDefault();
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [step]);

  if (!dominant) return null;

  return (
    <section
      ref={rootRef}
      className={`exp exp-room ${className}`}
      aria-label={`${collection} — exhibition`}
    >
      <div className="exp-room__grid exp-section">
        <header className="exp-room__head">
          <div>
            <span className="exp-label">Collection vault</span>
            <h2 className="exp-title">{collection}</h2>
          </div>
          <div className="exp-room__nav">
            <span className="exp-meta">
              {String(index + 1).padStart(2, '0')} / {String(artifacts.length).padStart(2, '0')}
            </span>
            <button
              type="button"
              className="exp-action exp-action--quiet"
              onClick={() => step(-1)}
              aria-label="Previous piece in the hang"
            >
              ←
            </button>
            <button
              type="button"
              className="exp-action exp-action--quiet"
              onClick={() => step(1)}
              aria-label="Next piece in the hang"
            >
              →
            </button>
          </div>
        </header>

        <figure className="exp-room__wall">
          <ArtifactPlate
            key={dominant.record.id}
            artifact={dominant}
            mode="carrier"
            ratio={band === 'compact' ? '4 / 5' : '16 / 11'}
            zoom={1.05}
            loading="eager"
            className="exp-room__dominant"
          />
          <figcaption className="exp-room__caption">
            <span className="exp-label exp-label--ink">
              {dominant.record.accession} · {dominant.territory.name}
            </span>
            <h3 className="exp-display exp-room__title">{dominant.record.name}</h3>
            <p className="exp-body exp-room__narrative">{dominant.record.narrative}</p>
            <dl className="exp-stamp exp-room__stamp">
              <dt>Material</dt>
              <dd>
                {dominant.fabric.name} · {dominant.fabric.gsm}gsm · {dominant.fabric.weave}
              </dd>
              <dt>Carrier</dt>
              <dd>{dominant.garment.name}</dd>
              <dt>Run</dt>
              <dd>
                {formatCount(dominant.stitches)} stitches · {dominant.threads.length} threads
              </dd>
              <dt>Class</dt>
              <dd>{RARITY_COPY[dominant.record.rarity]}</dd>
              <dt>Condition</dt>
              <dd>{CONDITION_COPY[dominant.record.condition]}</dd>
              <dt>Recorded</dt>
              <dd>{stampDate(dominant.record.recorded)}</dd>
            </dl>
            <div className="exp-room__actions">
              {onOpen && (
                <button
                  type="button"
                  className="exp-action exp-action--primary"
                  disabled={dominant.record.available === 0}
                  onClick={() => onOpen(dominant)}
                >
                  {dominant.record.available === 0 ? 'Archived — not released' : openLabel}
                </button>
              )}
              <span
                className={`exp-chip ${dominant.record.available === 0 ? 'exp-chip--archived' : 'exp-chip--available'}`}
              >
                {dominant.record.available === 0
                  ? 'Documented only'
                  : dominant.record.editionOf
                    ? `${dominant.record.available} of ${dominant.record.editionOf}`
                    : `${dominant.record.available} released`}
              </span>
            </div>
          </figcaption>
        </figure>

        {/* The room. Rank is a custom property; the plate reads it. */}
        <div className="exp-room__ring" role="group" aria-label="Rest of the room">
          {supports.map((a, i) => (
            <button
              key={a.record.id}
              type="button"
              className="exp-room__support"
              style={{ '--rank': i } as CSSProperties}
              data-rank={i}
              onClick={() => promote(a.record.id)}
            >
              <ArtifactPlate artifact={a} ratio="1 / 1" zoom={0.92} marks={i === 0} />
              <span className="exp-room__supportLabel">
                <span className="exp-room__supportName">{a.record.name}</span>
                <span className="exp-meta">
                  {a.record.accession} · {a.territory.name}
                </span>
              </span>
              <span className="exp-sr">Bring to the wall</span>
            </button>
          ))}
        </div>
      </div>

      <p aria-live="polite" className="exp-sr">
        On the wall: {dominant.record.name}, {dominant.record.accession}, {dominant.territory.name}.
      </p>
    </section>
  );
}
