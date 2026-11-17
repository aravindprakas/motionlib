/**
 * Expedition domain model — the accession layer over `@/lib/embroidery`.
 *
 * The `embroidery` group models what a stitch file *is*: ordered colour blocks,
 * thread codes, stitch counts. This layer models what an archive *says about*
 * that file — accession number, stratum, territory, rarity, condition,
 * recovery date, the narrative on the label. Nothing here duplicates the stitch
 * data; an `ArtifactRecord` points at a design, a garment and a fabric by id
 * and adds only the archival metadata on top.
 *
 * That split is deliberate. The archaeological framing is a *documentation*
 * model, not a re-skin: swap `ARTIFACTS` for a real accession export and every
 * component in the group re-labels itself, while the production maths — stitch
 * counts, thread metres, machine minutes, price — keeps coming from the same
 * `embroidery` functions the rest of the library quotes. A catalogue card and a
 * shop-floor gauge can never disagree about what a piece costs, because there
 * is only one estimator.
 *
 * Dependency-free: pure data and arithmetic, no React.
 */

import {
  DESIGNS,
  FABRICS,
  GARMENTS,
  estimate,
  threadByCode,
  totalStitches,
  type EmbroideryDesign,
  type Fabric,
  type Garment,
  type Thread,
} from '@/lib/embroidery';

/* ------------------------------------------------------------------ motion */

/**
 * Motion tokens for the group, named after the physical archive behaviours
 * they model. Declared once so ten components cannot drift apart — the same
 * discipline `MOTION`/`DUR` enforce in the embroidery group, tuned here for
 * paper and photographic plates rather than for a needle.
 */
export const EXP_MOTION = {
  /** Paper displacement: soft entry, long settle. Cards, sheets, labels. */
  paper: 'cubic-bezier(0.32, 0.72, 0, 1)',
  /** Precise index movement, no overshoot. Labels, indicators, rules. */
  precise: 'cubic-bezier(0.2, 0, 0, 1)',
  /** Optical focus pull, even at both ends. Plates, lenses, exhibition swaps. */
  focus: 'cubic-bezier(0.65, 0, 0.35, 1)',
  /** Controlled pan across a survey field. */
  survey: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
} as const;

export const EXP_DUR = {
  /** State echo on a control. */
  micro: 120,
  /** The house transition — a label sliding, a panel opening. */
  standard: 260,
  /** A plate changing, a mode recomposing. */
  slow: 460,
  /** Opening the archive. Used once per screen, never in a loop. */
  cinematic: 720,
} as const;

/* -------------------------------------------------------------- vocabulary */

/** How many exist. Drives the accession stamp, never the price. */
export type Rarity = 'series' | 'limited' | 'singular';

/** Physical state of the recovered piece. Drives availability copy. */
export type Condition = 'pristine' | 'stable' | 'fragile';

export const RARITY_COPY: Record<Rarity, string> = {
  series: 'Open series — reproduced to order',
  limited: 'Limited accession — numbered run',
  singular: 'Singular find — one recorded example',
};

export const CONDITION_COPY: Record<Condition, string> = {
  pristine: 'Complete. No restoration required.',
  stable: 'Sound. Minor thread loss at the edges.',
  fragile: 'Documented only. Reproduction, not the original.',
};

/* ------------------------------------------------------------- territories */

/**
 * A territory is a region of the catalogue drawn as a real shape on the survey
 * field — not a filter chip with a map sticker behind it. `hull` is authored in
 * the field's own viewBox so a territory's size on the map is a property of the
 * territory, and `x`/`y` is where its marker and label sit.
 */
export interface Territory {
  id: string;
  name: string;
  /** One line of what the region actually contains. */
  brief: string;
  /** Marker position in the survey viewBox. */
  x: number;
  y: number;
  /** Region outline in the survey viewBox. */
  hull: string;
  /** Deepest stratum recorded here — used for the depth scale on the map. */
  maxDepth: number;
}

export const SURVEY_VIEWBOX = '0 0 200 140';

