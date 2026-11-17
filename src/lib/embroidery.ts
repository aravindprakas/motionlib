/**
 * Embroidery domain model — the one asset interface the whole `embroidery`
 * group is built on.
 *
 * The rule here is that no component in the group may depend on a proprietary
 * asset. A real embroidery business hands you a stitch file (.dst/.pes), not a
 * PNG, and the interesting UI lives in what that file *knows*: the order the
 * colour blocks run in, how many stitches each one costs, where the machine
 * stops to change thread. So a design is modelled as an ordered list of stitch
 * blocks — an SVG path, a thread, a stitch count, a stitch type — and every
 * component in the group reads that same list. Swap `DESIGNS` for a digitiser's
 * real export and nothing else changes.
 *
 * Dependency-free by design: pure data plus arithmetic, no React, so the
 * registry copies it once and shares it across all ten components.
 */

export type StitchType = 'running' | 'satin' | 'fill';

export interface StitchBlock {
  id: string;
  /** Shown in timelines and colour-change lists. */
  label: string;
  /** SVG path in the parent design's viewBox. */
  path: string;
  /** Thread code into `THREADS`. */
  thread: string;
  type: StitchType;
  /** Stitches this block costs. Drives sequencing, timing, price and time. */
  stitches: number;
  /** Stroke weight in viewBox units for running/satin blocks. */
  weight?: number;
}

export interface EmbroideryDesign {
  id: string;
  name: string;
  viewBox: string;
  /** Finished size on the garment. Everything physical is derived from this. */
  widthMm: number;
  heightMm: number;
  blocks: StitchBlock[];
}

export interface Thread {
  code: string;
  name: string;
  hex: string;
  family: string;
}

export interface Fabric {
  id: string;
  name: string;
  hex: string;
  /** Grams per square metre — the number that decides stabiliser and density. */
  gsm: number;
  weave: string;
  stretch: string;
  note: string;
}

export interface PlacementZone {
  id: string;
  label: string;
  /**
   * Centre of the zone in the parent garment's own viewBox units — the same
   * coordinate space as `path`, so zones can be authored by reading them off
   * the silhouette rather than converted by hand into percentages.
   */
  x: number;
  y: number;
  /** Largest design width the zone takes, in mm. */
  maxWidthMm: number;
}

export interface Garment {
  id: string;
  name: string;
  viewBox: string;
  /** Silhouette outline. */
  path: string;
  /** Seams and hems, drawn as hairlines so the shape reads as a garment. */
  detail?: string;
  /** Real width of the garment box in mm, so design size stays honest. */
  widthMm: number;
  zones: PlacementZone[];
}

/* ------------------------------------------------------------------ motion */

/**
 * Motion tokens for the group. Four curves, each named after the physical
 * thing it models — chosen once here so ten components can't drift apart.
 */
export const MOTION = {
  /** Needle: decisive, no overshoot. Anything mechanical uses this. */
  needle: 'cubic-bezier(0.2, 0, 0, 1)',
  /** Fabric: soft entry, long settle. Anything that has weight. */
  fabric: 'cubic-bezier(0.32, 0.72, 0, 1)',
  /** Thread: continuous, even. Anything that draws along a path. */
  thread: 'cubic-bezier(0.65, 0, 0.35, 1)',
  /** Settle: the small overshoot of something snapping into a hoop. */
  settle: 'cubic-bezier(0.34, 1.4, 0.64, 1)',
} as const;

export const DUR = {
  micro: 120,
  std: 240,
  emphasis: 420,
  scene: 640,
} as const;

/* ----------------------------------------------------------------- threads */

