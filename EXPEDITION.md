# The `expedition` group

Ten components for the same embroidery business as the `embroidery` group,
reinterpreted as a **digital archaeological expedition**: the pieces are not
products, they are *artifacts* — discovered, documented, examined, classified,
restored, and acquired.

The brief was to make an interface whose business category is not obvious from
the interface alone. The constraint that made it worth building is the second
one: the metaphor has to *earn* its place at every screen, or it comes out.

---

## 1. Creative direction

### The thesis

An embroidery design is already an archival object; nobody sells it that way.
A digitised design is an ordered list of colour blocks with stitch counts,
recorded on a date, for a ground of a known weight, filed by a studio that can
tell you exactly which decisions were made and why. That is an accession
record. Presented as a product grid, all of it is thrown away and the customer
is left comparing photographs.

So the metaphor is not a skin. It is a **documentation model**:

| Commerce | Archive |
|---|---|
| Product | Artifact, with an accession number |
| Category | Territory on a survey, with area and depth |
| Product page | Examination |
| Customisation | Restoration, with an intervention record |
| Material picker | Vault of documented ground specimens |
| Comparison table | Specimens registered to shared axes |
| Checkout | Acquisition ledger |
| Gallery | Exhibition hang |

Each of those is a genuinely better answer to a real UX problem, which is the
test each component had to pass (§10).

### Visual language

Aged ivory paper, charcoal ink, mineral grey, with **colour used only as
classification**: archival red for the live action and the selected state,
oxidised bronze for classification scales, deep forest for availability, clay
for rarity. Nothing is coloured for variety. The result reads as a catalogue
rather than a shop, and the only saturated things on screen are the threads
themselves — the same discipline the `embroidery` group uses, in a warmer
register.

Material language is **paper and photographic plate**, never glass or
elevation: hairline rules, inset panels, registration marks, stamped metadata
blocks, catalogue numbers, an archival label under every image. There is no
shadow model in the group at all. Depth is expressed by stacking and by rank,
not by blur.

Texture is two near-invisible repeating gradients on the theme root and two
more on each plate, with the plate's weave pitch driven by the fabric's gsm —
a 400gsm canvas is visibly coarser than a 150gsm oxford. No noise PNG, no
image request, nothing that touches legibility.

### Typography

Three voices, one job each — all three already loaded by the app, so the group
adds no font weight to the page.

- **Instrument Serif** — catalogue titles and any number that is the point of
  its panel (the acquisition total). Set tight, large, balanced.
- **Space Grotesk** — every control and every sentence a human reads.
- **Space Mono** — metadata only: accession numbers, strata, stitch counts,
  dates, axis values. Tabular figures throughout. Never a paragraph.

### Imagery

The group does not depend on photography existing. `ArtifactPlate` draws a
specimen plate from the domain model — fabric-coloured ground, weave, the motif
via the shared `DesignArt`, studio light, registration marks — and accepts a
`photo` prop (`src`/`srcSet`/`sizes`/`width`/`height`) that replaces the drawing
with a real responsive `<img>`. The wrapper owns the aspect ratio either way, so
swapping a drawing for a photograph shifts nothing on the page.

### Interaction philosophy

**discover → investigate → understand → restore → acquire.** Every component
belongs to exactly one of those verbs, and each uses a different interaction
pattern (§4). Nothing auto-advances: an archive does not shuffle its own
drawers while you are reading.

---

## 2. Tokens

All of it lives in `src/styles/expedition.css`, scoped to `.exp` — the same
containment pattern `.ss-theme` and `.shell-theme` use, so a set that departs
from the house brutalist tokens can do so honestly without leaking.

```
colour      --exp-background --exp-surface --exp-surface-raised --exp-surface-sunken
            --exp-text --exp-text-muted --exp-text-faint
            --exp-border --exp-border-strong
            --exp-accent --exp-accent-soft --exp-bronze --exp-clay
            --exp-success --exp-warning --exp-error

type        --exp-font-display / -ui / -meta
            --exp-display-size --exp-title-size --exp-heading-size
            --exp-body-size --exp-caption-size --exp-metadata-size --exp-label-size
            --exp-display-leading --exp-title-leading --exp-body-leading
            --exp-label-tracking --exp-meta-tracking

space       --exp-1 … --exp-9   (4px base: 4 8 12 16 24 32 48 64 96)

layout      --exp-page --exp-reading --exp-gap --exp-gutter --exp-hairline

motion      --exp-fast 120ms · --exp-standard 260ms · --exp-slow 460ms
            --exp-cinematic 720ms
            --exp-ease-paper --exp-ease-precise --exp-ease-focus --exp-ease-survey
```

