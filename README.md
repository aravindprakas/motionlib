# MOTION LIB — brutalist motion components

Production-grade React + TypeScript motion/interaction catalog with a live preview shell.
Vite · React 18 · Tailwind · GSAP (ScrollTrigger + Flip) · Lenis · Framer Motion · embla (headless).

## Claude collection

The sidebar's **Claude** link opens `/claude/`. Its complete deliverable is
`public/claude/index.html`: ten vanilla Web Components, inline CSS/JS, optional
Google Fonts with system fallbacks, and no runtime library dependencies.
It also opens directly as a standalone HTML file. The showcase includes light/dark
themes, a real 320–3840px preview viewport, RTL preview, offline source download,
API and requirement notes, and a built-in automated quality harness. Demo prices,
testimonials, enquiries, and revenue are explicitly illustrative and local.

## Run

The **ChatGPT** collection is available at `/chatgpt`: ten interaction studies with live demos, theme/state controls, design notes, typed APIs, usage examples, and complete source. See [CHATGPT.md](./CHATGPT.md) for design, architecture, reuse, and edge-case notes.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build
```

## Catalog — 53 entries in 4 categories

- **Effects (23):** MagneticButton, Magnetic, CustomCursor, CursorSpotlight, ImageTrail, SpotlightGrid, LinkImageReveal, TiltCard, ScrollRevealText, ScrollTextReveal, TextScramble, VariableFontMorph, Reveal & Blink, ClipPathReveal, VelocityMarquee, Marquee, StackingCards, HorizontalScrollGallery, PinnedScene, StickyScrollSteps, ParallaxLayers, ScrollSnapPanels, CurtainPageTransition
- **Elements (4):** Buttons, Form Fields, SelectableCardGroup, CornerMarks
- **Components (12):** BentoGrid, FlipFilterGrid, DraggableInertiaSlider, DragCarousel, SpecimenCard, CartLineItem, CategoryRow, StatCounters, PullQuote, NewsletterForm, ViewTransitionTabs, Toast
- **Sections (14):** Header + UtilityBar, Hero, ParallaxHeader, CategoryIndex, FeaturedGrid, BestSellersStrip, Manifesto, About, ExperienceAccordion, ContactUs, MobileMenu, MobileBottomNav, CartDrawer, Footer

Every component: typed props with defaults, `prefers-reduced-motion` fallback, full cleanup on unmount, transform/opacity-only animation (documented exceptions: clip-path in ClipPathReveal, font-weight in VariableFontMorph — both isolated and intentional).

## Architecture

- `src/lib/SmoothScroll.tsx` — Lenis provider per preview stage: Lenis drives the wrapper's native scroll, `lenis.on('scroll', ScrollTrigger.update)`, GSAP ticker drives `lenis.raf` with `lagSmoothing(0)`. Scroll-driven components read the scroller via `useScroller()` and pass it to ScrollTrigger / framer `useScroll`, so pin + scrub stay correct under smooth scroll.
- `src/lib/gsap.ts` — single place plugins are registered (ScrollTrigger, Flip). Free plugins only.
- `src/lib/registry.ts` — categorized single source of truth. Sidebar (grouped, global mono indices, arrow-key nav) and the stage both derive from it.
- `src/lib/sample-data.ts`, `src/lib/types.ts` — shared demo fixtures for the commerce/portfolio sections.

## Adding a component

1. `src/components/<category>/<your-thing>/{YourThing.tsx, demo.tsx}` (categories: `effects`, `elements`, `ui`, `sections`)
2. One entry in the matching category in `src/lib/registry.ts`. Done.

## Design tokens

Bone `#ece6d8` · ink `#0c0b0e` · vermilion `#ff4d23` (hover `#ff5630`). `paper`/`accent` are aliases of bone/vermilion kept for the components ported from the Store catalog. Space Grotesk (display/sans, loaded as a variable font 300–700 for VariableFontMorph), Space Mono (labels/indices), Instrument Serif (editorial italics). Radius 0 everywhere; 1px ink hairlines; no shadows.

## Provenance & fixes