/** A working thread box. Codes follow the 1000-series convention. */
export const THREADS: Thread[] = [
  { code: '1000', name: 'Raw White', hex: '#f2ede2', family: 'neutral' },
  { code: '1032', name: 'Bone', hex: '#ded5c2', family: 'neutral' },
  { code: '1041', name: 'Oat', hex: '#c9b899', family: 'neutral' },
  { code: '1075', name: 'Ash', hex: '#8d8a84', family: 'neutral' },
  { code: '1090', name: 'Soot', hex: '#26242a', family: 'neutral' },
  { code: '1147', name: 'Madder', hex: '#a32b1e', family: 'red' },
  { code: '1166', name: 'Vermilion', hex: '#ff4d23', family: 'red' },
  { code: '1183', name: 'Clay', hex: '#b4614a', family: 'red' },
  { code: '1210', name: 'Saffron', hex: '#e0a02c', family: 'yellow' },
  { code: '1224', name: 'Brass', hex: '#b08d39', family: 'yellow' },
  { code: '1305', name: 'Moss', hex: '#4a6b41', family: 'green' },
  { code: '1319', name: 'Sage', hex: '#8fa07d', family: 'green' },
  { code: '1348', name: 'Pine', hex: '#26402f', family: 'green' },
  { code: '1420', name: 'Indigo', hex: '#26355c', family: 'blue' },
  { code: '1437', name: 'Slate Blue', hex: '#5b708c', family: 'blue' },
  { code: '1512', name: 'Plum', hex: '#5a3350', family: 'purple' },
];

const THREAD_MAP = new Map(THREADS.map((t) => [t.code, t]));

/** Never throws — an unknown code falls back to Soot so a design still renders. */
export function threadByCode(code: string): Thread {
  return THREAD_MAP.get(code) ?? THREADS[4];
}

/* ----------------------------------------------------------------- fabrics */

export const FABRICS: Fabric[] = [
  {
    id: 'heavy-jersey',
    name: 'Heavy Cotton Jersey',
    hex: '#ece6d8',
    gsm: 240,
    weave: 'Single jersey knit',
    stretch: '4-way, moderate',
    note: 'Cut-away stabiliser. Density eased 10% to stop the knit puckering.',
  },
  {
    id: 'brushed-fleece',
    name: 'Brushed Fleece',
    hex: '#3b3a3f',
    gsm: 340,
    weave: 'Loop-back, brushed',
    stretch: '2-way, low',
    note: 'Needs a water-soluble topping or the pile swallows fine detail.',
  },
  {
    id: 'oxford',
    name: 'Cotton Oxford',
    hex: '#d8dee6',
    gsm: 150,
    weave: 'Basket weave, woven',
    stretch: 'None',
    note: 'The stable ground. Holds satin edges crisply at any density.',
  },
  {
    id: 'canvas',
    name: 'Waxed Canvas',
    hex: '#6b5c43',
    gsm: 400,
    weave: 'Plain weave, waxed',
    stretch: 'None',
    note: 'Heavy. Larger needle, slower run, no topping.',
  },
  {
    id: 'linen',
    name: 'Washed Linen',
    hex: '#c8bda8',
    gsm: 190,
    weave: 'Plain weave, slub',
    stretch: 'None',
    note: 'Open weave — fills read softer, outlines read beautifully.',
  },
];

/* ----------------------------------------------------------------- designs */

