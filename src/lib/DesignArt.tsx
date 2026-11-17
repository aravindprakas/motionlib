import { useId, type SVGProps } from 'react';
import { threadByCode, type EmbroideryDesign } from '@/lib/embroidery';

export interface DesignArtProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  design: EmbroideryDesign;
  /**
   * Per-block thread overrides, keyed by block id. Anything absent falls back
   * to the block's own thread, so a partial colourway is always renderable.
   */
  threads?: Record<string, string>;
  /** Diagonal stitch grain over filled blocks. Off for very small renderings. */
  grain?: boolean;
  /** Render outlines only — used where the design is a plan, not a product. */
  ghost?: boolean;
}

/**
 * The design, drawn once, statically.
 *
 * Five components need to put the same motif on screen with a different
 * colourway applied, and none of them should each own a slightly different copy
 * of that loop — a placement map and a thread palette disagreeing about how a
 * satin block renders is exactly the kind of drift that makes a component
 * library stop feeling like one product. So the rule lives here: a block with a
 * `weight` is stroked, a block without one is filled, and filled blocks get a
 * grain overlay so thread reads as thread rather than as vector art.
 *
 * No state, no effects, no measurement — it is a pure function of its props and
 * costs one element per block.
 */
export function DesignArt({
  design,
  threads,
  grain = true,
  ghost = false,
  ...rest
}: DesignArtProps) {
  const uid = useId().replace(/:/g, '');
  const [, , vw, vh] = design.viewBox.split(/\s+/).map(Number);

  return (
    <svg viewBox={design.viewBox} style={{ aspectRatio: `${vw} / ${vh}` }} {...rest}>
      {grain && !ghost && (
        <defs>
          <pattern
            id={`${uid}-grain`}
            width="3"
            height="3"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(52)"
          >
            <line x1="0" y1="0" x2="0" y2="3" stroke="#000" strokeWidth="0.9" opacity="0.2" />
          </pattern>
        </defs>
      )}

      {design.blocks.map((block) => {
        const thread = threadByCode(threads?.[block.id] ?? block.thread);
        if (ghost) {
          return (
            <path
              key={block.id}
              d={block.path}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          );
        }
        return block.weight == null ? (
          <g key={block.id}>
            <path d={block.path} fill={thread.hex} />
            {grain && <path d={block.path} fill={`url(#${uid}-grain)`} />}
          </g>
        ) : (
          <path
            key={block.id}
            d={block.path}
            fill="none"
            stroke={thread.hex}
            strokeWidth={block.weight}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
}
