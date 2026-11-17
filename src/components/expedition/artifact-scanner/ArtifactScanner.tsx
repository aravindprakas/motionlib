// ArtifactScanner — examination, with the answer to "where am I looking?" always on screen
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { ArtifactPlate } from '@/lib/ArtifactPlate';
import { useSizeBand } from '@/lib/useSizeBand';
import { RESOLVED, regionsFor, type ExamRegion, type ResolvedArtifact } from '@/lib/expedition';

export interface ArtifactScannerProps {
  artifact?: ResolvedArtifact;
  /** Defaults to the curated regions for the artifact's design. */
  regions?: ExamRegion[];
  /** Controlled examined region. `null` is the released, whole-plate state. */
  regionId?: string | null;
  onRegionChange?: (regionId: string | null) => void;
  /**
   * Fraction of the examination window the region should fill when examined.
   * Below ~0.5 the zoom stops feeling like an examination; above ~0.8 the
   * surrounding motif disappears and orientation goes with it.
   */
  fill?: number;
  className?: string;
}

/**
 * The plate is drawn at 58% of the plate box, centred — the geometry
 * `ArtifactPlate` uses. Regions are authored in the design's 200-unit viewBox,
 * so this is the one place the two coordinate systems meet.
 */
const ART_FRACTION = 58;
const ART_ORIGIN = (100 - ART_FRACTION) / 2;
const VIEW = 200;

function toPlatePct(v: number): number {
  return ART_ORIGIN + (v / VIEW) * ART_FRACTION;
}

/**
 * An examination tool, not a magnifier.
 *
 * A hover-magnifier answers "what do those pixels look like bigger", which is
 * the least interesting question about embroidery. What a customer actually
 * needs to know is what a *named part* of the design is: which stitch type,
 * which thread, how much of the run it costs. So examination here is discrete —
 * three curated regions, each with the archive's readings attached — and the
 * zoom exists to make the reading legible, not to be the feature.
 *
 * The orientation problem that kills every zoom UI is solved by keeping the
 * whole plate on screen the entire time: the locator holds the frame you are
 * inside, and the frame moves when you move. You always know where you are.
 *
 * Every route in is equal: click a marker, tab to it and press Enter, or use
 * the region list. Left/Right cycles regions while examining, Escape releases.
 * Nothing is hover-only — hover merely previews the marker's label.
 *
 * The zoom is one `transform: translate() scale()` on a wrapper. No filters, no
 * canvas, no image re-request, no layout: the browser composites a layer it has
 * already painted, which is what makes it hold 60fps on a budget phone.
 */