Roughly half the catalog was ported from the `Store` project and upgraded to this codebase's standards during the move: Tailwind v4 → v3 syntax, `left/top` animations → transforms, missing reduced-motion/touch guards added, hardcoded demo content extracted into typed props, window-scroll reads rewired to the Lenis scroller, leaked listeners/rAF loops given proper cleanup. Store components that were app-specific (weather widgets with a sound engine, three.js showpieces, one-off layout studies) were intentionally left out.

## Live Components II (31–50)

Twenty components imported from the "Live Components II" design and ported to this codebase. Distribution: 11 effects (LetterStagger, TokenSpectrum, MagneticGrid, GradientHeadline, PointerTrail, GooeyBlob, ScrubCompare, ReadingHighlight, WaveBars, RippleGrid, ConfettiBurst), 2 elements (RadialMenu, RotatingRing), 6 components (VerticalTicker, Odometer, Carousel, TagCloud, Scrollspy, MasonryReveal) and 1 section (StickyTimeline).

Hybrid port: brutalist **shape** (radius 0, 1px ink hairlines, no shadows) is kept, but the source **palette** is retained because several pieces are literal demos of a multi-token colour ramp. That palette lives in `src/lib/palette.ts` (`SET2`, `SET2_RAMP`, `hexToRgb`) and is mirrored in Tailwind as `navy` (`navy-700/900/soft/line`), `cream`, `coral`, `moss`, `gold`, `violet`.

Engineering upgrades applied during the move, matching the rest of the catalog: hardcoded content extracted into typed props with defaults; window-scroll reads rewired to the Lenis scroller via `useScroller()`; `prefers-reduced-motion` and touch guards added; canvas pieces sized in device pixels and **paused off-screen** with an IntersectionObserver rooted on the ambient scroller; every listener / rAF loop / ScrollTrigger given proper cleanup. Documented exception: `GooeyBlob` animates `border-radius` (its organic morph is the effect), in the same spirit as the existing clip-path / font-weight exceptions.

## Fable 3D (51–60)

Ten CSS-3D pieces ported from the "Fable 3D" restaurant kit and **re-skinned to the brutalist tokens**. The source shipped a warm restaurant palette (Cormorant Garamond / Hanken Grotesk, amber accent, midnight/daylight themes); all of it was recoloured to bone/ink/vermilion with Space Grotesk/Mono, radius 0, 1px ink hairlines and no shadows. Distribution: 7 components (`TiltMenuCards`, `FlipMenuCards`, `CylinderCarousel`, `BottleTurntable`, `RollingPrism`, `CoverflowGallery`, `PlateTurntable`) and 3 sections (`ParallaxHero`, `FloorPlanPicker`, `SpotlightPodium`).

All ten are pure CSS 3D — `perspective` + `preserve-3d` + translateZ / rotateX/Y, no WebGL. Engineering upgrades applied during the move, matching the rest of the catalog: the standalone-app globals were removed — the `window.__fableMotion` intensity global became a typed `intensity` prop, and the drag-drop `<image-slot>` web component became a typed `image` prop with a dashed-slot fallback; hardcoded content was extracted into typed props with defaults; `prefers-reduced-motion` guards were added everywhere (flat world, instant flips, no idle auto-spin); every rAF loop and pointer capture is cleaned up on unmount. Intrinsic round geometry (plates, the bottle, hotspot dots, table tops) keeps its circle via inline `border-radius: 50%` — the same exemption the library already makes for its SVG/ring pieces — while everything rectangular stays sharp.

## Structural Eight

Eight components that take the most ordinary archetypes in interface design —
carousel, tree view, popover, rating, accordion, quote, pagination, tabs — and
rebuild each around the dimension its usual implementation throws away. They are
filed in the groups they compete with (`carousels`, `navigation`, `overlays`,
`forms-inputs`, `accordions`, `page-sections`), not in a set of their own.

