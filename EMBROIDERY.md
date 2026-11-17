# The `embroidery` group

Ten components for an embroidery studio's storefront and production floor.
Written to the same rules as the rest of Motion lib — brutalist shape, zero
runtime dependencies, `@/lib` for anything shared — but organised around a
domain model instead of a motion family.

---

## 1. Design direction

An embroidery business is not a clothing shop that happens to sell decorated
clothing. Three things make it different, and all ten components come from
those three things rather than from a visual mood.

**The product is a process, not an image.** What a customer buys is a machine
run: an ordered list of colour blocks, each with a stitch count, separated by
stops where the thread changes. A photograph hides all of it. Every sequencing
component here — the reveal, the timeline, the progress gauge — is denominated
in *stitches*, because that is simultaneously the unit of time, the unit of
cost, and the unit of craft. A fill that takes a third of the run should take a
third of the animation. It does.

**The unit of cost is invisible and counter-intuitive.** Print is priced by
area and everyone's intuition is calibrated to that. Embroidery is priced by
stitch count, which grows with the *square* of size and jumps discontinuously
when an outline becomes a fill. Customers scale a crest from 60mm to 120mm and
quadruple the price without noticing. Three components exist purely to make
that lever visible while the decision is still being made.

**Thread has no colour on its own.** It has a colour *against a ground*. Navy
on navy is a legitimate luxury choice and also the most common way a customer
ends up disappointed. Every colour decision in this group is scored against the
selected fabric and stated plainly.

The visual language follows the library: bone ground, ink hairlines, vermilion
accent, zero radius, `font-mono` micro-labels in wide tracking, tabular
numerals everywhere a number can change. Colour is spent almost entirely on the
thread itself — the chrome is monochrome so the embroidery is the only thing on
screen with hue. That is the whole reason the palette is austere.

**What was deliberately not built:** a hover-magnifier (the library already has
`zoom-loupe`), a scroll-driven before/after (`scrub-compare`), a single-variant
swatch swap (`swatch-wipe`), a self-drawing wordmark (`svg-draw`), static
construction callouts (`spec-pins`). Anything already solved elsewhere in the
library was out of scope by definition.

---

## 2. Tokens

The group adds no new global tokens. It uses the library's existing Tailwind
scale (`bone`, `ink`, `accent`/`vermilion`, `font-mono`, radius 0) and adds two
domain token sets in `src/lib/embroidery.ts`, where they can be typed and
shared:

**Motion** — four curves, each named after the physical thing it models:

| Token | Curve | Used for |
|---|---|---|
| `MOTION.needle` | `cubic-bezier(0.2, 0, 0, 1)` | Anything mechanical. Decisive, no overshoot. |
| `MOTION.fabric` | `cubic-bezier(0.32, 0.72, 0, 1)` | Anything with weight. Soft entry, long settle. |
| `MOTION.thread` | `cubic-bezier(0.65, 0, 0.35, 1)` | Anything drawing along a path. Continuous, even. |
| `MOTION.settle` | `cubic-bezier(0.34, 1.4, 0.64, 1)` | Snapping into a hoop. Small overshoot, once. |

**Duration** — `DUR.micro` 120ms (state echo), `DUR.std` 240ms (control
response), `DUR.emphasis` 420ms (something moved), `DUR.scene` 640ms (the view
changed).

**Thread palette** — sixteen `Thread` records with trade-style 1000-series
codes. These are *data*, not design tokens: they are the studio's thread box and
are meant to be replaced with the real one.

---

## 3. Architecture

```
src/lib/
  embroidery.ts          ← domain model + maths. No React. Shared by all ten.
  DesignArt.tsx          ← static renderer with thread overrides. Used by 4.
  useReducedMotion.ts    ← existing library primitive
  useSizeBand.ts         ← existing library primitive (container queries)

src/components/embroidery/
  stitch-reveal/     StitchReveal.tsx     demo.tsx
  thread-path/       ThreadPath.tsx       demo.tsx
  digitize-pass/     DigitizePass.tsx     demo.tsx
  hoop-stage/        HoopStage.tsx        demo.tsx
  thread-drawer/     ThreadDrawer.tsx     demo.tsx
  stitch-timeline/   StitchTimeline.tsx   demo.tsx
  stitch-progress/   StitchProgress.tsx   demo.tsx
  stitch-estimator/  StitchEstimator.tsx  demo.tsx
  swatch-book/       SwatchBook.tsx       demo.tsx
  repeat-field/      RepeatField.tsx      demo.tsx
```

