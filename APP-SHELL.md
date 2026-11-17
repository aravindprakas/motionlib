# App Shell

Ten components that make up a working product chrome — header, hero, bento wall,
card, sidebar, table, popover, button, modal, footer — built as one system rather
than ten samples. The set is filed under `src/components/app-shell/`.

It is the third group in the library organised by something other than motion
family. `embroidery` is grouped by a shared data model; the Structural Eight are
grouped by a shared method. This one is grouped by **the page it builds**: none
of these ten is interesting on its own, and all of them are load-bearing once you
try to ship a screen.

---

## Why this set looks nothing like the rest of the library

The house tokens are brutalist: radius 0, 1px ink hairlines, no shadows, bone and
vermilion. This set is the opposite — 24px radii, real elevation, white and
near-black grounds, an indigo/fuchsia accent. That is deliberate and it is
scoped, in exactly the way the `.ss-theme` import already is:

- `.shell-theme` in `src/styles/index.css` opens the scope. Everything the set
  paints lives inside it, so nothing leaks onto the brutalist catalogue.
- The library's `borderRadius` scale is **zeroed globally**, which means
  `rounded-2xl`, `rounded-full` and friends are inert here. Every radius in this
  set is an arbitrary value — `rounded-[24px]`, `rounded-[14px]`,
  `rounded-[999px]` — and must stay that way.
- `src/lib/shell/ShellStage.tsx` is the demo-only wrapper. It opens the scope,
  owns the `dark` class, and nominates itself as the portal target.

If you want the brutalist look instead, the set survives it: swap the radii for
`rounded-none`, drop the shadow utilities, and the motion is unchanged.

---

## The ten

| Component | Folder | The dimension it owns |
|---|---|---|
| `Header` | `shell-header` | 64px sticky bar. Scroll position as **discrete state**, so it re-renders about four times in a full-page scroll instead of four hundred. `--scroll-progress` is written outside React for the per-pixel rule. |
| `HeroSection` | `shell-hero` | `min-h-[85vh]`. One `stiffness: 100 / damping: 20` spring, one container-owned stagger; eight elements read as one gesture. Optional per-word headline stagger nested inside it. |
| `BentoGrid` | `shell-bento-grid` | `grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-6 p-8` with typed `ColSpan`/`RowSpan`. The container owns the stagger, so cells can be added or removed without touching a delay. |
| `DataCard` | `shell-data-card` | `hover:-translate-y-[4px]` + `hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]` at `duration-400`. Deliberately small: a bento wall is a dozen of these under one pointer sweep. |
| `Sidebar` | `shell-sidebar` | Three widths — 76 collapsed, 280 at rest, 320 peeked — that compose instead of fighting. The one place in the set that animates `width`, bounded by `contain: layout paint`. |
| `DataTable` | `shell-data-table` | A capped 50ms `animation-delay` ladder. Sorting replays the cascade; nothing else does. Becomes a card stack when **its own container** is narrow, not when the viewport is. |
| `Popover` | `shell-popover` | Mounts one painted frame closed so `scale-95 → scale-100` has a value to run from. `transform-origin` is resolved *after* collision handling, so a flipped panel grows from the right corner. |
| `PrimaryButton` | `shell-primary-button` | A 500ms gradient sweep and a 120ms press, on two layers — one element cannot carry two transition durations. |
| `Modal` | `shell-modal` | Overlay blur and panel zoom on one 300ms clock. Real focus trap, focus restoration, reference-counted scroll lock with the scrollbar gutter replaced as padding. |
| `Footer` | `shell-footer` | `min-h-[300px] pt-16`. One-shot SVG line drawing on intersection, with `pathLength="1"` so the dash math never needs re-measuring. |

---

## Hooks

All the state logic is in `src/lib/shell/`, decoupled from anything that renders.
Every one of them is useful outside this set, and `tools/build-registry.mjs`
resolves them transitively, so `arvi-ui add shell-modal` copies the three hooks it
needs and nothing else.

| Hook | What it owns |
|---|---|
| `useScrollState` | Scroll position as `{ atTop, condensed, direction }` — commits to React only on a change, with hysteresis on the direction flip. Writes `--scroll-progress` to an optional target every frame, outside React. |
| `useDisclosure` | Controlled/uncontrolled open state with stable callback identities. Every overlay in the set takes the same three props. |
| `usePresence` | Mount → paint one frame closed → flip `data-state` → hold through the exit. The reason the CSS entrances actually run. |
| `useAnchoredPosition` | Transform-only floating placement with flip and shift, reporting the resolved `transform-origin`. |
| `useFocusTrap` | Focus in, Tab wrapped, focus restored. Tab ring recomputed per keypress, not cached at open. |
| `useLockBodyScroll` | Reference-counted, gutter-compensated scroll lock. |
| `useInViewOnce` | One-shot intersection rooted on the ambient Lenis scroller. Latches and disconnects. |
| `useTableSort` | Three-state sort with mixed-type comparison and nulls last, plus a `generation` counter that increments only when the visible order changes. |
| `useSidebarState` | Collapsed / resting / peeked, with the keyboard-focus peek and the `relatedTarget` check that stops it flickering. |
| `PortalContext` | Lets a themed subtree nominate a portal target, so an overlay is dark when the app is dark. Falls back to `document.body`. |