export const TERRITORIES: Territory[] = [
  {
    id: 'floral-studies',
    name: 'Floral Studies',
    brief: 'Botanical motifs worked in satin and fill. The densest region on the survey.',
    x: 52,
    y: 46,
    hull: 'M18 30 L 62 18 L 92 34 L 86 66 L 44 78 L 14 58 Z',
    maxDepth: 5,
  },
  {
    id: 'ceremonial',
    name: 'Ceremonial',
    brief: 'Crests, monograms and banners. Heavy thread, high colour-change count.',
    x: 140,
    y: 40,
    hull: 'M100 22 L 150 14 L 182 32 L 176 62 L 130 70 L 98 50 Z',
    maxDepth: 4,
  },
  {
    id: 'geometric',
    name: 'Geometric',
    brief: 'Repeats, chevrons and rules. Machine-native structures, minimal jump stitching.',
    x: 44,
    y: 106,
    hull: 'M16 88 L 66 82 L 82 104 L 66 128 L 24 126 L 10 106 Z',
    maxDepth: 3,
  },
  {
    id: 'contemporary',
    name: 'Contemporary',
    brief: 'Current commissions. Shallow stratum — everything here was recorded this season.',
    x: 108,
    y: 100,
    hull: 'M88 82 L 130 78 L 144 100 L 128 124 L 92 122 L 80 102 Z',
    maxDepth: 2,
  },
  {
    id: 'heritage',
    name: 'Heritage',
    brief: 'Recovered pattern books. Reproduced from documentation, not from a surviving garment.',
    x: 170,
    y: 104,
    hull: 'M150 84 L 190 80 L 196 104 L 184 126 L 152 124 L 142 102 Z',
    maxDepth: 5,
  },
];

export function territoryById(id: string): Territory {
  return TERRITORIES.find((t) => t.id === id) ?? TERRITORIES[0];
}

/* --------------------------------------------------------------- artifacts */

export interface ArtifactRecord {
  id: string;
  /** Accession number. The primary human handle for the piece, everywhere. */
  accession: string;
  name: string;
  /** Ids into the embroidery model — the stitch truth is never copied here. */
  designId: string;
  garmentId: string;
  fabricId: string;
  territoryId: string;
  /**
   * Stratum, 1 (surface, current) to 5 (deep, archival). Ordering by depth is
   * the archive's own sort — newest at the top of the trench — so the catalogue
   * has a meaningful default order that is not "featured".
   */
  depth: number;
  rarity: Rarity;
  condition: Condition;
  /** ISO date the piece was documented. */
  recorded: string;
  /** Field-site reference: bay and drawer in the physical archive. */
  site: string;
  /** Two sentences for the label. Written as a record, not as marketing. */
  narrative: string;
  /** Numbered run size; `null` for an open series. */
  editionOf: number | null;
  /** Units currently released. 0 = archived: viewable, not acquirable. */
  available: number;
}

export const ARTIFACTS: ArtifactRecord[] = [
  {
    id: 'sprig-linen',
    accession: 'ARV-1148-04',
    name: 'Sprig No. 4',
    designId: 'sprig',
    garmentId: 'tee',
    fabricId: 'linen',
    territoryId: 'floral-studies',
    depth: 4,
    rarity: 'limited',
    condition: 'pristine',
    recorded: '2026-02-11',
    site: 'Bay 04 / Drawer 12',
    narrative:
      'Seven blocks in stitch order, the bloom worked as a solid fill against an open weave. The berry pair was added on a second pass and sits proud of the ground.',
    editionOf: 60,
    available: 22,
  },
  {
    id: 'crest-oxford',
    accession: 'ARV-1092-01',
    name: 'Atelier Crest',
    designId: 'crest',
    garmentId: 'tee',
    fabricId: 'oxford',
    territoryId: 'ceremonial',
    depth: 5,
    rarity: 'singular',
    condition: 'stable',
    recorded: '2025-11-30',
    site: 'Bay 01 / Drawer 03',
    narrative:
      'Recovered from a bound pattern book with the banner colour already specified. Four colour changes for a piece this size — an expensive object by any period’s standards.',
    editionOf: 1,
    available: 1,
  },
  {
    id: 'chevron-fleece',
    accession: 'ARV-1203-07',
    name: 'Chevron Repeat',
    designId: 'chevron',
    garmentId: 'hoodie',
    fabricId: 'brushed-fleece',
    territoryId: 'geometric',
    depth: 2,
    rarity: 'series',
    condition: 'pristine',
    recorded: '2026-05-02',
    site: 'Bay 07 / Drawer 21',
    narrative:
      'A two-run structure with seed stitch between. Runs fast on the machine and survives a brushed pile better than any fill in the archive.',
    editionOf: null,
    available: 140,
  },
  {
    id: 'sprig-canvas',
    accession: 'ARV-1148-09',
    name: 'Sprig, Waxed Ground',
    designId: 'sprig',
    garmentId: 'tee',
    fabricId: 'canvas',
    territoryId: 'heritage',
    depth: 5,
    rarity: 'limited',
    condition: 'fragile',
    recorded: '2025-09-18',
    site: 'Bay 09 / Drawer 02',
    narrative:
      'The same seven blocks laid onto a waxed ground at 400gsm. The wax resists the needle, so the original was run slow on a larger gauge and never reproduced at volume.',
    editionOf: 24,
    available: 0,
  },
  {
    id: 'crest-jersey',
    accession: 'ARV-1092-12',
    name: 'Crest, Eased Density',
    designId: 'crest',
    garmentId: 'tee',
    fabricId: 'heavy-jersey',
    territoryId: 'contemporary',
    depth: 1,
    rarity: 'series',
    condition: 'pristine',
    recorded: '2026-07-24',
    site: 'Bay 12 / Drawer 08',
    narrative:
      'A working re-issue: the banner fill eased ten percent so the knit stops puckering. Everything a customer sees is identical; everything the machine does is not.',
    editionOf: null,
    available: 86,
  },
  {
    id: 'chevron-linen',
    accession: 'ARV-1203-15',
    name: 'Chevron, Open Weave',
    designId: 'chevron',
    garmentId: 'cap',
    fabricId: 'linen',
    territoryId: 'contemporary',
    depth: 2,
    rarity: 'limited',
    condition: 'stable',
    recorded: '2026-06-09',
    site: 'Bay 12 / Drawer 19',
    narrative:
      'Scaled to a front panel and re-threaded warm. On a slub ground the outlines read and the seed stitch nearly vanishes, which is the point.',
    editionOf: 40,
    available: 11,
  },
];