export const DESIGNS: EmbroideryDesign[] = [
  {
    id: 'sprig',
    name: 'Sprig No. 4',
    viewBox: '0 0 200 200',
    widthMm: 82,
    heightMm: 82,
    blocks: [
      {
        id: 'ring',
        label: 'Outer ring',
        type: 'running',
        thread: '1090',
        stitches: 640,
        weight: 1.6,
        path: 'M100 100 m -82 0 a 82 82 0 1 0 164 0 a 82 82 0 1 0 -164 0',
      },
      {
        id: 'stem',
        label: 'Stem',
        type: 'running',
        thread: '1348',
        stitches: 410,
        weight: 3,
        path: 'M100 176 C 100 146 94 122 99 96 C 104 70 113 52 120 40',
      },
      {
        id: 'leaf-l',
        label: 'Left leaf',
        type: 'satin',
        thread: '1305',
        stitches: 1180,
        path: 'M99 138 C 76 136 60 124 56 104 C 78 100 94 114 99 138 Z',
      },
      {
        id: 'leaf-r',
        label: 'Right leaf',
        type: 'satin',
        thread: '1319',
        stitches: 1040,
        path: 'M102 112 C 124 108 140 94 142 76 C 121 74 105 88 102 112 Z',
      },
      {
        id: 'bloom',
        label: 'Bloom',
        type: 'fill',
        thread: '1147',
        stitches: 2260,
        path: 'M120 40 m -21 0 a 21 21 0 1 0 42 0 a 21 21 0 1 0 -42 0',
      },
      {
        id: 'core',
        label: 'Bloom centre',
        type: 'satin',
        thread: '1210',
        stitches: 480,
        path: 'M120 40 m -7 0 a 7 7 0 1 0 14 0 a 7 7 0 1 0 -14 0',
      },
      {
        id: 'berries',
        label: 'Berries',
        type: 'fill',
        thread: '1183',
        stitches: 520,
        path: 'M70 84 m -6.5 0 a 6.5 6.5 0 1 0 13 0 a 6.5 6.5 0 1 0 -13 0 M150 120 m -5.5 0 a 5.5 5.5 0 1 0 11 0 a 5.5 5.5 0 1 0 -11 0',
      },
    ],
  },
  {
    id: 'crest',
    name: 'Atelier Crest',
    viewBox: '0 0 200 200',
    widthMm: 64,
    heightMm: 70,
    blocks: [
      {
        id: 'shield',
        label: 'Shield outline',
        type: 'running',
        thread: '1090',
        stitches: 720,
        weight: 2.4,
        path: 'M100 20 L 168 46 L 168 106 C 168 146 137 170 100 182 C 63 170 32 146 32 106 L 32 46 Z',
      },
      {
        id: 'band',
        label: 'Banner',
        type: 'fill',
        thread: '1420',
        stitches: 1640,
        path: 'M40 120 L 160 120 L 160 138 L 40 138 Z',
      },
      {
        id: 'letter',
        label: 'Monogram',
        type: 'satin',
        thread: '1224',
        stitches: 1320,
        weight: 7,
        path: 'M78 112 L 100 52 L 122 112 M87 92 L 113 92',
      },
      {
        id: 'rule',
        label: 'Base rule',
        type: 'running',
        thread: '1224',
        stitches: 280,
        weight: 1.6,
        path: 'M52 152 L 148 152',
      },
    ],
  },
  {
    id: 'chevron',
    name: 'Chevron Repeat',
    viewBox: '0 0 200 200',
    widthMm: 40,
    heightMm: 40,
    blocks: [
      {
        id: 'row-1',
        label: 'Upper run',
        type: 'running',
        thread: '1147',
        stitches: 380,
        weight: 5,
        path: 'M30 80 L 65 45 L 100 80 L 135 45 L 170 80',
      },
      {
        id: 'row-2',
        label: 'Lower run',
        type: 'running',
        thread: '1420',
        stitches: 380,
        weight: 5,
        path: 'M30 145 L 65 110 L 100 145 L 135 110 L 170 145',
      },
      {
        id: 'dots',
        label: 'Seed stitch',
        type: 'fill',
        thread: '1210',
        stitches: 210,
        path: 'M65 96 m -4 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0 M135 96 m -4 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0',
      },
    ],
  },
];

/* ---------------------------------------------------------------- garments */