---

## Performance

The standard is one composite per interaction, and the set holds it by keeping
animated properties to `transform`, `opacity`, `background-position` (on its own
layer) and `box-shadow`. Specifically:

- **Scroll is not a render.** `useScrollState` publishes booleans; the continuous
  value goes to a CSS custom property. A sticky header costs the page nothing
  while you scroll past it.
- **Pointer tracking is not a render.** `DataCard`'s spotlight writes `--mx` /
  `--my` straight to the node inside a rAF. A card that re-rendered on
  `pointermove` would cost more than every other animation here combined.
- **Every rAF handler cancels and re-requests** rather than guarding on a stored
  id — a frame requested while the tab is hidden may never run, and a stale id
  would wedge the handler shut for the rest of the session. (Same rule as the
  Structural Eight.)
- **The row cascade is CSS.** No interruption to handle, no gesture to track, no
  spring to settle — so a 200-row table costs one style recalc and zero JS during
  the reveal, with a delay ceiling so the tail does not wait seconds for its turn.
- **Variants objects are hoisted to module scope.** One allocation for the life
  of the module instead of one per render, with a stable identity for framer to
  compare against. Where a variant needs a prop (`BentoGrid`'s `delay`) it is a
  dynamic variant resolved against `custom`, rather than an object rebuilt in the
  render body.

### Documented exceptions

The library already makes room for these when they are the effect rather than a
shortcut, and names them:

- **`Sidebar` animates `width`** — a layout property. A rail that widened by
  transform would slide *over* the main column instead of moving it, and the
  whole point of the gesture is that the page makes room. `contain: layout paint`
  bounds the reflow to the rail's own box.
- **`Footer` animates `stroke-dashoffset`** — a paint. Six short paths in a
  110×52 box, running once, at the bottom of the page, where nothing else is
  moving. The same technique across a full-viewport illustration would be a
  frame-rate problem.

Both sit alongside the existing exceptions (clip-path in `ClipPathReveal`,
font-weight in `VariableFontMorph`, border-radius in `GooeyBlob`).

---

## Accessibility

Not retrofitted — several of these components would need rewriting to add it
later:

- `Modal`: `role="dialog"` + `aria-modal`, `aria-labelledby` / `aria-describedby`
  wired to real nodes, Tab contained, focus returned to the trigger on close.
- `Popover`: `aria-haspopup` / `aria-expanded` / `aria-controls` on the trigger,
  arrow-key roving with Home/End under `role="menu"`, Escape, click-outside on
  `pointerdown`, focus restored.
- `DataTable`: `aria-sort` on sortable headers, a real `<caption>`, keyboard row
  activation with Enter and Space when rows are activatable.
- `DataCard`: renders a `<button>` only when it does something. A hover lift is
  not a reason to be focusable.
- `Sidebar`: keyboard focus peeks the rail open, `aria-current="page"` on the
  active item, labels `aria-hidden` while collapsed so nothing mid-fade is read.
- Reduced motion: every component branches, and `.shell-theme`'s media block
  neutralises the CSS ladder rather than just stopping it — an `opacity-0` start
  with the animation disabled would leave the rows invisible forever.

---

## Global changes this set required

Three additions to `tailwind.config.ts`, all additive:

```ts
darkMode: 'class',                       // the set ships a real light/dark pair
transitionDuration: { 400: '400ms' },    // the card curve; Tailwind ships 300 and 500
keyframes: { 'fade-in-up': { ... } },     // the DataTable / Footer row ladder
animation: { 'fade-in-up': 'fade-in-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both' },
```

`darkMode: 'class'` was free — the library had no `dark:` variants before this
set. Copying any of these into another project means carrying the `fade-in-up`
keyframe and the `400` duration across; `node tools/build-registry.mjs` records
both per component, and `arvi-ui add` prints them.

One addition to `src/styles/index.css`: the `.shell-theme` block, scoped exactly
like `.ss-theme`.

---

## Composing them

The demos are one component each, per the repo's convention, and they do not
import across component folders — `tools/build-registry.mjs` copies a component's
own folder plus its `@/lib` dependencies, so a cross-folder relative import would
break `arvi-ui add --with-demo`. The intended page assembly is:

```tsx
<Header brand={<Brand />} items={NAV} activeId={section} onSelect={setSection} progress />

<HeroSection
  headline="…"
  actions={<><PrimaryButton>Start</PrimaryButton><PrimaryButton variant="ghost">Docs</PrimaryButton></>}
/>

<BentoGrid>
  <BentoCell colSpan={2}><DataCard title="Events" value="4.28B" tone="accent" spotlight /></BentoCell>
  <BentoCell><DataCard title="p99" value="38ms" /></BentoCell>
</BentoGrid>

<DataTable rows={rows} columns={columns} getRowId={(r) => r.id} />

<Footer brand={<Brand />} columns={FOOTER} />
```

`Sidebar`, `Popover` and `Modal` slot in wherever the app needs them; all three
take the same `open` / `defaultOpen` / `onOpenChange` triple via `useDisclosure`.