/* -------------------------------------------------------------- resolution */

/** An artifact with its embroidery records already resolved. */
export interface ResolvedArtifact {
  record: ArtifactRecord;
  design: EmbroideryDesign;
  garment: Garment;
  fabric: Fabric;
  territory: Territory;
  /** Distinct threads in the design, in first-use order. */
  threads: Thread[];
  stitches: number;
}

function designById(id: string): EmbroideryDesign {
  return DESIGNS.find((d) => d.id === id) ?? DESIGNS[0];
}

function garmentById(id: string): Garment {
  return GARMENTS.find((g) => g.id === id) ?? GARMENTS[0];
}

export function fabricById(id: string): Fabric {
  return FABRICS.find((f) => f.id === id) ?? FABRICS[0];
}

/**
 * Never throws. An unknown design, garment or fabric id resolves to the first
 * record of its kind rather than blanking the plate — a catalogue that renders
 * a wrong-but-plausible artifact is recoverable; one that renders nothing looks
 * broken to the customer and hides the data error from us.
 */
export function resolve(record: ArtifactRecord): ResolvedArtifact {
  const design = designById(record.designId);
  const seen = new Set<string>();
  const threads: Thread[] = [];
  for (const block of design.blocks) {
    if (seen.has(block.thread)) continue;
    seen.add(block.thread);
    threads.push(threadByCode(block.thread));
  }
  return {
    record,
    design,
    garment: garmentById(record.garmentId),
    fabric: fabricById(record.fabricId),
    territory: territoryById(record.territoryId),
    threads,
    stitches: totalStitches(design),
  };
}

export const RESOLVED: ResolvedArtifact[] = ARTIFACTS.map(resolve);

export function artifactById(id: string): ResolvedArtifact {
  return RESOLVED.find((a) => a.record.id === id) ?? RESOLVED[0];
}

/* -------------------------------------------------------------- complexity */

/**
 * Embroidery complexity on a 1-5 scale, derived rather than authored.
 *
 * Stitch count alone is a bad proxy — a 6,000-stitch single-colour fill is a
 * cheap, boring run; a 3,000-stitch piece with five colour changes stops the
 * machine five times. So the score weighs the two things that actually cost the
 * floor: total stitches and thread changes. Deriving it means it cannot go
 * stale when a design is re-digitised.
 */
export function complexity(a: ResolvedArtifact): number {
  const stitchScore = Math.min(3, a.stitches / 2600);
  const colourScore = Math.min(2, (a.threads.length - 1) * 0.55);
  return Math.max(1, Math.min(5, Math.round(stitchScore + colourScore)));
}