Type sizes are `clamp()`-based, so the scale is continuous rather than stepped
at breakpoints. Gutters are the **only** viewport media queries in the group
(600 / 1024 / 1920) because the page edge is genuinely a property of the page;
every component sizes itself from its own box.

The four durations and four curves are mirrored exactly in
`@/lib/expedition` as `EXP_DUR` / `EXP_MOTION`, so the JS and CSS halves of a
transition cannot drift.

---

## 3. Architecture

```
src/lib/
  expedition.ts        domain + tokens + maths (no React)
  ArtifactPlate.tsx    the one way an artifact appears on screen
  embroidery.ts        (existing) stitch blocks, threads, fabrics, garments, estimator
  DesignArt.tsx        (existing) the motif, drawn once
  useSizeBand.ts       (existing) container-driven responsiveness
  useReducedMotion.ts  (existing)
  SmoothScroll.tsx     (existing) ambient Lenis scroller, for IO roots

src/styles/
  expedition.css       .exp theme: tokens, primitives, all ten components

src/components/expedition/
  expedition-opening/  artifact-catalog/  artifact-scanner/  expedition-map/
  restoration-lab/     field-notes/       specimen-comparison/
  material-vault/      acquisition-desk/  collection-vault/
      each: Component.tsx + demo.tsx
```

### The data model

`expedition.ts` is an **accession layer over** `embroidery.ts`, not a copy of
it. An `ArtifactRecord` carries only archival facts — accession number,
stratum, territory, rarity, condition, recovery date, site, narrative, edition,
availability — and points at a design, a garment and a fabric by id. `resolve()`
joins them; `RESOLVED` is the resolved catalogue.

Everything derivable is derived, never authored:

- `complexity()` — 1–5, from stitch count **and** thread changes, because a
  6,000-stitch single-colour fill is a cheap run and a 3,000-stitch five-colour
  piece stops the machine five times.
- `fillRatio()` — share of the run that is solid fill.
- `acquisition()` — the whole ledger, routed through the existing
  `estimate()` so the archive's label and the shop floor cannot disagree.

One correction lives in `acquisition()` and is worth knowing about: the
estimator derives a stitch count *from area*, because it exists to quote work
that has not been digitised yet. An accessioned artifact already has a real
count in its stitch file, and quoting it through the area path put **68,585**
stitches on a ledger whose catalogue card said **6,530**. So the area handed to
the estimator is the area that reproduces the recorded count at the estimator's
own rate — and that rate is *probed* from the estimator rather than copied out
of it, so re-tuning the shop's constants re-tunes the archive automatically.

### Styling

One stylesheet, not ten, because the ten components are one publication: they
share a paper, a rule weight, a label style and a set of curves. Components
read tokens; they never hardcode a colour, duration or curve.

---

## 4. The ten

Every component: typed props, controlled **and** uncontrolled, sensible
defaults, `className` passthrough, no required props at all (each renders from
the domain model alone).

### 01 · ExpeditionOpening — *discover*
Opening an archive rather than landing on a page. Expedition code, featured
find, stratum scale beside the plate, accession stamp, discovery action, index
strip of the other finds. The strip is a set of real pressed buttons; the plate
swaps on a focus pull and the change is announced. Establishes the grammar
(accession / stratum / site) that every later screen reuses.
**Pattern:** featured-item selection.

### 02 · ArtifactCatalog — *discover*
One set of records in three geometries: `archive` (photographic wall),
`specimens` (compact index, one line per record), `detail` (one record under
examination). Not filters — a recomposition. The perspective control is a real
`radiogroup` with roving focus, because the choice is exclusive and changes
what is on screen.
**Pattern:** mode recomposition.

### 03 · ArtifactScanner — *investigate*
Discrete region examination. Three curated regions per design, each with the
archive's readings (pattern, technique, thread, density). Zoom exists to make
the reading legible, not as the feature. The locator keeps the whole plate on
screen with the frame you are inside, so "where am I looking?" is always
answered. Markers are sized to their region at rest and uniform 44px targets
while examining.
**Pattern:** spatial examination.

### 04 · ExpeditionMap — *discover*
The collection as surveyed ground: hull area is the region, fill weight is its
deepest stratum, each point is one accession. Drag pans, focusing a territory
centres it. Below ~620px the map **becomes an index** — same territories, same
counts, same records, as an expandable vertical list. A different component
body, not a scaled-down one.
**Pattern:** spatial navigation ⇄ index.