export function ArtifactScanner({
  artifact = RESOLVED[0],
  regions,
  regionId,
  onRegionChange,
  fill = 0.66,
  className = '',
}: ArtifactScannerProps) {
  const rootRef = useRef<HTMLElement>(null);
  const band = useSizeBand(rootRef, { regular: 620, wide: 980 });
  const list = regions ?? regionsFor(artifact.design.id);

  const [internal, setInternal] = useState<string | null>(null);
  const active = regionId !== undefined ? regionId : internal;
  const region = list.find((r) => r.id === active) ?? null;
  const markersRef = useRef<(HTMLButtonElement | null)[]>([]);

  const setRegion = (next: string | null) => {
    if (regionId === undefined) setInternal(next);
    onRegionChange?.(next);
  };

  // Escape releases from anywhere inside the component — the examination is a
  // mode, and a mode you cannot leave with Escape is a trap.
  useEffect(() => {
    if (!region) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setRegion(null);
    };
    const el = rootRef.current;
    el?.addEventListener('keydown', onKey);
    return () => el?.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region?.id]);

  const cycle = (e: KeyboardEvent, i: number) => {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (i + delta + list.length) % list.length;
    setRegion(list[next].id);
    markersRef.current[next]?.focus();
  };

  // Geometry. Everything below is percentages of the examination window, so a
  // resize needs no recalculation and no measurement.
  const cx = region ? toPlatePct(region.x) : 50;
  const cy = region ? toPlatePct(region.y) : 50;
  const rPct = region ? (region.r / VIEW) * ART_FRACTION : 0;
  const scale = region ? Math.min(4.2, (fill * 100) / (rPct * 2)) : 1;
  const mm = region ? Math.round(((region.r * 2) / VIEW) * artifact.design.widthMm) : 0;

  const surfaceStyle: CSSProperties = {
    transform: region
      ? `translate(${(50 - cx).toFixed(3)}%, ${(50 - cy).toFixed(3)}%) scale(${scale.toFixed(3)})`
      : 'none',
    transformOrigin: `${cx}% ${cy}%`,
  };

  return (
    <section
      ref={rootRef}
      className={`exp exp-scan ${className}`}
      aria-label={`Examination of ${artifact.record.name}`}
    >
      <div className="exp-scan__grid exp-section">
        <div className="exp-scan__window" data-examining={region ? true : undefined}>
          <div className="exp-scan__surface" style={surfaceStyle}>
            <ArtifactPlate artifact={artifact} ratio="1 / 1" marks={!region} />
          </div>

          {/* Markers ride the plate, so they are still in the right place when
              it is zoomed — the reason they live outside the transformed
              surface is that they must not scale with it. */}
          {list.map((r, i) => {
            const on = r.id === active;
            const mx = region ? 50 + (toPlatePct(r.x) - cx) * scale : toPlatePct(r.x);
            const my = region ? 50 + (toPlatePct(r.y) - cy) * scale : toPlatePct(r.y);
            // At rest a marker is sized to the region it stands for, so the
            // plate shows how much of the motif each examination covers. Under
            // examination they become uniform 44px targets: there they are
            // navigation between regions, and a marker scaled by 4x would be a
            // ring the size of the window.
            const size = region
              ? 44
              : Math.max(44, (r.r / VIEW) * ART_FRACTION * 2 * 3.4);
            return (
              <button
                key={r.id}
                ref={(el) => {
                  markersRef.current[i] = el;
                }}
                type="button"
                className="exp-scan__marker"
                aria-pressed={on}
                onClick={() => setRegion(on ? null : r.id)}
                onKeyDown={(e) => cycle(e, i)}
                style={
                  {
                    left: `${mx}%`,
                    top: `${my}%`,
                    '--size': `${Math.min(size, 220)}px`,
                  } as CSSProperties
                }
              >
                <span className="exp-scan__markerRing" aria-hidden="true" />
                <span className="exp-scan__markerLabel exp-meta">{r.label}</span>
              </button>
            );
          })}

          {/* Locator: the whole plate, small, with the frame you are inside. */}
          <div className="exp-scan__locator" aria-hidden="true" data-on={region ? true : undefined}>
            <ArtifactPlate artifact={artifact} ratio="1 / 1" zoom={1} marks={false} />
            <span
              className="exp-scan__locatorFrame"
              style={{
                left: `${cx - rPct}%`,
                top: `${cy - rPct}%`,
                width: `${rPct * 2}%`,
                height: `${rPct * 2}%`,
              }}
            />
          </div>

          {region && (
            <button
              type="button"
              className="exp-action exp-action--quiet exp-scan__release"
              onClick={() => setRegion(null)}
            >
              Release · Esc
            </button>
          )}
        </div>

        <div className="exp-scan__readout">
          <header className="exp-scan__readoutHead">
            <span className="exp-label">Examination</span>
            <p className="exp-heading">{region ? region.label : artifact.record.name}</p>
            <p className="exp-meta">
              {region
                ? `Field of view ${mm}mm · ${Math.round(scale * 100)}%`
                : `${artifact.design.widthMm}×${artifact.design.heightMm}mm · whole plate`}
            </p>
          </header>

          {region ? (
            <dl className="exp-stamp exp-scan__readings" key={region.id}>
              {region.readings.map((r, i) => (
                <div key={r.key} className="exp-scan__reading" style={{ '--i': i } as CSSProperties}>
                  <dt>{r.key}</dt>
                  <dd>{r.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="exp-caption exp-scan__prompt">
              Three regions are documented on this plate. Select one to bring it under
              examination — the locator keeps the whole piece in view.
            </p>
          )}

          <nav className="exp-scan__regions" aria-label="Documented regions">
            {list.map((r) => (
              <button
                key={r.id}
                type="button"
                className="exp-scan__regionBtn"
                aria-pressed={r.id === active}
                onClick={() => setRegion(r.id === active ? null : r.id)}
              >
                <span className="exp-scan__regionDot" aria-hidden="true" />
                {r.label}
              </button>
            ))}
          </nav>

          {band !== 'compact' && (
            <p className="exp-caption exp-scan__hint">
              Arrow keys move between regions while examining. Escape releases.
            </p>
          )}
        </div>
      </div>

      <p aria-live="polite" className="exp-sr">
        {region
          ? `Examining ${region.label}. ${region.readings.map((r) => `${r.key}: ${r.value}`).join('. ')}.`
          : 'Whole plate in view.'}
      </p>
    </section>
  );
}