/** Share of the run that is solid fill, 0..1 — the "density" read. */
export function fillRatio(a: ResolvedArtifact): number {
  const filled = a.design.blocks
    .filter((b) => b.weight == null)
    .reduce((n, b) => n + b.stitches, 0);
  return a.stitches ? filled / a.stitches : 0;
}

/* ------------------------------------------------------------- acquisition */

export interface AcquisitionInput {
  artifact: ResolvedArtifact;
  quantity: number;
  /** Finished width on the cloth. Defaults to the design's own width. */
  widthMm?: number;
}

export interface AcquisitionLine {
  label: string;
  value: string;
  /** Rendered as the record's emphasis row. */
  emphasis?: boolean;
}

export interface Acquisition {
  unitPrice: number;
  total: number;
  stitches: number;
  metres: number;
  minutesTotal: number;
  /** Working days before dispatch, from machine minutes plus a bench day. */
  leadDays: number;
  lines: AcquisitionLine[];
}

export function formatMoney(value: number, currency = '₹'): string {
  return `${currency}${Math.round(value).toLocaleString('en-IN')}`;
}

export function formatCount(value: number): string {
  return Math.round(value).toLocaleString('en-IN');
}

/**
 * The acquisition record.
 *
 * Everything numeric routes through `estimate()` from the embroidery model —
 * the same function the shop-floor estimator uses — so the archive's label and
 * the production quote are the same number by construction, not by review.
 *
 * With one correction. The estimator derives a stitch count from area, because
 * it exists to price work that has *not* been digitised yet. An accessioned
 * artifact has already been digitised: its real count is in the stitch file,
 * and quoting it through the area path put 68,585 stitches on a ledger whose
 * catalogue card said 6,530 — precisely the disagreement this layer exists to
 * prevent. So the area handed to the estimator is the area that reproduces the
 * *recorded* count at the estimator's own rate. That rate is probed from the
 * estimator rather than copied out of it, so re-tuning the shop's constants
 * re-tunes the archive automatically and neither can drift from the other.
 */
export function acquisition(
  { artifact, quantity, widthMm }: AcquisitionInput,
  currency = '₹',
): Acquisition {
  const w = widthMm ?? artifact.design.widthMm;
  const fill = fillRatio(artifact);
  const coverage = fill > 0.45 ? ('fill' as const) : ('outline' as const);
  const density = artifact.fabric.gsm >= 320 ? ('light' as const) : ('standard' as const);

  // Two 100cm² probes: one for the estimator's stitches-per-cm² at this
  // coverage, one for what the cloth's density does to it.
  const probe = { widthMm: 100, heightMm: 100, coverage, colours: 1, quantity: 1 };
  const ratePerCm2 = estimate({ ...probe, density: 'standard' }).stitches / 100;
  const densityFactor =
    estimate({ ...probe, density }).stitches / estimate({ ...probe, density: 'standard' }).stitches;

  // Resizing a design scales its count with area, not with width.
  const areaScale = (w / artifact.design.widthMm) ** 2;
  const stitches = artifact.stitches * areaScale * densityFactor;
  const side = Math.sqrt(stitches / ratePerCm2) * 10; // cm² back to mm

  const est = estimate({
    widthMm: side,
    heightMm: side,
    coverage,
    density: 'standard',
    colours: artifact.threads.length,
    quantity,
  });
  const leadDays = Math.max(3, Math.ceil(est.minutesTotal / 420) + 2);

  return {
    unitPrice: est.unitPrice,
    total: est.total,
    stitches: est.stitches,
    metres: est.metres,
    minutesTotal: est.minutesTotal,
    leadDays,
    lines: [
      { label: 'Specimen', value: `${artifact.record.name} / ${artifact.record.accession}` },
      { label: 'Ground', value: `${artifact.fabric.name} / ${artifact.fabric.gsm}gsm` },
      { label: 'Carrier', value: artifact.garment.name },
      { label: 'Stitch count', value: `${formatCount(est.stitches)} per unit` },
      { label: 'Thread', value: `${est.metres.toFixed(1)}m / ${artifact.threads.length} colours` },
      { label: 'Machine time', value: `${Math.round(est.minutesTotal)} min for the run` },
      { label: 'Release', value: `${formatMoney(est.unitPrice, currency)} per unit` },
      { label: 'Acquisition', value: formatMoney(est.total, currency), emphasis: true },
    ],
  };
}

