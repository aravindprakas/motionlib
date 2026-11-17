// ExpeditionMap — the collection as surveyed ground, and as an index when there is no room for ground
import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { ArtifactPlate } from '@/lib/ArtifactPlate';
import { useSizeBand } from '@/lib/useSizeBand';
import {
  RESOLVED,
  SURVEY_VIEWBOX,
  TERRITORIES,
  stratum,
  type ResolvedArtifact,
  type Territory,
} from '@/lib/expedition';

export interface ExpeditionMapProps {
  territories?: Territory[];
  artifacts?: ResolvedArtifact[];
  /** Controlled territory. `null` shows the whole survey. */
  territoryId?: string | null;
  onTerritoryChange?: (id: string | null) => void;
  onSelectArtifact?: (artifact: ResolvedArtifact) => void;
  /** Magnification applied when a territory is entered. */
  zoom?: number;
  className?: string;
}

const [, , VW, VH] = SURVEY_VIEWBOX.split(/\s+/).map(Number);

/**
 * Deterministic scatter of a territory's finds around its marker.
 *
 * Deterministic matters: a find has to be in the same place every render, or
 * the map stops being a map. Two constants and an index give a stable, even
 * ring without storing coordinates the archive does not actually have.
 */
function scatter(t: Territory, i: number, n: number): { x: number; y: number } {
  const angle = (i / Math.max(1, n)) * Math.PI * 2 + t.x;
  const radius = 9 + (i % 3) * 4;
  return { x: t.x + Math.cos(angle) * radius, y: t.y + Math.sin(angle) * radius * 0.72 };
}

/**
 * The collection as ground you cross, not a row of filter chips.
 *
 * Categories in a shop are a flat list, which is why nobody remembers where
 * anything was. A territory has a size, neighbours and a depth, so "Ceremonial
 * is small, deep and next to Floral Studies" becomes a spatial fact a customer
 * can re-find. Every mark on the field is real data: hull area is the region,
 * fill weight is its deepest stratum, each point is one accession.
 *
 * The metaphor stops exactly where it would start costing usability. Below
 * ~620px there is no room to pan a canvas with a thumb and still read a label,
 * so the map *becomes an index* — the same territories, the same counts, the
 * same records, as an expandable vertical list. That is a different component
 * body, not a scaled-down one, and it is the only honest way to keep a map on a
 * phone.
 *
 * Panning writes the transform straight to the element during the gesture and
 * tells React once on release — one style write per pointer event, no re-render
 * and no layout. Entering a territory eases the same transform on a 460ms
 * survey curve. Keyboard users get the same movement for free: focusing a
 * territory centres it.
 */