export const GARMENTS: Garment[] = [
  {
    id: 'tee',
    name: 'Heavyweight Tee',
    viewBox: '0 0 200 240',
    widthMm: 520,
    path: 'M70 18 L 46 30 L 20 56 L 40 82 L 54 70 L 54 222 L 146 222 L 146 70 L 160 82 L 180 56 L 154 30 L 130 18 C 124 34 76 34 70 18 Z',
    detail: 'M70 18 C 76 34 124 34 130 18 M54 70 L 54 222 M146 70 L 146 222',
    zones: [
      { id: 'left-chest', label: 'Left chest', x: 68, y: 92, maxWidthMm: 90 },
      { id: 'centre-chest', label: 'Centre chest', x: 100, y: 108, maxWidthMm: 260 },
      { id: 'nape', label: 'Nape', x: 100, y: 46, maxWidthMm: 60 },
      { id: 'hem', label: 'Left hem', x: 72, y: 200, maxWidthMm: 70 },
    ],
  },
  {
    id: 'hoodie',
    name: 'Loopback Hoodie',
    viewBox: '0 0 200 240',
    widthMm: 560,
    path: 'M66 22 L 42 34 L 16 62 L 38 88 L 52 74 L 52 226 L 148 226 L 148 74 L 162 88 L 184 62 L 158 34 L 134 22 C 128 46 72 46 66 22 Z',
    detail: 'M66 22 C 72 46 128 46 134 22 M52 206 L 148 206 M86 120 L 114 120',
    zones: [
      { id: 'left-chest', label: 'Left chest', x: 70, y: 100, maxWidthMm: 90 },
      { id: 'centre-chest', label: 'Centre chest', x: 100, y: 112, maxWidthMm: 240 },
      { id: 'sleeve', label: 'Left sleeve', x: 30, y: 70, maxWidthMm: 60 },
      { id: 'pocket', label: 'Above pocket', x: 100, y: 178, maxWidthMm: 180 },
    ],
  },
  {
    id: 'cap',
    name: 'Six-Panel Cap',
    viewBox: '0 0 200 240',
    widthMm: 300,
    path: 'M32 150 C 32 82 68 48 100 48 C 132 48 168 82 168 150 L 168 168 L 32 168 Z M32 168 C 32 190 60 202 100 202 C 140 202 168 190 168 168',
    detail: 'M100 48 L 100 150 M32 150 L 168 150',
    zones: [
      { id: 'front-panel', label: 'Front panel', x: 100, y: 116, maxWidthMm: 120 },
      { id: 'side-left', label: 'Left side', x: 56, y: 126, maxWidthMm: 60 },
      { id: 'side-right', label: 'Right side', x: 144, y: 126, maxWidthMm: 60 },
    ],
  },
];

/* ------------------------------------------------------------------- maths */

export function totalStitches(design: EmbroideryDesign): number {
  return design.blocks.reduce((n, b) => n + b.stitches, 0);
}

/**
 * Cumulative start/end of each block as a 0..1 fraction of the whole run.
 * Every sequencing component — reveal, timeline, progress — sequences off this
 * rather than off array index, so a 2,260-stitch fill takes visibly longer than
 * a 280-stitch rule. That proportionality is the entire point.
 */
export function blockSpans(design: EmbroideryDesign): { start: number; end: number }[] {
  const total = totalStitches(design) || 1;
  let run = 0;
  return design.blocks.map((b) => {
    const start = run / total;
    run += b.stitches;
    return { start, end: run / total };
  });
}

/** Machine stops needed — a colour change costs real minutes on the floor. */
export function colourChanges(design: EmbroideryDesign): number {
  let n = 0;
  for (let i = 1; i < design.blocks.length; i++) {
    if (design.blocks[i].thread !== design.blocks[i - 1].thread) n++;
  }
  return n;
}