/* ------------------------------------------------------------ examinations */

/**
 * A named region of a design worth looking at closely, with what the archive
 * knows about it. Authored per design rather than derived, because "the part
 * that is interesting" is a curatorial judgement and not a bounding box.
 *
 * `x`/`y`/`r` are in the design's own viewBox units, so a region stays pinned
 * to the motif at every rendered size — the scanner never converts to pixels
 * except at the moment it draws.
 */
export interface ExamRegion {
  id: string;
  label: string;
  x: number;
  y: number;
  r: number;
  readings: { key: string; value: string }[];
}

export const EXAM_REGIONS: Record<string, ExamRegion[]> = {
  sprig: [
    {
      id: 'bloom',
      label: 'Bloom',
      x: 120,
      y: 40,
      r: 30,
      readings: [
        { key: 'Pattern', value: 'Solid disc, radial entry' },
        { key: 'Technique', value: 'Tatami fill, 0.4mm spacing' },
        { key: 'Thread', value: '1147 Madder over 1210 Saffron core' },
        { key: 'Density', value: '2,260 stitches — 40% of the run' },
      ],
    },
    {
      id: 'leaves',
      label: 'Leaf pair',
      x: 80,
      y: 120,
      r: 34,
      readings: [
        { key: 'Pattern', value: 'Mirrored blades, off-axis' },
        { key: 'Technique', value: 'Satin, column width 2.1mm' },
        { key: 'Thread', value: '1305 Moss / 1319 Sage' },
        { key: 'Density', value: '2,220 stitches across both' },
      ],
    },
    {
      id: 'ring',
      label: 'Outer ring',
      x: 100,
      y: 182,
      r: 26,
      readings: [
        { key: 'Pattern', value: 'Single closed run' },
        { key: 'Technique', value: 'Running stitch, 1.6 weight' },
        { key: 'Thread', value: '1090 Soot' },
        { key: 'Density', value: '640 stitches — the cheapest block' },
      ],
    },
  ],
  crest: [
    {
      id: 'monogram',
      label: 'Monogram',
      x: 100,
      y: 82,
      r: 32,
      readings: [
        { key: 'Pattern', value: 'Two strokes and a bar' },
        { key: 'Technique', value: 'Satin, 7 weight — the widest column here' },
        { key: 'Thread', value: '1224 Brass' },
        { key: 'Density', value: '1,320 stitches' },
      ],
    },
    {
      id: 'banner',
      label: 'Banner',
      x: 100,
      y: 129,
      r: 30,
      readings: [
        { key: 'Pattern', value: 'Horizontal band, full width' },
        { key: 'Technique', value: 'Flat fill, cross-hatched underlay' },
        { key: 'Thread', value: '1420 Indigo' },
        { key: 'Density', value: '1,640 stitches — the largest block' },
      ],
    },
    {
      id: 'shield',
      label: 'Shield edge',
      x: 152,
      y: 60,
      r: 28,
      readings: [
        { key: 'Pattern', value: 'Closed outline, mitred shoulders' },
        { key: 'Technique', value: 'Running stitch, 2.4 weight' },
        { key: 'Thread', value: '1090 Soot' },
        { key: 'Density', value: '720 stitches' },
      ],
    },
  ],
  chevron: [
    {
      id: 'upper',
      label: 'Upper run',
      x: 100,
      y: 62,
      r: 32,
      readings: [
        { key: 'Pattern', value: 'Four-peak zigzag' },
        { key: 'Technique', value: 'Running stitch, 5 weight' },
        { key: 'Thread', value: '1147 Madder' },
        { key: 'Density', value: '380 stitches' },
      ],
    },
    {
      id: 'seed',
      label: 'Seed stitch',
      x: 100,
      y: 96,
      r: 24,
      readings: [
        { key: 'Pattern', value: 'Two isolated dots' },
        { key: 'Technique', value: 'Micro fill' },
        { key: 'Thread', value: '1210 Saffron' },
        { key: 'Density', value: '210 stitches — vanishes on a slub ground' },
      ],
    },
    {
      id: 'lower',
      label: 'Lower run',
      x: 100,
      y: 128,
      r: 32,
      readings: [
        { key: 'Pattern', value: 'Mirrored zigzag, phase-matched' },
        { key: 'Technique', value: 'Running stitch, 5 weight' },
        { key: 'Thread', value: '1420 Indigo' },
        { key: 'Density', value: '380 stitches' },
      ],
    },
  ],
};