export function ExpeditionMap({
  territories = TERRITORIES,
  artifacts = RESOLVED,
  territoryId,
  onTerritoryChange,
  onSelectArtifact,
  zoom = 1.85,
  className = '',
}: ExpeditionMapProps) {
  const rootRef = useRef<HTMLElement>(null);
  const band = useSizeBand(rootRef, { regular: 620, wide: 1000 });
  const viewRef = useRef<SVGGElement>(null);
  const dragging = useRef(false);
  const origin = useRef({ x: 0, y: 0 });
  const pan = useRef({ x: 0, y: 0 });

  const [internal, setInternal] = useState<string | null>(null);
  const active = territoryId !== undefined ? territoryId : internal;
  const territory = territories.find((t) => t.id === active) ?? null;

  const setTerritory = useCallback(
    (id: string | null) => {
      pan.current = { x: 0, y: 0 };
      if (territoryId === undefined) setInternal(id);
      onTerritoryChange?.(id);
    },
    [territoryId, onTerritoryChange],
  );

  const finds = (t: Territory) => artifacts.filter((a) => a.record.territoryId === t.id);
  const inView = territory ? finds(territory) : artifacts;

  /* --------------------------------------------------------------- pan -- */

  const k = territory ? zoom : 1;
  const tx = territory ? territory.x : VW / 2;
  const ty = territory ? territory.y : VH / 2;
  const baseX = VW / 2 - k * tx;
  const baseY = VH / 2 - k * ty;

  const onPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!territory) return; // Nothing to pan to when the whole survey is in view.
    dragging.current = true;
    origin.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!dragging.current || !viewRef.current) return;
    const svg = e.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    // Client pixels to user units, so a drag moves the ground by the distance
    // the finger actually travelled at the current magnification.
    const ux = ((e.clientX - origin.current.x) / rect.width) * VW;
    const uy = ((e.clientY - origin.current.y) / rect.height) * VH;
    const nx = Math.max(-VW / 2, Math.min(VW / 2, pan.current.x + ux));
    const ny = Math.max(-VH / 2, Math.min(VH / 2, pan.current.y + uy));
    viewRef.current.style.transition = 'none';
    viewRef.current.style.transform = `translate(${baseX + nx}px, ${baseY + ny}px) scale(${k})`;
  };

  const endPan = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    const svg = e.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const ux = ((e.clientX - origin.current.x) / rect.width) * VW;
    const uy = ((e.clientY - origin.current.y) / rect.height) * VH;
    pan.current = {
      x: Math.max(-VW / 2, Math.min(VW / 2, pan.current.x + ux)),
      y: Math.max(-VH / 2, Math.min(VH / 2, pan.current.y + uy)),
    };
    if (viewRef.current) viewRef.current.style.transition = '';
  };

  const onTerritoryKey = (e: KeyboardEvent<SVGGElement>, t: Territory) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    setTerritory(t.id === active ? null : t.id);
  };

  /* ------------------------------------------------------------- index -- */

  // Compact: the survey is an index. Same data, same selection, no canvas.
  if (band === 'compact') {
    return (
      <section ref={rootRef} className={`exp exp-map ${className}`} aria-label="Collection survey">
        <div className="exp-section">
          <MapHeader territory={territory} count={inView.length} onClear={() => setTerritory(null)} />
          <ul className="exp-map__index">
            {territories.map((t) => {
              const list = finds(t);
              const on = t.id === active;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    className="exp-map__indexRow"
                    aria-expanded={on}
                    onClick={() => setTerritory(on ? null : t.id)}
                  >
                    <svg
                      className="exp-map__glyph"
                      viewBox={SURVEY_VIEWBOX}
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d={t.hull} />
                    </svg>
                    <span className="exp-map__indexName">{t.name}</span>
                    <span className="exp-meta">{String(list.length).padStart(2, '0')}</span>
                  </button>
                  {on && (
                    <div className="exp-map__indexBody">
                      <p className="exp-caption">{t.brief}</p>
                      <ul className="exp-map__finds">
                        {list.map((a) => (
                          <li key={a.record.id}>
                            <button
                              type="button"
                              className="exp-map__find"
                              onClick={() => onSelectArtifact?.(a)}
                            >
                              <ArtifactPlate artifact={a} ratio="1 / 1" zoom={0.9} marks={false} />
                              <span>
                                <span className="exp-map__findName">{a.record.name}</span>
                                <span className="exp-meta">
                                  {a.record.accession} · {stratum(a.record.depth)}
                                </span>
                              </span>
                            </button>
                          </li>
                        ))}
                        {list.length === 0 && (
                          <li className="exp-caption">Nothing recorded in this region yet.</li>
                        )}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    );
  }

  /* -------------------------------------------------------------- field -- */

  return (
    <section ref={rootRef} className={`exp exp-map ${className}`} aria-label="Collection survey">
      <div className="exp-map__grid exp-section">
        <div className="exp-map__fieldWrap">
          <MapHeader territory={territory} count={inView.length} onClear={() => setTerritory(null)} />
          <svg
            className="exp-map__field"
            viewBox={SURVEY_VIEWBOX}
            role="group"
            aria-label="Survey field. Five territories."
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endPan}
            onPointerCancel={endPan}
            data-panning={territory ? true : undefined}
          >
            {/* Survey grid. Drawn once as a pattern — no per-line elements. */}
            <defs>
              <pattern id="exp-map-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M10 0H0V10" fill="none" stroke="rgba(27,26,24,.08)" strokeWidth="0.4" />
              </pattern>
            </defs>
            <rect width={VW} height={VH} fill="url(#exp-map-grid)" />

            <g
              ref={viewRef}
              className="exp-map__view"
              style={{ transform: `translate(${baseX}px, ${baseY}px) scale(${k})` }}
            >
              {territories.map((t) => {
                const on = t.id === active;
                const list = finds(t);
                return (
                  <g
                    key={t.id}
                    className="exp-map__territory"
                    role="button"
                    tabIndex={0}
                    aria-pressed={on}
                    aria-label={`${t.name}, ${list.length} records. ${t.brief}`}
                    data-on={on || undefined}
                    data-dim={active && !on ? true : undefined}
                    onClick={() => setTerritory(on ? null : t.id)}
                    onKeyDown={(e) => onTerritoryKey(e, t)}
                  >
                    <path
                      className="exp-map__hull"
                      d={t.hull}
                      style={{ '--depth': t.maxDepth } as CSSProperties}
                    />
                    <text className="exp-map__name" x={t.x} y={t.y - 12} textAnchor="middle">
                      {t.name}
                    </text>
                    <text className="exp-map__count" x={t.x} y={t.y - 5} textAnchor="middle">
                      {String(list.length).padStart(2, '0')} REC
                    </text>
                    {list.map((a, i) => {
                      const p = scatter(t, i, list.length);
                      return (
                        <g
                          key={a.record.id}
                          className="exp-map__point"
                          transform={`translate(${p.x} ${p.y})`}
                          role="button"
                          tabIndex={on ? 0 : -1}
                          aria-label={`${a.record.name}, ${a.record.accession}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectArtifact?.(a);
                          }}
                          onKeyDown={(e) => {
                            if (e.key !== 'Enter' && e.key !== ' ') return;
                            e.preventDefault();
                            e.stopPropagation();
                            onSelectArtifact?.(a);
                          }}
                        >
                          <circle r="2.4" />
                          <circle className="exp-map__pointHit" r="6" />
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </g>
          </svg>
          <p className="exp-meta exp-map__legend">
            Fill weight = deepest stratum recorded · point = one accession · drag to move the ground
          </p>
        </div>

        <aside className="exp-map__panel" aria-live="polite">
          <span className="exp-label">{territory ? 'Territory' : 'Whole survey'}</span>
          <h3 className="exp-title">{territory ? territory.name : 'Five territories'}</h3>
          <p className="exp-body exp-map__brief">
            {territory
              ? territory.brief
              : 'Select a region to enter it. Every point on the field is one accession; the deeper the stratum, the heavier the ground.'}
          </p>
          <ul className="exp-map__finds">
            {inView.map((a) => (
              <li key={a.record.id}>
                <button
                  type="button"
                  className="exp-map__find"
                  onClick={() => onSelectArtifact?.(a)}
                >
                  <ArtifactPlate artifact={a} ratio="1 / 1" zoom={0.9} marks={false} />
                  <span>
                    <span className="exp-map__findName">{a.record.name}</span>
                    <span className="exp-meta">
                      {a.record.accession} · {stratum(a.record.depth)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}

function MapHeader({
  territory,
  count,
  onClear,
}: {
  territory: Territory | null;
  count: number;
  onClear: () => void;
}) {
  return (
    <header className="exp-map__head">
      <span className="exp-label exp-label--ink">
        Survey · {territory ? territory.name : 'all regions'} · {count} records
      </span>
      {territory && (
        <button type="button" className="exp-action exp-action--quiet" onClick={onClear}>
          Back to survey
        </button>
      )}
    </header>
  );
}
