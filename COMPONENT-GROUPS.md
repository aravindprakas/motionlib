# Component Groups

Components under `src/components/` are organized by **similarity family** — what a
component looks like and how it works — rather than by type. Each group is a folder:
`src/components/<group>/<component>/`. The preview sidebar (`src/lib/registry.ts`)
mirrors these same groups.

| Group | What connects them | Components |
|---|---|---|
| `cursor-effects` | Follow / trail / spotlight the pointer | custom-cursor, cursor-spotlight, spotlight-grid, image-trail, pointer-trail, link-image-reveal |
| `magnetic` | Cursor-attracted magnetic pull | magnetic, magnetic-button, magnetic-grid |
| `orchestration` | One source of timing or admission governing many elements at once | conductor, shockwave, motion-budget |
| `physics` | Solvers, not timelines: state integrated per frame | tether, toss-field, deform |
| `predictive` | Reacts to where the pointer is going, before it arrives | intent-field |
| `state-motion` | The shape of state over time, made scrubbable | rewind |
| `attention` | Follows where the user's attention actually is | attention-field, focus-flight |
| `tilt-cards` | 3D pointer tilt with depth/glare | tilt-card, tilt-menu-cards |
| `turntables-3d` | Drag-to-spin 3D CSS objects | bottle-turntable, plate-turntable, rolling-prism, cylinder-carousel |
| `carousels` | Draggable carousels & sliders | carousel, drag-carousel, draggable-inertia-slider, coverflow-gallery, cinematic-project-carousel, orbital-media-gallery, chrono-rail |
| `cinematic-scenes` | Choreographed clip-path scene wipes (cinematic-project-carousel's motion family, applied to non-carousel purposes) | cinematic-menu-overlay, cinematic-tabs, cinematic-case-modal, cinematic-process-steps, cinematic-team-roster, cinematic-tracklist, cinematic-location-switcher, cinematic-variant-stage, cinematic-schedule-board, cinematic-404 |
| `horizontal-scroll` | Vertical scroll → horizontal travel (pinned) | horizontal-scroll-gallery, scroll-horizontal-gallery, scroll-linked-carousel |
| `pinned-scroll` | Pinned/sticky scroll scenes & panels | pinned-scene, stacking-cards, sticky-scroll-steps, sticky-feature-cards, scroll-story-engine, scroll-snap-panels |
| `parallax` | Depth-layered parallax on scroll/pointer | parallax-layers, parallax-header, parallax-hero, scroll-parallax-hero |
| `scroll-scrub` | Single element scrubbed by scroll progress | scrub-compare, token-spectrum, scroll-gradient-cta |
| `scroll-nav` | Scroll position → nav / progress | scrollspy, section-nav, scroll-rails |
| `timelines` | Vertical timeline whose spine fills on scroll | sticky-timeline, scroll-timeline |
| `text-effects` | Per-char / per-word text animation | text-scramble, text-roll, letter-stagger, scroll-reveal-text, scroll-text-reveal, reading-highlight, variable-font-morph, gradient-headline, svg-draw, morphing-text, highlighter, comic-text |
| `reveal-entrance` | One-shot entrance reveals (fade / clip / mask) | reveal, blink, clip-path-reveal, masonry-reveal, split-reveal-section |
| `marquee-ticker` | Infinite looping marquees / tickers | marquee, velocity-marquee, vertical-ticker, tag-cloud |
| `counters` | Count-up / rolling-digit numbers | odometer, stat-counters, animated-counters |
| `canvas-generative` | Canvas / WebGL generative backgrounds & bursts | aurora-background, particle-field, wave-bars, ripple-grid, gooey-blob, confetti-burst, generative-mesh, light-rays |
| `grids` | Bento / filter / feature grids | bento-grid, bento-grid-reveal, flip-filter-grid, featured-grid, magnetic-bento-workspace |
| `cards` | Reusable card units | specimen-card, cart-line-item, category-row, flip-menu-cards |
| `micro-interactions` | Tiny high-delight controls (buttons, sliders, toggles, inputs) | hold-to-confirm-button, morphing-submit-button, shred-delete-button, reaction-button, squish-toggle, elastic-range-slider, wave-volume-slider, swipe-to-confirm, dial-knob, scrub-number-input, pin-code-input, ink-checkbox, gooey-segmented-control, peel-sticker, sonar-badge-bell |
| `buttons` | Button variants | buttons, liquid-glass-button, copy-button, interactive-hover-button |
| `forms-inputs` | Fields, forms & input controls | fields, email-field, floating-label-field, conversational-form, newsletter-form, file-dropzone, quantity-stepper, star-rating, selectable-card, consensus-rating |
| `navigation` | Nav bars, menus, docks, tabs | header, mobile-menu, mobile-bottom-nav, radial-menu, liquid-navigation-dock, view-transition-tabs, strata-tree, shapeshift-tabs, fisheye-pager |
| `overlays` | Drawers, toasts, command palette | cart-drawer, toast, kinetic-command-center, satellite-popover |
| `accordions` | Accordion / FAQ disclosure | faq, accordion-faq, experience-accordion, tide-accordion |
| `decor` | Small decorative / control bits | corner-marks, rotating-ring, theme-toggle |
| `data-viz` | Data-driven visual displays | morphing-analytics-explorer, spatial-testimonial-constellation |
| `commerce` | Commerce-specific effects for PDP, PLP, cart & checkout | swatch-wipe, zoom-loupe, shelf-lift, split-flap-eta, stock-erosion, threshold-rule, dimension-rule, price-drop-ghost, condense-buy-bar, bundle-tally, lighting-truth, price-history-spark, spec-diff, receipt-unroll, in-the-box, spec-pins, quantity-resist, save-crease, cadence-dial, cost-per-wear |
| `embroidery` | Domain components for an embroidery/apparel studio, all reading one stitch-file data model (`lib/embroidery.ts`) | stitch-reveal, thread-path, digitize-pass, hoop-stage, thread-drawer, stitch-timeline, stitch-progress, stitch-estimator, swatch-book, repeat-field |
| `heroes-intro` | Hero sections & intro loaders | hero, loading-screen, curtain-page-transition |
| `page-sections` | Page-scale content blocks | about, manifesto, footer, contact-us, category-index, best-sellers-strip, pull-quote, chorus-quote |
| `interactive-showcase` | Large interactive showpieces | projects, floor-plan-picker, spotlight-podium, intelligent-pricing-configurator, living-ai-response |
| `app-shell` | The ten pieces of a working product chrome, built as one system — scoped to its own light/dark theme | shell-header, shell-hero, shell-bento-grid, shell-data-card, shell-sidebar, shell-data-table, shell-popover, shell-primary-button, shell-modal, shell-footer |

203 components · 38 groups. No components were removed in the restructure.

The five newest groups are primitives rather than set pieces. `orchestration`,
`physics`, `predictive`, `state-motion` and `attention` each own a *mechanism* —
a shared clock, an admission queue, a solver, a trajectory model, a frame
history, a presence model — and leave the look entirely to the consumer,
publishing their state as CSS custom properties or data attributes instead of
animating anything themselves. None of them has a runtime dependency, and each
one is driven by an input the rest of the library ignores: elapsed beats,
distance from a strike, concurrency, an element's own velocity, pointer heading,
undo depth, idle time, keyboard focus.

`embroidery` is the first group organised by *domain* rather than by mechanism,
and it is deliberate. Its ten components share no motion family — a masked
reveal, a measured connector, a staged explainer, a drag configurator, a colour
grid, a scrubber, a status gauge, a calculator, a card stack and an SVG pattern
have nothing visual in common. What they share is a data model: every one of
them reads the ordered colour blocks, stitch counts and thread codes in
`lib/embroidery.ts`, which is what a real stitch file contains. That is the
reusable asset. Point `DESIGNS` at a digitiser's export and all ten components
change together; none of them holds a private copy of what a design is.

See [EMBROIDERY.md](EMBROIDERY.md) for the design direction, the responsive
matrix and the rules for adding an eleventh.

The eight newest entries — `chrono-rail`, `strata-tree`, `satellite-popover`,
`consensus-rating`, `tide-accordion`, `chorus-quote`, `fisheye-pager` and
`shapeshift-tabs` — are spread across six existing groups rather than forming
one of their own, because each is a rethink of an everyday archetype (carousel,
tree, popover, rating, accordion, quote, pagination, tabs) and belongs beside
the components it competes with. What they share is a method, not a look: each
sizes itself from its own box via `lib/useSizeBand`, so "mobile / tablet /
desktop" is one continuous axis rather than three code paths, and each keeps a
second, usually-discarded dimension — elapsed time, distribution, reading
history, hierarchy depth, range position — visible in the same control.

`app-shell` is the third group organised by something other than motion family,
and the second organised by what it is *for*. `embroidery` shares a data model;
the Structural Eight share a method; these ten share **the page they build**. A
header, a hero, a bento wall, a card, a rail, a table, a popover, a button, a
dialog and a footer have no visual mechanism in common — what they have in common
is that none of them is interesting alone and all of them are load-bearing the
moment you try to ship a screen. They are the only components in the library that
deliberately abandon the brutalist tokens, and they do it inside a `.shell-theme`
scope so nothing leaks, exactly as the imported `.ss-theme` set does.

See [APP-SHELL.md](APP-SHELL.md) for the motion tokens, the ten decoupled hooks in
`src/lib/shell/`, the two documented performance exceptions and the three additive
Tailwind config changes the set required.