| Component | Group | The idea |
|---|---|---|
| `ChronoRail` | carousels | The rail is a real time axis. A quiet year is empty rail; a busy quarter shingles into a deck. `compression` dials continuously between a true timeline and an ordinary carousel. |
| `StrataTree` | navigation | A windowed tree: 10,000 nodes, ~20 elements. Nesting is depth in Z, ancestors of the top row condense into a sticky spine, and a closed row's hairline is sized to the descendants it hides. |
| `SatellitePopover` | overlays | Closes on *direction*, not on a delay — the exit point and the panel's near edge span a corridor you can cross at any speed. Dwell pins it into a real dialog; under 600px it is a drag-dismissable sheet. |
| `ConsensusRating` | forms-inputs | Input, vote distribution and the drift of the average over time, all registered to one score axis — so 4.2 from agreement and 4.2 from an argument stop looking alike. |
| `TideAccordion` | accordions | A fixed budget of space. Opening a panel takes room from the others, so the component's box never changes and nothing outside it reflows. `maxOpen` evicts by age of opening. |
| `ChorusQuote` | page-sections | Consecutive quotes diffed at word level; the words two reviews share travel by FLIP instead of cross-fading, so the agreement between customers becomes visible. |
| `FisheyePager` | navigation | The whole range on one bar under a focus+context lens, sampled to a hard cell cap. Geared drag-scrub (1× / 10× / 100×) crosses ten thousand pages in one gesture. |
| `ShapeShiftTabs` | navigation | Full row → priority-plus row with a menu → listbox, decided by its own width. One indicator throughout; when the active tab is pushed into the menu, the indicator moves onto the menu button. |

**Container-driven, not viewport-driven.** `src/lib/useSizeBand.ts` is the shared
primitive: one ResizeObserver per component publishing a `data-band`
(`compact` / `regular` / `wide`) plus a `--cw` custom property. React re-renders
only when the band *changes*, never per pixel, and `--cw` is consumed by
transforms and opacity only — feeding it back into a property that changes the
element's own size builds a resize loop. The practical result is that a
component in a 320px sidebar behaves exactly as it does on a phone, and there is
not one `@media` query in the set.

**Performance.** Positions are solved once per layout and animated by translating
a single track (`ChronoRail`); rows and pager cells are windowed or sampled under
a hard cap (`StrataTree`, `FisheyePager`); drag writes one CSS variable and
commits to React on release (`ConsensusRating`); the word morph is a strict
two-pass FLIP on WAAPI (`ChorusQuote`); placement is transform-only so
repositioning on scroll never triggers layout (`SatellitePopover`); collapsed
bodies are skipped via `content-visibility` inside a `contain: layout paint` box
(`TideAccordion`); label widths are measured once and cached (`ShapeShiftTabs`).
Every rAF-coalescing handler uses cancel-and-request rather than guarding on a
stored id — a frame requested while the tab is hidden may never run, and a stale
id would wedge the handler shut for the rest of the session.

**Accessibility.** Real roles and keyboard models throughout: `tree` with
arrow/expand/collapse and Home/End, `slider` with arrows and Page keys, `tablist`
with wrapping arrows, disclosure semantics with roving focus, `dialog` with focus
move, Escape and click-outside. Every one has a `prefers-reduced-motion` path
that removes motion without removing information.

## App Shell (171–180)

Ten components that make up a working product chrome — `Header`, `HeroSection`,
`BentoGrid`, `DataCard`, `Sidebar`, `DataTable`, `Popover`, `PrimaryButton`,
`Modal`, `Footer` — built as one system rather than ten samples. Filed under a new
`app-shell` group.

**A scoped departure from the house tokens.** This is application chrome, not a
specimen plate, so it runs 24px radii, real elevation, white/near-black grounds and
an indigo accent — all of it inside a `.shell-theme` scope in `styles/index.css`,
the same containment the imported `.ss-theme` set uses. Nothing leaks onto the
brutalist catalogue. Note that the global `borderRadius` scale is zeroed, so every
radius in the set is an arbitrary value (`rounded-[24px]`, `rounded-[999px]`) and
has to stay that way.

**One spring, one stagger.** Everything that enters uses `stiffness: 100,
damping: 20` and a container-owned stagger, which is why a hero and a bento wall on
the same page read as one page instead of two libraries. Tokens live in
`lib/shell/tokens.ts`.

