import { useId, type CSSProperties } from 'react';
import { DesignArt } from '@/lib/DesignArt';
import { relativeLuminance } from '@/lib/embroidery';
import type { ResolvedArtifact } from '@/lib/expedition';

/**
 * Real photography, when there is any. The plate takes the same four
 * attributes a responsive `<img>` needs and nothing else — the group never
 * invents its own image abstraction, and every consumer keeps the browser's
 * own selection logic.
 */
export interface PlatePhoto {
  src: string;
  srcSet?: string;
  sizes?: string;
  /** Intrinsic pixel size. Required: it is what stops the plate reflowing. */
  width: number;
  height: number;
  alt?: string;
}

export interface ArtifactPlateProps {
  artifact: ResolvedArtifact;
  /**
   * `cloth` shows the motif on its ground at true proportion — the catalogue
   * view. `carrier` shows the garment silhouette with the motif placed on it —
   * the acquisition view, where what you are buying is the garment.
   */
  mode?: 'cloth' | 'carrier';
  /** Plate aspect ratio, as a CSS `aspect-ratio` value. */
  ratio?: string;
  /** 0.4–1.4. How much of the plate the motif fills. */
  zoom?: number;
  /** Per-block thread overrides, passed straight through to `DesignArt`. */
  threads?: Record<string, string>;
  /** Corner registration marks. Off for very small plates. */
  marks?: boolean;
  /** Photograph. When present it replaces the drawn plate entirely. */
  photo?: PlatePhoto;
  /** `lazy` everywhere except the one plate above the fold. */
  loading?: 'lazy' | 'eager';
  className?: string;
  style?: CSSProperties;
}

/**
 * The specimen plate — the one way this group puts an artifact on screen.
 *
 * Ten components need to show the same object and none of them should own a
 * slightly different version of it, so the rule lives here: a ground coloured
 * by the fabric, a woven grain sized to the fabric's gsm, the motif drawn by
 * the shared `DesignArt`, and four registration marks. A catalogue card, a
 * comparison column and an exhibition stage are then the *same photograph* at
 * three sizes rather than three drawings that nearly agree.
 *
 * It is deliberately not WebGL. A plate is a coloured box, one SVG of at most
 * a dozen paths, and two CSS gradients — it composites on the GPU, costs
 * nothing to instantiate, and a catalogue of forty of them still scrolls at
 * 60fps on a budget Android. Where a real photograph exists, `photo` replaces
 * the drawing and the browser's own `srcset` selection takes over; the wrapper
 * holds the aspect ratio either way, so swapping one for the other shifts
 * nothing on the page.
 *
 * Pure: no state, no effects, no measurement.
 */
export function ArtifactPlate({
  artifact,
  mode = 'cloth',
  ratio = '4 / 5',
  zoom = 1,
  threads,
  marks = true,
  photo,
  loading = 'lazy',
  className = '',
  style,
}: ArtifactPlateProps) {
  const uid = useId().replace(/:/g, '');
  const { fabric, design, garment, record } = artifact;

  // Grain pitch from cloth weight: a 400gsm canvas has a visibly coarser weave
  // than a 150gsm oxford, and the plate should say so before the spec sheet
  // does. Clamped so it never becomes a texture gimmick.
  const pitch = Math.max(3, Math.min(9, Math.round(fabric.gsm / 46)));
  // The studio light has to flip on a dark ground or the highlight disappears
  // and the shadow eats the motif. Measured, not guessed at from the hex.
  const dark = relativeLuminance(fabric.hex) < 0.22;

  return (
    <div
      className={`exp-plate ${className}`}
      style={{ aspectRatio: ratio, background: fabric.hex, ...style }}
      data-mode={mode}
    >
      {photo ? (
        <img
          className="exp-plate__photo"
          src={photo.src}
          srcSet={photo.srcSet}
          sizes={photo.sizes}
          width={photo.width}
          height={photo.height}
          alt={photo.alt ?? `${record.name}, accession ${record.accession}`}
          loading={loading}
          decoding="async"
        />
      ) : (
        <>
          {/* Weave. Two hairline gratings at right angles, drawn once as a
              background-image so it costs no elements and no paint work
              beyond the plate's own box. */}
          <span
            aria-hidden="true"
            className="exp-plate__weave"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,.05) 0 1px, transparent 1px ${pitch}px), repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 1px, transparent 1px ${pitch}px)`,
            }}
          />

          <div className="exp-plate__stage" style={{ '--zoom': zoom } as CSSProperties}>
            {mode === 'carrier' && (
              <svg
                className="exp-plate__carrier"
                viewBox={garment.viewBox}
                aria-hidden="true"
                focusable="false"
              >
                <path d={garment.path} fill="rgba(0,0,0,.07)" stroke="rgba(0,0,0,.28)" strokeWidth="1.2" />
                {garment.detail && (
                  <path d={garment.detail} fill="none" stroke="rgba(0,0,0,.2)" strokeWidth="0.8" />
                )}
              </svg>
            )}
            <DesignArt
              className="exp-plate__art"
              design={design}
              threads={threads}
              aria-hidden="true"
              focusable="false"
            />
          </div>

          {/* Studio light: one soft diagonal so a flat fill still reads as a
              photographed object rather than as vector art. */}
          <span
            aria-hidden="true"
            className="exp-plate__light"
            style={{
              background: dark
                ? 'linear-gradient(148deg, rgba(255,255,255,.12), transparent 46%, rgba(0,0,0,.24))'
                : 'linear-gradient(148deg, rgba(255,255,255,.34), transparent 46%, rgba(0,0,0,.14))',
            }}
          />
        </>
      )}

      {marks && (
        <svg className="exp-plate__marks" viewBox="0 0 100 100" aria-hidden="true" focusable="false" preserveAspectRatio="none">
          <g stroke="currentColor" strokeWidth="0.6" vectorEffect="non-scaling-stroke" fill="none">
            <path d="M2 8 L2 2 L8 2" />
            <path d="M92 2 L98 2 L98 8" />
            <path d="M98 92 L98 98 L92 98" />
            <path d="M8 98 L2 98 L2 92" />
          </g>
        </svg>
      )}
      <span className="exp-plate__id" aria-hidden="true" id={`${uid}-id`}>
        {record.accession}
      </span>
    </div>
  );
}