`npm run registry` resolves the `@/lib` imports transitively, so
`arvi-ui add hoop-stage` copies `HoopStage.tsx`, `DesignArt.tsx`,
`embroidery.ts` and `useReducedMotion.ts` into the target project and rewrites
the alias. Every component reports **zero npm dependencies**.

### The data model

```ts
interface StitchBlock {
  id: string; label: string;
  path: string;        // SVG path in the design's viewBox
  thread: string;      // code into THREADS
  type: 'running' | 'satin' | 'fill';
  stitches: number;    // drives sequencing, timing, price, thread length
  weight?: number;     // present ⇒ stroked; absent ⇒ filled
}
```

One convention carries the whole group: **a block with a `weight` is stroked, a
block without one is filled.** Sequencing components mask stroked blocks by
sweeping a thick mask stroke along the path (`pathLength={100}`, so progress is
a plain percentage) and filled blocks by scaling a mask rect, which is how
tatami actually lays down — in rows, from one edge.

Replace `DESIGNS`, `THREADS`, `FABRICS` and `GARMENTS` with real data and
nothing else changes. No component holds a private idea of what a design is.

---

## 4. The ten

| # | Component | UX problem it solves | Interaction pattern |
|---|---|---|---|
| 1 | **StitchReveal** | A photo can't say "this was made". | Passive, in-view, WAAPI |
| 2 | **ThreadPath** | Progress bars draw the future as built track. | Stepper / selection |
| 3 | **DigitizePass** | Setup fees read as padding because digitising is invisible. | Staged explainer |
| 4 | **HoopStage** | "Left chest" is a phrase, not a size. | Pointer drag + snap |
| 5 | **ThreadDrawer** | Thread colour is meaningless without a ground. | Multi-target assignment |
| 6 | **StitchTimeline** | "Why four days and that price?" | Scrub / transport |
| 7 | **StitchProgress** | An order percentage is a guess in a uniform. | Passive status |
| 8 | **StitchEstimator** | Cost grows with area, and nobody's intuition knows. | Form / calculator |
| 9 | **SwatchBook** | Fabric choice is comparative and physical. | Card stack / throw |
| 10 | **RepeatField** | All-overs are unpicturable and every quote shocks. | Tiling composer |

Remove the names and the ten interaction patterns are still obviously
different: one is untouchable, one selects, one steps, one drags, one assigns,
one scrubs, one only reports, one computes, one throws, one tiles.

---

## 5. Responsive matrix

Responsiveness here is **container-driven** (`useSizeBand` + `--cw`) wherever a
component can be dropped into a sidebar as easily as a full-bleed section — a
viewport media query is the wrong instrument for a component. Tailwind `sm:` /
`lg:` prefixes handle the cases that really are page-level.

| Component | Narrow (≤560px container) | Medium | Wide (≥920px) |
|---|---|---|---|
| StitchReveal | Single hoop, full width, legend wraps | 2-up grid | 2-up, faster speed reads better |
| ThreadPath | **Thread runs vertically**, labels beside nodes, sag bows sideways | Horizontal, labels under | Horizontal, full sag |
| DigitizePass | Art above, 3-up segmented control full width | same | same, readouts move inline right |
| HoopStage | Garment above, zone list becomes a **2-column grid** under it | 1-col zone list beside | Garment + 260px control column |
| ThreadDrawer | Cloth preview on top, block chips wrap, spool grid auto-fills to 56px | 2-col chips | 340px preview + control column |
| StitchTimeline | Full-width art, transport under, readouts 2-col | readouts 4-col | unchanged (control stays thumb-sized) |
| StitchProgress | Cone beside counters, phases wrap to 2 rows | phases 1 row | cone stacks above its own caption |
| StitchEstimator | Controls, then results panel below | same | Controls + 320px result column |
| SwatchBook | Stack full width, spec sheet below | side by side | 230px spec column |
| RepeatField | Garment above, controls below | same | Garment + 300px control column |

Nothing is a shrunken desktop layout: ThreadPath changes the *axis of the
metaphor*, HoopStage changes the zone list from a list to a grid, ThreadDrawer
re-flows the spool grid by auto-fill rather than by breakpoint.

Touch targets are ≥44px everywhere (`min-h-[44px]` on every control; the swatch
dots are 24×44 hit areas around a 12px mark). Nothing is hover-only — hover is
decoration on top of a click or key path in every case.

---

## 6. Performance

Measured commitments, not aspirations:

- **Zero runtime dependencies.** All ten, verified by the registry build.
- **No rAF loop except one**, in `StitchTimeline`, and only while playing. It is
  cancelled on pause, on completion, on unmount and under reduced motion.
- **`StitchReveal` uses the Web Animations API** — a handful of animations
  created once per reveal and then owned by the browser. No React state per
  frame, no timers.