### 05 · RestorationLab — *restore*
Customisation as restoration: a large specimen, one contextual tool at a time
(ground / thread / placement / scale), the original beside the restored piece,
and an **intervention record** generated by diffing state against the original —
so it cannot describe a change that did not happen. Thread choices are scored
against the ground with the library's own `definition()`, so a tone-on-tone
choice is called out before the customer pays for it. Placement and scale are
drawn at true millimetre proportion of a real carrier width.
**Pattern:** contextual configuration.

### 06 · FieldNotes — *understand*
Craft as dated journal entries — observation, plate, technical note, stamped
margin metadata — instead of a three-step process graphic. One
IntersectionObserver rooted on the ambient Lenis scroller does double duty:
latching the reveal and driving the spine index; entries are unobserved once
seen. The hidden-until-seen state is gated on a flag the component sets in a
layout effect, so an environment where the observer never runs renders a
complete, readable journal.
**Pattern:** reading / scroll narrative.

### 07 · SpecimenComparison — *investigate*
Registration, not a table. Every specimen is marked on the same axis, so "twice
the run" is a distance rather than arithmetic; axis ranges come from the whole
catalogue, not from the current selection, so a mark means the same thing
before and after you add a third specimen. The true-scale frame draws the
selected motifs at real relative size in one box — the comparison a table
structurally cannot make. Compact turns slots into an A/B segmented control
while every mark stays on every axis.
**Pattern:** registered comparison.

### 08 · MaterialVault — *investigate*
Cloth as documented specimens in a cabinet. The chosen sample is physically
pulled out of the row and the empty slot stays behind it, so "what changed" is
answered by geometry. Weave pitch comes from gsm. The test strip runs the
chosen thread as satin **on the actual ground** and states the production
verdict in the shop's own words.
**Pattern:** tactile single-select.

### 09 · AcquisitionDesk — *acquire*
The acquisition ledger: every figure that affects the transaction, unfolded, on
ruled lines — no accordions, no "see details", no price that appears after a
step. Changed figures re-stamp. Lead time is derived from machine minutes, not
promised as a constant. Real busy, error, out-of-stock and success states; the
action says what it does and what it costs.
**Pattern:** ledger + commit.

### 10 · CollectionVault — *acquire*
An exhibition hang rather than a gallery grid: one piece dominant, the rest
orbiting in rank (rank is a custom property the plates read). Selecting a piece
promotes it and demotes the current dominant, keeping everyone else's relative
order — browsable without a carousel, no hidden queue, no autoplay.
**Pattern:** rank rotation.

---

## 5. Responsive matrix

Bands are **container-driven** via `useSizeBand` (one ResizeObserver per
component, re-rendering only when the band changes). `compact` ≈ phone,
`regular` ≈ tablet, `wide` ≈ desktop — but a component in a 360px sidebar on a
2560px monitor behaves like a phone, which is the correct answer and is free.

| Component | Mobile (compact) | Tablet (regular) | Desktop (wide) | What changes in the interaction |
|---|---|---|---|---|
| ExpeditionOpening | Stack: marker → plate → record → index; index is a snapping x-scroller | Two columns, record left / plate right; index 4-up | Asymmetric 1 : 0.92, index 6-up on one row | Same selection model; the strip stops being a scroller and becomes a row |
| ArtifactCatalog | 1-col wall; index collapses six columns to two lines; selecting jumps to `detail` | 2–3-col wall; detail is plate + record side by side | 3–4-col wall; detail is plate + record + vertical rail | Selecting a record *changes mode* only on compact — on wide the record panel is already visible |
| ArtifactScanner | Window over readout, single column; keyboard hint hidden | Window 1.15 : readout 0.85 | Same, wider gutters | Identical; markers stay ≥44px at every size |
| ExpeditionMap | **No canvas.** Vertical territory index, expandable, with finds inline | Field + panel stacked beneath | Field 1.35 : panel 0.65 side by side | Pan/zoom replaced by expand/collapse — the metaphor yields to the thumb |
| RestorationLab | One specimen + "Show original" toggle; tools in a **sticky bottom tray** | Bench + tool panel beside; original and restored both shown | Same, wider bench | Comparison becomes a toggle; controls move under the thumb |
| FieldNotes | Margin becomes a single stamped line; entry stacks margin → plate → text | Three-column entry, no spine | Spine index (sticky) + alternating entry sides | Spine scrollspy only exists where there is room for it |
| SpecimenComparison | **A/B slot tabs**, one column dominant, all marks stay on all axes | Scale frame beside columns, axes full width | Scale 220px + columns, axes in two columns | Side-by-side becomes one-at-a-time; the axes carry the comparison |
| MaterialVault | Cabinet is a 42%-wide snapping shelf | Cabinet + record side by side | Same, wider record | Identical selection; only the shelf scrolls |
| AcquisitionDesk | Ledger scrolls behind a **sticky desk** (qty + total + commit) | Figure + sheet, desk full width below | Figure + sheet + desk in three columns | The commit action is always one thumb away |
| CollectionVault | Dominant full width + label, room as x-scroller in rank order | Wall 1 : 0.8, room 3-up | Wall 1.25 : 0.75, room 5-up with rank-weighted widths | Same rotation; rank is expressed by order instead of by width |