export function regionsFor(designId: string): ExamRegion[] {
  return EXAM_REGIONS[designId] ?? EXAM_REGIONS.sprig;
}

/* ------------------------------------------------------------- field notes */

export interface FieldNote {
  id: string;
  /** Sequence within the journal — printed as the entry's index. */
  seq: number;
  date: string;
  place: string;
  heading: string;
  /** The observation. Plain prose, first person, no marketing. */
  observation: string;
  /** The technical note that follows it in the margin. */
  technical: string;
  /** Which artifact the entry is looking at, for the plate. */
  artifactId: string;
  /** Margin metadata, printed as a stamped block. */
  meta: { key: string; value: string }[];
}

export const FIELD_NOTES: FieldNote[] = [
  {
    id: 'n-01',
    seq: 1,
    date: '11 FEB 2026',
    place: 'Bay 04',
    heading: 'The weave decides the motif',
    observation:
      'Laid the Sprig against four grounds before settling. On washed linen the fill loses its edge and the outline carries the whole design — so the outline was re-weighted rather than the fill re-densified.',
    technical: 'Slub weave, 190gsm. Fill blocks eased; running blocks taken from 1.2 to 1.6 weight.',
    artifactId: 'sprig-linen',
    meta: [
      { key: 'Ground', value: 'Washed Linen' },
      { key: 'Stabiliser', value: 'Cut-away, 50g' },
    ],
  },
  {
    id: 'n-02',
    seq: 2,
    date: '30 NOV 2025',
    place: 'Bay 01',
    heading: 'Four stops for sixty-four millimetres',
    observation:
      'The crest came out of a bound pattern book with its colours already named. Four thread changes on a piece this small is extravagant, and it is the reason the original was never produced in quantity.',
    technical:
      'Colour changes cost ~27 seconds each on the head. On a run of 200 that is ninety minutes of the machine standing still.',
    artifactId: 'crest-oxford',
    meta: [
      { key: 'Changes', value: '4 stops' },
      { key: 'Ground', value: 'Cotton Oxford' },
    ],
  },
  {
    id: 'n-03',
    seq: 3,
    date: '02 MAY 2026',
    place: 'Bay 07',
    heading: 'What survives a brushed pile',
    observation:
      'Fills sink into fleece; the pile closes over them within a wash or two. Structures built from runs stay proud. The Chevron survives because there is almost nothing in it to swallow.',
    technical: 'Loop-back, 340gsm. Water-soluble topping, 5-weight runs, no fill wider than 4mm.',
    artifactId: 'chevron-fleece',
    meta: [
      { key: 'Topping', value: 'Water-soluble' },
      { key: 'Pile', value: 'Brushed, 2mm' },
    ],
  },
  {
    id: 'n-04',
    seq: 4,
    date: '18 SEP 2025',
    place: 'Bay 09',
    heading: 'Wax resists the needle',
    observation:
      'The waxed ground fought every pass. Larger gauge, slower run, no topping — and even then the piece is documented rather than reproduced. It is in the archive as evidence, not as stock.',
    technical: 'Plain weave, 400gsm, waxed. Needle up two sizes; run rate halved to 380spm.',
    artifactId: 'sprig-canvas',
    meta: [
      { key: 'Status', value: 'Documented only' },
      { key: 'Run rate', value: '380 spm' },
    ],
  },
  {
    id: 'n-05',
    seq: 5,
    date: '24 JUL 2026',
    place: 'Bay 12',
    heading: 'The re-issue nobody can see',
    observation:
      'Ten percent out of the banner fill and the jersey stops puckering. Side by side with the original, no customer has ever picked the difference — which is the correct outcome for a restoration.',
    technical: 'Single jersey, 240gsm, 4-way stretch. Density factor 0.9 on fill blocks only.',
    artifactId: 'crest-jersey',
    meta: [
      { key: 'Change', value: 'Fill -10%' },
      { key: 'Visible', value: 'No' },
    ],
  },
];

/* ------------------------------------------------------------------ format */

/** `2026-02-11` becomes `11.02.2026`. Archive stamps read day-first. */
export function stampDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

/** Depth as a printable stratum label: `STR-04`. */
export function stratum(depth: number): string {
  return `STR-${String(depth).padStart(2, '0')}`;
}