**State logic is decoupled.** Ten hooks in `src/lib/shell/` — `useScrollState`,
`useDisclosure`, `usePresence`, `useAnchoredPosition`, `useFocusTrap`,
`useLockBodyScroll`, `useInViewOnce`, `useTableSort`, `useSidebarState`,
`PortalContext` — none of which renders anything. `build-registry` resolves them
transitively, so `arvi-ui add shell-modal` copies the three it needs and no more.

**Frame budget.** Scroll is not a render (`useScrollState` publishes booleans and
writes `--scroll-progress` outside React); pointer tracking is not a render
(`DataCard` writes `--mx`/`--my` straight to the node in a rAF); the table cascade
is a plain keyframe with a capped `animation-delay` ladder. Two documented
exceptions in the same spirit as the existing ones: `Sidebar` animates `width`
because the page is supposed to make room (bounded by `contain: layout paint`), and
`Footer` animates `stroke-dashoffset` for a one-shot line drawing.

**Config additions**, all additive: `darkMode: 'class'` (the library had no
`dark:` variants before this set), `transitionDuration: { 400: '400ms' }`, and the
`fade-in-up` keyframe/animation pair. Carry the last two into any project you copy
these into — `arvi-ui add` prints them.

See [APP-SHELL.md](APP-SHELL.md) for the full breakdown.

## Expedition (181–190)

Ten components for the same embroidery business as the `embroidery` group,
reinterpreted as a **digital archaeological expedition** — artifacts that are
discovered, documented, examined, classified, restored and acquired, rather than
products that are browsed and bought. The business category is deliberately not
legible from the interface alone; the domain underneath it is unchanged.

`ExpeditionOpening` · `ArtifactCatalog` · `ArtifactScanner` · `ExpeditionMap` ·
`RestorationLab` · `FieldNotes` · `SpecimenComparison` · `MaterialVault` ·
`AcquisitionDesk` · `CollectionVault`

**An accession layer, not a re-skin.** `src/lib/expedition.ts` adds only
archival facts — accession number, stratum, territory, rarity, condition,
recovery date, narrative, edition — on top of `src/lib/embroidery.ts` and points
at designs, garments and fabrics by id. Complexity, fill density, price, thread
metres and lead time are all *derived*, and the acquisition ledger routes
through the existing `estimate()` so a catalogue card and a shop-floor quote
cannot disagree.

**Its own paper, scoped.** `src/styles/expedition.css` carries the full token
system under `.exp` — aged ivory, charcoal, archival red, oxidised bronze;
Instrument Serif for catalogue titles, Space Grotesk for controls, Space Mono for
metadata — using the same containment `.ss-theme` and `.shell-theme` use. Colour
is classification, never decoration, and the set has no elevation model at all:
hairlines, registration marks and stacked paper instead of shadows.

**Container-driven, and recomposed rather than shrunk.** Every component sizes
itself from its own box via `useSizeBand`. Where a layout cannot survive a phone
it gets a *different body*: the survey map becomes a vertical territory index
below ~620px, the comparison bench becomes A/B slots with every mark still on
every axis, and the restoration lab and acquisition desk move their controls into
sticky bottom trays.

**No new dependencies**, transform/opacity animation with two bounded documented
exceptions, one capped stagger ladder, one ResizeObserver per component and a
single self-unobserving IntersectionObserver in the whole set.

See [EXPEDITION.md](EXPEDITION.md) for the full breakdown — creative direction,
tokens, the ten, responsive matrix, performance and accessibility audits, motion
system, and the quality gate (including the seven defects found and fixed while
verifying the set in the running app).

## Gemini / AURA-10

The **Gemini** subpage at `/gemini` contains ten fluid-glass components with
individual interactive demos, responsive specimen controls and direct links.
The collection includes cards, commands, data, verification, overlays, spatial
navigation, a force graph, audio and kinetic actions. See [GEMINI.md](GEMINI.md)
for component IDs, shared hooks, reuse instructions and verification limits.