Verified live at 320–430px equivalents (the compact paths above were checked in
the running app, including the map's index substitution, the comparison's A/B
slots, and both sticky trays), and at tablet and desktop widths.

---

## 6. Performance

**Rendering.** Every plate is a `<div>` with two gradients and one inline SVG
of ≤12 paths — stateless, pure, `contain: layout paint style`. A forty-record
wall costs the same per card as a six-record one. No WebGL, no canvas, no
filters, no `backdrop-filter`, no animated `box-shadow`, no animated blur.

**JavaScript.** No new dependencies; the group adds no library to the bundle.
Per component: at most one ResizeObserver, and (FieldNotes only) one
IntersectionObserver that unobserves each entry after it is seen, converging to
zero observers and zero work. The map's pan writes `transform` straight to the
element during the gesture and tells React once on release — one style write
per pointer event, no re-render and no layout.

**Animation.** Transform and opacity only, with two deliberate exceptions,
both cheap and both non-continuous: the scanner's locator frame animates
`left/top/width/height` (a 84px box, once per selection) and the scanner's
markers animate `left/top` (three elements, once per selection). Everything
else composites. Staggers are capped in JS at six steps so a long list cannot
become a two-second cascade.

**Layout stability.** Every plate declares `aspect-ratio`, so a drawn plate and
a photographed one reserve identical space and swapping one for the other
shifts nothing. `<img>` carries `width`/`height`/`loading`/`decoding`, plus
`srcset`/`sizes` when supplied; the one above-the-fold plate takes
`loading="eager"`, everything else lazy.

**Low-end devices.** The heaviest screen in the group (the catalogue wall at 40
records) is 40 divs, 40 small SVGs and no JS per item. `will-change` appears
exactly three times, only on elements that are actually about to transform.

Production build: `tsc --noEmit` clean, `vite build` clean.

---

## 7. Accessibility

- **Semantics.** `section` with `aria-label`/`aria-labelledby` per component;
  `figure`/`figcaption` for plates; `dl` for every stamped record; `nav` for
  indexes; real `button`s everywhere — nothing interactive is a `div` with a
  click handler.
- **Exclusive choices are radiogroups** (catalogue perspective, material
  cabinet) with roving `tabIndex` and arrow keys; toggles use `aria-pressed`;
  the restoration tools are a `tablist`/`tabpanel` pair; the comparison slots
  are tabs.
- **Keyboard.** Every path is reachable without a pointer: arrow keys move
  between scanner regions, catalogue perspectives, vault samples and exhibition
  pieces; Escape releases the scanner's examination; focusing a territory
  centres the map. The map's SVG territories and points are focusable with
  Enter/Space activation.
- **Focus.** One treatment for the group — a 2px archival-red outline at 2px
  offset — never removed. The single exception is Chrome's own `auto` ring on
  focusable `<g>` elements, which draws a 5px rounded box over the map; it is
  replaced with a dashed stroke on the territory's own hull, which is quieter
  and actually the shape of the thing it marks.
- **Screen readers.** Plate art is `aria-hidden` (it is decorative; the record
  beside it is the content). Every visual-only signal has a text equivalent:
  complexity steps carry "Complexity 4 of 5", axis marks carry
  "Sprig No. 4: 6,530", the thread test strip's swatches carry the production
  verdict in their `aria-label`. Featured/examined/exhibited changes are
  announced through `aria-live="polite"` regions.
- **Contrast.** Body text #1b1a18 on #e7e2d6 ≈ 14.4:1; muted #6a665e ≈ 5.1:1;
  the faint tone is reserved for labels at ≥0.62rem uppercase mono, never for
  sentences. The primary action is ivory on #8f2f1d ≈ 7.8:1.
- **Touch.** Every control is ≥44px on its smallest side, including the scanner
  markers, the vault's thread strip, the quantity stepper and the map's
  point hit areas.
- **Nothing is hover-only.** Hover previews a scanner marker's label; the label
  is also shown on focus and when selected, and the region list is a permanent
  equivalent.