- **Drags are transform-only.** `HoopStage` writes one `translate3d` per pointer
  event and tells React once, on release; the snap settles with FLIP, so
  `left`/`top` are only ever *set*, never transitioned. `SwatchBook` does the
  same.
- **`StitchTimeline` scrubbing does not re-render React.** One handler writes
  ~8 `stroke-dashoffset` / `scaleY` values and pushes the counter through
  `textContent`. React state changes only when the *block* changes — a handful
  of times across an entire run.
- **`RepeatField` is one `<pattern>`.** 8 motifs and 800 motifs are the same
  number of DOM nodes; rotation is `patternTransform` and never touches the DOM.
- **No blur, no shadow, no filter, no particles, no canvas, no 3D.** There is
  nothing in the group for a low-end GPU to struggle with; the brutalist visual
  language and the performance budget happen to want the same things.
- **No layout shift.** Every SVG carries an explicit `aspectRatio` from its own
  viewBox, so boxes are the right size before anything paints.
- **One `ResizeObserver`** in `ThreadPath` (via `useSizeBand`), which re-renders
  only when the *band* changes, never per pixel.
- **`getPointAtLength` is used once per design** in `DigitizePass`, in a layout
  effect — never inside an interaction.

Graceful degradation: `offset-path` is feature-detected with `CSS.supports` and
the travelling needle is simply not rendered without it, rather than being
animated into a wrong position.

---

## 7. Accessibility

- **Real controls.** The scrubber is `input[type=range]`; the size and spacing
  controls are ranges; quantity is a `number` input with stepper buttons;
  results are `<output>`. Keyboard, screen-reader and touch behaviour are the
  platform's, not reimplemented.
- **Correct roles for the invented-looking things.** The thread grid is a
  `radiogroup` with roving `tabindex` and arrow keys; digitising stages are a
  `radiogroup`; steps are an `<ol>` of buttons with `aria-current="step"`.
- **Nothing is pointer-only.** `HoopStage` takes arrow keys in 2mm steps (10mm
  with Shift) *and* has a button per zone. `SwatchBook` has previous/next
  buttons, arrow keys and a dot per material. Drag is always the fast path, never
  the only path.
- **Announcements are rationed.** `StitchProgress` announces the *phase*, not
  the counter — a screen reader should never be read a live-updating number.
- **Contrast is computed, not eyeballed.** `definition()` uses real relative
  luminance and contrast ratio; thresholds are lowered from WCAG text minimums
  because thread has sheen and relief that flat colour does not, and that
  reasoning is documented at the function.
- **Focus is always visible** — `focus-visible:outline-2` in accent, offset off
  the control, on every interactive element.
- **Reduced motion** is honoured in all ten: `StitchReveal` renders the finished
  design (its default markup is the *completed* state, so no-JS gets artwork
  too), `StitchTimeline` keeps the scrubber and drops autoplay, `HoopStage`
  keeps the snap and drops the settle, transitions collapse to `0ms`.

---

## 8. Motion rules

1. **Animation carries information or it does not ship.** Every duration in the
   sequencing components is proportional to a real stitch count. If a motion
   cannot be traced back to a fact in the data model, delete it.
2. **A machine runs at a constant rate.** Stroked blocks reveal with `linear`
   easing, deliberately. Easing them would be a lie about the process.
3. **Cloth eases, needles do not.** `MOTION.fabric` for anything with weight,
   `MOTION.needle` for anything mechanical.
4. **Overshoot exactly once**, on a snap (`MOTION.settle`). Nowhere else.
5. **Only `transform`, `opacity`, `clip-path`, `stroke-dashoffset` and
   `offset-distance` animate.** Never width, height, top, left, box-shadow, or
   filter. Where a layout property must change, FLIP it.

---

## 9. Rules for the eleventh component

- It must read the data model. If it does not touch `StitchBlock`, `Thread`,
  `Fabric` or `Garment`, it belongs in another group.
- It must fail the anti-generic test: could it appear unchanged on a bank's
  dashboard? If yes, it is not finished.
- It must not duplicate an interaction pattern already in the table above, and
  it must not duplicate one already in the library's other 36 groups — check
  `COMPONENT-GROUPS.md` before starting, not after.
- Numbers on screen are `tabular-nums` and formatted through the `fmt*` helpers,
  so a quote and a shop-floor readout can never disagree.
- Add domain maths to `lib/embroidery.ts`, never to the component. `estimate()`
  and `threadMetres()` are shared for exactly this reason.
- Provide `demo.tsx`, register it in `src/lib/registry.ts`, and re-run
  `npm run registry`.