function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
  const m = hex.replace('#', '');
  const r = srgbToLinear(parseInt(m.slice(0, 2), 16));
  const g = srgbToLinear(parseInt(m.slice(2, 4), 16));
  const b = srgbToLinear(parseInt(m.slice(4, 6), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export type Definition = 'crisp' | 'soft' | 'lost';

/**
 * How well a thread will actually read on a fabric.
 *
 * This is a *production* judgement, not a WCAG one — thread on cloth has sheen
 * and relief that flat colour does not, so the thresholds sit far below text
 * contrast minimums. Tone-on-tone at 1.4:1 is a legitimate luxury choice; below
 * that the stitching disappears in daylight and the customer feels cheated.
 */
export function definition(threadHex: string, fabricHex: string): Definition {
  const r = contrastRatio(threadHex, fabricHex);
  if (r >= 2.6) return 'crisp';
  if (r >= 1.35) return 'soft';
  return 'lost';
}

export const DEFINITION_COPY: Record<Definition, string> = {
  crisp: 'Reads cleanly at arm’s length',
  soft: 'Tone-on-tone — reads close up only',
  lost: 'Too close to the cloth. It will disappear.',
};

export type Density = 'light' | 'standard' | 'dense';
export type Coverage = 'outline' | 'fill';

export interface EstimateInput {
  widthMm: number;
  heightMm: number;
  coverage: Coverage;
  density: Density;
  colours: number;
  quantity: number;
}

export interface Estimate {
  stitches: number;
  metres: number;
  minutesEach: number;
  minutesTotal: number;
  unitPrice: number;
  total: number;
}

const DENSITY_FACTOR: Record<Density, number> = { light: 0.78, standard: 1, dense: 1.28 };
/** Stitches per cm² of the design's bounding box, by coverage. */
const COVERAGE_RATE: Record<Coverage, number> = { outline: 240, fill: 1020 };

/**
 * Thread consumed by a stitch count, in metres — ~4.1mm per stitch, plus 35%
 * because the bobbin is paying too. The estimator and the live production
 * gauge both call this, so a quote and a shop-floor readout can never disagree.
 */
export function threadMetres(stitches: number): number {
  return (stitches * 4.1 * 1.35) / 1000;
}

/**
 * Quote maths, kept in one place so the estimator and the repeat composer can
 * never disagree about what a garment costs.
 *
 * The constants are ordinary trade figures: ~1,000 stitches per cm² for a
 * standard fill, ~4mm of thread per stitch once top and bobbin are counted,
 * 750 stitches per minute on a commercial head, and a stop for every colour
 * change. Replace them with your own machine's numbers — nothing else needs to
 * change.
 */
export function estimate(input: EstimateInput): Estimate {
  const areaCm2 = (input.widthMm * input.heightMm) / 100;
  const stitches = Math.round(
    areaCm2 * COVERAGE_RATE[input.coverage] * DENSITY_FACTOR[input.density],
  );
  const metres = threadMetres(stitches);
  const runMinutes = stitches / 750;
  const changeMinutes = Math.max(0, input.colours - 1) * 0.45;
  const minutesEach = runMinutes + changeMinutes + 1.4; // + hooping
  const qty = Math.max(1, input.quantity);

  const setupPerUnit = 1800 / qty; // digitising, amortised across the run
  const runRate = (stitches / 1000) * 9.5;
  const handling = 42;
  const scale = qty >= 100 ? 0.78 : qty >= 50 ? 0.85 : qty >= 24 ? 0.92 : 1;
  const unitPrice = Math.round((setupPerUnit + (runRate + handling) * scale) * 100) / 100;

  return {
    stitches,
    metres: Math.round(metres * 10) / 10,
    minutesEach: Math.round(minutesEach * 10) / 10,
    minutesTotal: Math.round(minutesEach * qty),
    unitPrice,
    total: Math.round(unitPrice * qty * 100) / 100,
  };
}

const NUM = new Intl.NumberFormat('en-IN');
const MONEY = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export const fmtStitches = (n: number) => NUM.format(Math.round(n));
export const fmtMoney = (n: number) => MONEY.format(n);

export function fmtDuration(minutes: number): string {
  const m = Math.round(minutes);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h} h ${rest} min` : `${h} h`;
}
