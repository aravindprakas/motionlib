# Gemini / AURA-10

Open `/gemini` from the library’s **Gemini** collection link. The overview opens
ten independent component demos; each has a shareable
`/gemini?component=<component-id>` URL. Back/forward navigation and the mobile
component selector work within the collection.

The components live under `src/components/gemini/`, with typed props and a
`demo.tsx` beside each implementation. Shared code lives in `src/lib/gemini/`:

- `useSpringPhysics`: bounded, substepped spring integration that preserves
  velocity when a target changes.
- `useContainerDimensions`: a resize observer with coalesced updates.
- `useGLSLCanvas`: compiled WebGL fluid material, context restoration, resource
  cleanup, and a CSS material when WebGL is unavailable.
- `useAnimationCanvas`: offscreen/background suspension, capped device pixel
  ratio, reduced-motion still frames, and 30 Hz canvas work on low battery when
  the browser exposes battery information.
- Fluid shaders have a 131,072-pixel rendering budget independent of the layout
  size; other canvases have a 1,048,576-pixel budget.
- `AuraDialog`: keyboard containment, Escape/backdrop dismissal, focus return,
  background inertness, independent nested scrolling and scroll locking.
- `aura.css`: scoped glass materials, fluid typography and container queries.

| ID | Interaction | Demo stress control |
| --- | --- | --- |
| `kinetic-fluid-glass-card` | Tilt, reflection and cursor velocity driving a shader | 5,000-character unbroken title |
| `magnetic-holographic-command-palette` | Magnetic dock, Ctrl/⌘ K, search, arrows, Enter, direct shortcuts | 500-word command |
| `quantum-dynamic-data-grid` | Sort, hide/show columns, bounded row rendering, page scrub | 50 columns and 10,000 rows |
| `biometric-particle-auth-slider` | Pointer capture, release momentum, particles, keyboard completion | Interrupt and reverse a drag |
| `morphing-hyper-glass-modal` | Trigger-position expansion and independently scrolling content | Scroll inside the open dialog |
| `infinite-spatial-dimension-carousel` | 3D rail, drag inertia, keyboard wraparound, stable active IDs | Insert items without remounting the rail |
| `force-graph-dynamic-node-tree` | Elastic tendons, spatial collision hashing, drag and auto-fit camera | 3–300 nodes |
| `reactive-ambient-sound-visualizer` | Synthetic spectrum or Web Audio from a local file | Pause, change intensity, switch source |
| `spatial-parallax-navigation-bar` | Spring tracker, scroll compression, live DOM measurement | Add/remove links |
| `kinetic-matrix-shader-button` | Fluid material, text scramble, hold pressure and release particles | 5,000-character label |

Every demo offers Fluid, Sidebar and 280-width specimen modes. Text grows the
surface vertically; wide data tables and navigation lists scroll within their
own containers. The verification slider is an interaction demo and does not
perform authentication or collect biometric information. Audio stays silent
until a file is selected and played; there is no microphone request.

Run `npm run registry` after source edits. Registry payloads include the shared
CSS and hooks, and `--with-demo` includes demo-only shared modules:

```text
npm run ui -- add kinetic-fluid-glass-card --dest ../your-app/src --with-demo
```

React, Tailwind (for the demo and `sr-only`) and the listed npm dependencies are
required in the destination project. The fluid material uses native WebGL and
the graph uses SVG; Three.js is not required.

The brief’s 120 FPS, sub-millisecond sorting and CLS < 0.001 figures are targets,
not measured guarantees across devices. The modal uses transform-based spatial
expansion and backdrop blur; it does not distort the live background DOM with
a displacement shader. Text scrambling is DOM-based over the shader material.

## Verification

- TypeScript and the production build passed.
- All ten demos were checked at 280px and 4096px without horizontal specimen
  overflow or an error-boundary fallback. The browser caps the requested 8K
  viewport at 4096px, so 8K rendering remains unverified.
- Keyboard command search/selection, 50-column sorting and visibility,
  verification completion/reset, modal focus wrapping/return, carousel item
  insertion, 300 graph nodes, visualizer pause, dynamic navigation links and
  button activation were checked in the running app.
- The card’s unbroken 5,000-character title and the button’s long label were
  checked in the narrow container.
- `node tools/check-gemini.mjs` verifies six text/surface contrast pairs (all
  above 4.5:1) and complete reusable exports for all ten components.