- **Reduced motion** is handled once, at the theme root: every animation and
  transition inside `.exp` collapses to 0.01ms, and the one reveal that has a
  hidden start state is disarmed rather than merely stopped, so no content can
  be left invisible.

---

## 8. Motion system

Four durations, four curves, named for the physical thing each models:

| Token | Value | Models | Used by |
|---|---|---|---|
| `--exp-fast` | 120ms | a control acknowledging a press | hovers, chips, steppers |
| `--exp-standard` | 260ms | paper sliding, a label moving | panels, readings, ring hover |
| `--exp-slow` | 460ms | a plate changing, a mode recomposing | catalogue recomposition, examination zoom, map pan |
| `--exp-cinematic` | 720ms | opening the archive | the opening's first plate, the exhibition hang |

| Curve | Value | Meaning |
|---|---|---|
| `--exp-ease-paper` | `cubic-bezier(.32,.72,0,1)` | has weight: soft entry, long settle |
| `--exp-ease-precise` | `cubic-bezier(.2,0,0,1)` | mechanical, no overshoot |
| `--exp-ease-focus` | `cubic-bezier(.65,0,.35,1)` | optical, even at both ends |
| `--exp-ease-survey` | `cubic-bezier(.25,.1,.25,1)` | controlled pan across ground |

Rules: no bounce, no spring, no glow, no particles, no infinite loops, no
ambient parallax. Every animation answers a question the user just asked —
*what changed*, *where did it go*, *what am I now looking at*. A one-shot
`exp-restamp` on the ledger marks a figure that moved; `exp-settle` carries a
recomposition; `exp-plate-in` and `exp-hang` are focus pulls, used once per
change and never in a loop.

---

## 9. Rules for the eleventh component

1. **Archival metadata is content, not decoration.** If a component shows an
   accession number it must be the real one, and it must be the same handle the
   rest of the set uses.
2. **Derive, never author.** Anything computable from the domain model
   (complexity, density, price, lead time) is computed, so it cannot go stale.
   New maths goes in `expedition.ts`, not in a component.
3. **Recompose, don't shrink.** If a layout cannot work at 320px, the component
   owes that width a *different body* — the map's index is the reference
   example. Decide it with `useSizeBand`, not a viewport query.
4. **Tokens only.** No literal colour, duration or curve in a component file.
5. **Transform and opacity.** Any exception must be non-continuous, bounded to
   a handful of elements, and documented where it lives.
6. **Two routes minimum.** Everything doable by pointer is doable by keyboard,
   with a visible focus state and an announced result.
7. **The metaphor is a wrapper; the UX is the engine.** If the archaeological
   framing makes a task harder to complete, the framing loses — every time.

---

## 10. Quality gate

Each component was checked against the two tests in the brief.

**Anti-generic** — could it be dropped into a Shopify store, a SaaS site or a
banking dashboard unchanged? All ten fail that test by construction: each is
built on domain data (stitch blocks, thread codes, gsm, strata, accession
numbers) that a generic product simply does not have. The closest call was the
catalogue, which is why it recomposes into three geometries instead of
filtering cards.

**Anti-gimmick** — does the framing make anything harder? Three things were
cut or changed for exactly that reason:

- The map's pan/zoom is **removed below 620px**, replaced by a plain index,
  because panning a canvas with a thumb while reading 10px labels is worse than
  a list at every size where it does not fit.
- The scanner's "examination" is **discrete**, not a free-roaming magnifier:
  free zoom loses orientation and answers a question nobody asked.
- The acquisition ledger keeps the archive's *voice* but none of its
  obstruction — no folded sections, no staged reveal of price, and the button
  says the price it will charge.

Fixed during verification in the running app, not left for review:

1. Two grids declared `grid-area` names whose template only existed at the
   widest band, so their sections stacked on top of each other at phone and
   tablet widths (`SpecimenComparison`, `FieldNotes`).
2. Plates in centred tracks collapsed to zero width (the catalogue's rail and
   the exhibition ring) — a plate is a box with no intrinsic content.
3. `.exp-stamp`'s two-track grid was inherited by lists whose rows are their
   own two-column elements, laying readings out two-up (scanner, journal
   margin).
4. Chrome's `auto` focus ring on focusable SVG `<g>` elements painted a 5px
   rounded box across the map.
5. The acquisition ledger quoted a stitch count derived from area, contradicting
   the catalogue card for the same artifact by an order of magnitude.
6. The journal's entries were hidden until an observer revealed them; the
   hidden state is now armed by the component itself, so a failed or absent
   observer leaves a readable journal.
7. The scanner's region markers scaled with the zoom, becoming window-sized
   rings during an examination.
