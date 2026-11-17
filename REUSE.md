# Reusing Motion lib components in another project

Motion lib is a **source registry**, not a package. Components are copied into
the target project as ordinary `.tsx` files that project then owns. That is the
right trade for client work — every brand needs different colours, spacing and
copy, and a versioned package fights you on all three.

The cost is real and worth stating once: **fixes do not propagate.** A bug fixed
here does not reach a site you shipped last month. `add` refuses to overwrite an
existing file for exactly this reason.

---

## One-time setup in the target project

```bash
# 1. Tokens. Tailwind 4 has no JS config, so these live in CSS.
node tools/arvi-ui.mjs theme --dest ../shop/src
```

```css
/* ../shop/src/index.css */
@import "tailwindcss";
@import "./arvi-theme.css";
```

Tailwind 4 needs no `content` array — it scans your source automatically.

---

## Adding components

```bash
node tools/arvi-ui.mjs list                 # everything
node tools/arvi-ui.mjs list commerce        # filter by group, tag or name

node tools/arvi-ui.mjs add swatch-wipe zoom-loupe \
  --dest ../shop/src \
  --alias "~"          # if the target uses ~/ instead of @/
  --with-demo          # also copy demo.tsx as a usage example
  --dry                # preview without writing
```

`add` handles the parts that are easy to get wrong by hand:

- copies the component **and** the `src/lib/*` modules it imports, transitively
  (`useReducedMotion`, `palette`, `SmoothScroll` → which itself pulls gsap/lenis)
- rewrites the `@/` alias to whatever the target uses
- prints the exact `npm i` line for that component's real dependencies
- names the Tailwind tokens and keyframes it needs
- writes shared lib files once, not once per component

Regenerate the registry after editing any component:

```bash
node tools/build-registry.mjs
```

---

## Tailwind 3 → 4 gotchas, in order of how much they'll cost you

**1. Radius.** Motion lib zeroes the entire radius scale in `tailwind.config.ts`.
About a hundred `rounded-*` classes across the library are therefore inert. Drop
one of those components into a project with a normal scale and the corners
round. `arvi-theme.css` keeps them zeroed — if the client's brand is rounded,
delete that block and re-check the copied components.

**2. Named keyframes.** `marquee`, `blink`, `cursor-blink` and `modal-fade-in`
came from the v3 config. They are in `arvi-theme.css`; without it those
components animate to nothing, silently.

**3. Fonts.** Components lean on `font-display` and `font-mono` (Space Grotesk /
Space Mono). If the client uses different faces, remap the two `--font-*` vars
rather than editing each component.

**4. Default border colour.** Tailwind 4 changed bare `border` from gray-200 to
`currentColor`. Motion lib components always name a colour (`border-ink`), so
this is safe here — but watch it in surrounding markup you write.

**5. The App Shell set brings its own theme.** The ten `app-shell` components
render inside a `.shell-theme` scope and use `dark:` variants, which means three
things travel with them: the `.shell-theme` block from `styles/index.css`, a dark
mode strategy (`darkMode: 'class'` in v3; `@custom-variant dark` in v4), and the
`fade-in-up` keyframe plus a `400ms` duration token. Their radii are already
arbitrary values (`rounded-[24px]`), so unlike the rest of the library they are
unaffected by whether the target zeroes its radius scale.

**6. `@apply` in component CSS.** None of these components use it. If you add
any, v4 requires `@reference` to see your theme.

---

## Which components need what

Most are dependency-free — React and Tailwind only. The exceptions:

| Needs | Why |
|---|---|
| `gsap`, `@gsap/react` | ScrollTrigger-driven scroll and scrub components |
| `lenis` | anything importing `lib/SmoothScroll` |
| `framer-motion` | a handful of the older text and transition pieces |
| `embla-carousel-react` | the carousels |

The whole `commerce` group and all of `text-effects` added recently are plain
React — no runtime dependency at all.

---

## Recommended shape for client projects

```
shop/src/
  components/
    commerce/swatch-wipe/SwatchWipe.tsx     ← copied, yours to edit
    ui/                                      ← the client's own components
  lib/
    useReducedMotion.ts                      ← copied once, shared
  arvi-theme.css
```

Keep copied components in their original group folder. When you later diff
against Motion lib to see what changed upstream, matching paths make it trivial.
