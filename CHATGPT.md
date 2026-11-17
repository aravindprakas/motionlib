# ChatGPT — ten interaction studies

Open `/chatgpt`. The original library also has a ChatGPT link and ten individually registered demos. Every study includes Experience, Design notes, API & usage, and the complete TypeScript source. `?study=<id>` opens a study; timeline and lens selection use independent URL parameters. Existing query parameters are preserved.

## Design language, defined before implementation

The collection treats an interface as an instrument for attention. Warm paper and mineral green establish a quiet ground; charcoal supplies hierarchy. Color means selected, available, or consequential. The art is local SVG geometry, existing project photography, and a locally synthesized three-note audio sample. No new runtime dependency was installed.

Tokens live in `src/styles/chatgpt.css`, scoped to `.cg-theme`:

| System | Decision |
|---|---|
| Typography | Instrument Serif for ideas and consequential numbers; Space Grotesk for controls and readable text; Space Mono for metadata. System/Georgia fallbacks keep the collection usable if web fonts fail. |
| Scale | Fluid 27–54px component headings, 46–82px page heading, 11–15px body/control text, 8–10px quiet metadata. Important information is never only metadata. |
| Spacing | 4/8/12/16/24/32px rhythm; component padding `clamp(16px, 3vw, 36px)`. |
| Radius | 5–8px objects, 10px stage, circles only for status/position. |
| Elevation | Hairlines and rank normally; restrained elevation for floating panels, selected media, and native dialogs. |
| Color | Semantic `--cg-bg`, `--cg-surface`, `--cg-soft`, `--cg-text`, `--cg-muted`, `--cg-line`, `--cg-accent`, `--cg-danger`, plus four data tones. A complete dark palette is scoped to the collection. |
| Motion | 140ms feedback, 280ms state transitions, cubic-bezier(.22,1,.36,1); shared 280 stiffness / 32 damping spring. Nothing auto-advances. |
| Interaction | Stable hit areas, pressed/expanded/current state, 36–44px controls, two-pixel visible focus outline with four-pixel offset. |
| Responsiveness | Intrinsic wrapping and named `instrument` container queries at 640/440px; page rail adapts at 800px. Timeline rail becomes vertical at a 600px viewport. Browser zoom reduces the available CSS width and activates these same behaviors. |
| Reduced motion | MotionConfig honors the preference; hooks make shared layout and magnetic effects instant/static. CSS disables transitions and spinners without hiding any state or content. |
| High contrast | System Canvas/CanvasText/Highlight colors, explicit selection outlines, text values for charts, borders for notes. Decorative branches are supplementary. |

## Architecture and reuse

Exactly ten primary components live in `src/components/chatgpt/<id>/`. Each exports a strongly typed prop interface and its own supporting content types. Its `demo.tsx` is an executable usage example. Shared helpers are in `src/lib/chatgpt.tsx`; domain fixtures are separate in `chatgpt-data.ts`.

`chatgpt-catalog.tsx` defines lazy demo imports and the in-page documentation. The page and library have independent lazy entry points. Source text loads only when its tab opens. Only the selected demo mounts, which tears down the previous study's listeners, observers, requests, and gesture state.

To reuse a study:

```tsx
import './styles/chatgpt.css';
import { LivingCommandCenter } from './components/chatgpt/living-command-center/LivingCommandCenter';

<div className="cg-theme cg-component-root" data-theme="light">
  <LivingCommandCenter panels={panels} onAction={handleAction} />
</div>
```

The wrapper establishes theme tokens and the responsive container. Set `data-theme="dark"` on the outer theme root for dark mode. Copy the component and its shared `@/lib/chatgpt` / `useReducedMotion` dependencies, or use the existing registry workflow. The registry CLI currently copies TypeScript dependencies; copy `chatgpt.css` separately, as with the other collection-wide stylesheets.

Content IDs must be stable and unique within a dataset. Arrays are immutable inputs. Callback events report domain IDs/data, not DOM internals. Local interactive state belongs to the component; applications persist data using callbacks. For timeline/lens composition, pass unique `linkKey` values. For multiple command palettes or forms, pass distinct storage keys. The native modal helper supplies unique heading IDs; the palette supplies unique listbox/option IDs.

`AsyncSurfaceProps` supports `state: 'ready' | 'loading' | 'empty' | 'error' | 'partial'` and `onRetry`. Loading/error takes precedence over absent data. A partial result is usable and explicitly labeled. Empty arrays produce an onboarding surface. The showcase's Preview state control exercises these shared surfaces; the input and temporal demos wrap their own models with it.

These are frontend components with real local interactions, not a backend integration. The palette exports actual JSON, parses actual JSON for validation, renames/archives local state and reverses it. Project creation writes a local project to browser storage. The consequence projection is an explicitly labeled illustrative model; inject your own projection function for real forecasts.

## The ten concepts and APIs

### 01 — LivingCommandCenter

**Concept:** A workspace rearranges around the information that deserves attention. Its novelty is the relationship between spatial rank (dock/float/collapse) and depth (overview/detail).

The primary focus is the leading panel's value. The selected panel's tasks become secondary attention; metadata remains quiet. Arrow affordances and panel controls advertise interaction. State changes and checked tasks supply feedback. Overview and Escape restore the trigger after the returning layout mounts.

State: focused panel ID, docked/collapsed IDs, one floating panel, and completed item IDs. Events: `onAction(panelId, itemId)`. On desktop, rank determines the spatial arrangement; on narrow containers, the leading panel becomes full width, then all panels become a stack. Layout springs preserve identity. No continuous ambient loop is needed: the workspace moves when its composition changes.

`LivingCommandCenterProps`: `panels: WorkspacePanel[]`, optional `state`, `onRetry`, `onAction`. `WorkspacePanel` has `id`, `title`, `subtitle`, `value`, `change`, and `items` (`id`, `label`, `detail`, optional `done`).

Example: `<LivingCommandCenter panels={panels} onAction={toggleTask} />`.

Edge handling: empty panels, one panel, long titles, changing IDs, rapid toggles, detail removal, reduced motion. Overview summaries are bounded to two/three tasks; detail intentionally renders the selected panel's tasks, so applications should group or page unusually large task lists before passing them in.

### 02 — CinematicTimeline

**Concept:** A narrative acts like an edit sequence, with one dominant frame and discoverable neighbors. Unlike an ordinary list, changing focus changes the narrative scale while retaining frame identity.

Primary: the image and title. Secondary: the selected chapter's narrative. Quiet: dates and frame counts. Scroll snapping, thumbnails, and arrow controls expose interaction. The current-step marker and changing narrative are feedback. Previous/next, Home/End, and invalid-link fallback are recovery paths.

State: selected frame ID in the URL. Events: `onSelect(frame)`. A horizontal scroll rail becomes vertical on phones; image and text stack. Touch drag is native overflow scrolling. Keyboard arrows move through the same sequence. The art reveals through a directional mask; reduced motion switches instantly. At most seven thumbnails mount; earlier/later windows reach arbitrarily large sequences.

`CinematicTimelineProps`: `items: TimelineFrame[]`, optional `initialId`, `linkKey`, `onSelect`, `state`, `onRetry`. A frame contains `id`, `title`, `chapter`, `date`, `description`, optional `seed`.

Example: `<CinematicTimeline items={chapters} linkKey="chapter" />`.

Edge handling: empty/single-item sequences, unknown deep links, rapid selection, long narrative text, thousands of items, orientation changes, and scroll/window coordination. The rail is a keyboard focusable region with native buttons and current-step semantics.

### 03 — MorphingDataExplorer

**Concept:** Persistent source rows let table, chart, metric, distribution, and detail describe the same data. The novelty is keeping named data anchors while changing their explanatory geometry.

Primary: the dataset signal. Secondary: its filtered totals and individual source comparisons. Quiet: channel labels and paging. Segments, search, and sorting expose interaction. Updated bars, counts, and text show feedback. Clear filters, retry, and explicit unavailable values recover from missing data.

State: representation, query, channel filter, sort direction, page, and selected source. Event: `onSelect(datum)`. A real table remains in every representation; visual bars are decorative supplements to its values. The table scrolls within its own region on small screens. Memoized filtering/sorting and bounded pages keep thousands of records from creating thousands of DOM rows. Transform-scaled bars preserve anchors without width reflow.

`MorphingDataExplorerProps`: `data: ExplorerDatum[]`, optional `unit`, `pageSize`, `onSelect`, `state`, `onRetry`. Datum: `id`, `label`, `category`, nullable `value`, optional `previous`.

Example: `<MorphingDataExplorer data={sources} unit="visits" pageSize={12} />`.

Edge handling: no matching rows, all-null values, zero or negative values, nonfinite input values, stale page after filtering, single source, long labels, partial records, and changing representations during sorting. Value nullability is preserved rather than coerced into zero text.

### 04 — MagneticNavigationSystem

**Concept:** Labels respond to proximity while the hit areas remain grounded. Distance controls a bounded force that falls off coherently; selection establishes a stable orbit.

Primary: the destinations. Secondary: the active destination and its nested sections. Quiet: the decorative field lines. A fixed outlined target and focus state advertise interaction. Active orbit/label changes are feedback. Native disclosure and overflow keep nested/long navigation usable.

State: selected destination and nested child ID. Event: `onNavigate(id)`. Native buttons work with touch and keyboard; attraction applies only to mouse input. Motion values and springs avoid React renders on pointer movement. Motion strength is bounded to eight pixels. Long labels wrap; the dock scrolls rather than overflowing. Reduced motion fixes labels in place.

`MagneticNavigationSystemProps`: `items: MagneticNavItem[]`, optional `initialId`, `strength`, `onNavigate`, `state`, `onRetry`. Item: `id`, `label`, `description`, optional icon and child destination records.

Example: `<MagneticNavigationSystem items={destinations} onNavigate={navigate} />`.

Edge handling: no items, missing selected ID, one item, long translations, many destinations, pointer leaving during attraction, touch, high contrast, and resizing.

### 05 — InfiniteContentCanvas

**Concept:** The canvas and readable list are two ways into the same spatial memory. Mobile starts with the list; selecting an idea deliberately enters its place in the canvas.

Primary: the notes and their relationships. Secondary: selection and viewport controls. Quiet: coordinates and minimap. Note shapes and toolbar controls advertise interaction. Selected outlines, snapping, zoom percentage, and selection text acknowledge action. Fit-all, the list, Home, and Escape provide recovery.

State: translation/zoom, selected IDs, position overrides, list mode/page, measured viewport, and an ephemeral pointer gesture. Events: `onSelectionChange(ids)` and `onNodesChange(nodes)`. Native pointer capture supports pan, node drag, and two-finger pinch; releasing one pinch finger returns to pan. Shift adds/removes selection. Arrows pan; plus/minus zoom; Ctrl-arrows move focused notes. Notes snap to the supplied grid. Programmatic focus/fit springs; direct gestures update immediately. Viewport culling limits mounted notes. The minimap samples the first 1,000 objects, while the canvas/list retain access to the full dataset.

`InfiniteContentCanvasProps`: `nodes: CanvasNode[]`, optional `gridSize`, `onSelectionChange`, `onNodesChange`, `state`, `onRetry`. Node: `id`, `title`, `text`, `x`, `y`, optional `color` and `kind`.

Example: `<InfiniteContentCanvas nodes={ideas} onNodesChange={savePositions} />`.

Edge handling: empty canvas, negative coordinates, large datasets, zero/small viewports, pinch cancellation, fast final drag frames, resize, mobile page scrolling, and unmount during capture. Note overlap is allowed deliberately, like paper on a desk; there is no hidden collision solver. Culling is a linear visibility pass; applications with very large datasets can supply a spatially filtered collection.

### 06 — AdaptiveCommandPalette

**Concept:** Intent and consequence share one surface. The command preview explains an action before it runs; the same layer handles arguments, hierarchy, confirmation, success, failure, and reversal.

Primary: the search intention and selected action. Secondary: preview and arguments. Quiet: recents and categories. Search and action controls advertise interaction. Status, errors, and undo show outcomes. Escape backs out of confirmation/hierarchy, then closes and restores focus.

State: open/search/path/selection, argument, confirmation, pending status, result/error, recents, and one undo action. Events: abortable `execute(argument, signal)`, `onExecuted(id)`, and an optional undo result. Commands can be context-scoped. Fuse handles fuzzy search; categories remain visible; recents persist safely. Ctrl/⌘ K toggles the layer; arrows and Enter select/run; Alt shortcuts can execute configured actions. Results are windowed to twelve. A synchronous lock prevents double submission. Closing aborts execution; stale promises cannot replace current feedback.

`AdaptiveCommandPaletteProps`: `commands: PaletteCommand[]`, optional `context`, `initialOpen`, `recentKey`, `onExecuted`, `state`, `onRetry`. Command: `id`, `label`, `category`, `description`, optional `shortcut` (`Alt E` format), `context`, `destructive`, `children`, `argument`, and `execute`. The complete union/result types appear in the source view.

Example: `<AdaptiveCommandPalette commands={commands} context="Note selected" />`.

Edge handling: no results/actions, absent executor, missing required argument, malformed JSON errors, confirmation cancellation, changed context, failed storage, delayed/failed/cancelled execution, and rapid repeated clicks. Application executors must honor the signal before irreversible work; aborting a UI cannot reverse a server mutation already accepted by a backend. Undo errors stay recoverable.

### 07 — ContextualDetailLens

**Concept:** The object becomes its own detail surface. Its illustration stays present as surrounding objects become quiet, expressing a closer view of the same thing.

Primary: the object. Secondary: its expanded sections. Quiet: collection labels. Arrow/close affordances and focus advertise interaction. Expansion and detail sections acknowledge action. Pull back restores the original trigger; errors offer retry.

State: URL-selected ID, hover/focus glimpse, detail section, request result/status, retry count, image failures, and page. Events: `onSelect(id | null)` and optional `loadDetail(id, signal)`. Shared layout changes the selected object's span; small containers unfold vertically. Hover content also appears as ordinary expanded text. Pagination bounds the DOM; deep links automatically open the selected object's page. Requests abort on selection change, retry, or unmount. Image dimensions reserve geometry; failures show local art.

`ContextualDetailLensProps`: `items: LensItem[]`, optional `linkKey`, `pageSize`, `loadDetail`, `onSelect`, `state`, `onRetry`. Item: `id`, `title`, `label`, `summary`, optional `seed`, `image`, and sections (`title`, `body`).

Example: `<ContextualDetailLens items={objects} linkKey="object" loadDetail={fetchDetail} />`.

Edge handling: unknown links, unavailable details, long/nested section content, one object, many pages, missing/broken images, fast selection changes, and a late response from a previously selected object.

### 08 — MultiStageInputLab

**Concept:** Completed decisions condense into the context for the next one. The decision spine stays editable, preserving a user's choices instead of making each step a disposable screen.

Primary: the active decision. Secondary: the completed decision spine. Quiet: draft status. Native fields and one prominent continuation action advertise interaction. Inline validation, saving, busy, and success states show feedback. Back/edit, retry, and local draft restoration provide recovery.

State: typed draft, active step, validation/submission error, pending state, autosave/storage status, connectivity, completion, dirty flag, and abortable execution lock. Events: `onDraftChange(draft)`, `validateName(name, signal)`, required `onSubmit(draft, signal)`. Workspace type controls collaborator and enterprise fields. Labels, legends, field errors, native number/radio/checkbox controls, and step focus transitions support keyboard/readers. A compact horizontal spine replaces the desktop side column. Autosave is debounced 450ms; beforeunload protects unsaved drafts. Saved records are type-checked before restoration. Offline work is allowed; submission waits for connectivity. Completion cancels pending draft saving and clears the draft.

`MultiStageInputLabProps`: optional `draftKey`, `initialDraft`, `validateName`, `onDraftChange`; required `onSubmit`. `ProjectDraft`: `name`, `kind` (`personal | team | enterprise`), `region`, `members`, `private`.

Example: `<MultiStageInputLab draftKey="new-project" onSubmit={createProject} />`.

Edge handling: short name, reserved name, invalid member count, dependent fields, double submission, rejected creation, offline connection, disabled/full storage, corrupt saved JSON, editing during validation, back navigation, and unmount during a request. Reusable submission is injected; the demo stores an actual local project.

### 09 — PhysicalMediaWall

**Concept:** A flexible exhibition hang expresses each medium's material while retaining a shared collection. Selection settles the chosen object and subtly quiets its neighbors.

Primary: media. Secondary: the selected object and viewer. Quiet: captions/type/index. Selection, reorder, and fullscreen controls advertise interaction. Placement changes and an announced reorder acknowledge action. Native Escape, retryable failures, and previous/next provide recovery.

State: ordered IDs, selected/fullscreen ID, page, drag source, swipe start, and per-preview failure. Event: `onReorder(ids)`. Intrinsic flex rows use constrained aspect ratios rather than masonry columns. Phone layouts reflow into one column. Desktop drag and keyboard/touch move buttons share one reorder operation. The viewer uses native dialog focus containment/restoration; arrows and touch swipes navigate. Images lazy-load; media reserve ratio space; video/audio use native controls and metadata preload. Pagination bounds mounted media.

`PhysicalMediaWallProps`: `items: WallMedia[]`, optional `pageSize`, `onReorder`, `state`, `onRetry`. Media: `id`, `title`, `type` (`image | video | audio | document | art`), `caption`, optional `src`, `poster`, `text`, `aspectRatio`, `seed`.

Example: `<PhysicalMediaWall items={collection} onReorder={saveOrder} />`.

Edge handling: absent/broken images, zero/single media, page shrinkage, malformed aspect ratios, added/removed IDs, reorder while selected, unavailable media, very long documents, and fullscreen close/open repetition. Arbitrary remote document URLs are not embedded; provide text or your own document-view integration. The demo has local images, art, text, and playable audio; the reusable API also supports video.

### 10 — TemporalInterface / consequence dial

**Concept, stated before implementation:** Hold a possible future beside a pinned present. Changing a decision bends its consequence field; looking further ahead widens uncertainty. Only explicit commitment moves the present.

This is a causal rehearsal surface, not an event timeline. The primary focus is the relationship between the committed and possible values. Secondary attention is the consequence text; horizon/uncertainty is quiet but readable. Native dials invite exploration. The branches and signed baseline differences provide immediate feedback. Release discards a preview; a bounded history supplies undo.

State: committed allocation, provisional allocation, horizon, ten-entry history, and decision announcement. Events: pure `project(allocation, horizon)`, `onCommit(allocation, horizon)`, `onUndo(allocation)`. Domain logic is injected and separate from the interface. SVG paths interpolate between projections; reduced motion changes them instantly. Labeled sliders work with keyboard and touch; every effect/uncertainty also appears as text. Small screens stack consequence rows rather than shrinking their values.

`TemporalInterfaceProps`: required `project`, optional `initialAllocation`, `decisionLabel`, `onCommit`, `onUndo`. `Consequence`: `label`, `value`, `unit`, `favorable` (`higher | lower`), `uncertainty`.

Example: `<TemporalInterface project={forecast} onCommit={applyDecision} />`.

Edge handling: unchanged decision, no consequences, invalid/nonfinite projection values, negative outcomes, horizon changes, rapid slider input, repeated commit, ten bounded undos, and content/viewport changes. The demo is explicitly illustrative; it does not claim predictive validity.

## Edge-case matrix and limits

| Challenge cases | Architecture |
|---|---|
| 1–3: none, one, thousands | Empty surfaces; bounded controls at sequence ends; timeline/command windows, table/lens/media/list pagination, canvas culling. Whole datasets still require filtering/sorting/ID lookup; no claim of constant-time processing. |
| 4–5, 24–25: long/short text, translation, enlarged fonts | Intrinsic widths, wrapping, min-width:0, stable media ratios, normal-flow long details, independent scroll regions for tables/code. Quiet fixed-size metadata does not carry essential instructions. |
| 6–7: missing/broken assets | Local SVG fallback in lens, explicit unavailable/retry state in viewer, reserved image geometry, font fallbacks. |
| 8–9, 30: slow/failed/late data | Explicit surface states; abortable detail/command/form operations; rejection messages and retry; signal/ownership checks before async state changes. |
| 10–13: rapid clicks/keys/open-close, double submit | Functional state updates, idempotent bounds, synchronous async locks, cancellation, native dialog lifecycle, stable IDs. |
| 14–16, 23: resize/orientation/zoom/mobile viewport | Container queries, intrinsic flow, ResizeObserver, dynamic viewport units, modal max-height scrolling. |
| 17–19: reduced motion, keyboard, readers | Preference-aware springs and static alternatives; native controls; visible focus and recovery; semantic headings/table/form/dialog; live async feedback. |
| 20–22: touch/mouse/trackpad | Stable mouse targets, native scroll rails, pointer capture/pinch, intentional mobile list, Ctrl-wheel zoom, touch reorder controls and viewer swipes. |
| 26–28: dark/light/high contrast | Scoped semantic palettes, system-color contrast mode, explicit focus/selection outlines, text alternatives for visuals. |
| 29: unmount during work | Observer/listener/timer/frame cleanup, aborted requests, guarded promises, native dialog closure and focus restoration when the trigger survives. |

Without JavaScript, the app shows a useful explanation through `<noscript>`. These interactive React components require JavaScript; no server rendering infrastructure exists in this Vite app. Native controls, `<details>`, tables, and static content provide graceful behavior after hydration, but an SSR/no-JS version is not claimed. Automated checks and manual browser review do not establish WCAG certification or exhaustive screen-reader/mobile-Safari coverage.

## Self-review and implemented improvements

These scores are internal judgments, not independently measured certifications. V = visuals, O = originality, U = usability, R = responsiveness, A = accessibility, P = performance, M = motion, B = robustness, API = API quality, Prod = production readiness with application integration.

| Component | V | O | U | R | A | P | M | B | API | Prod |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Command center | 8 | 7 | 8 | 8 | 8 | 8 | 8 | 8 | 8 | 7 |
| Timeline | 8 | 7 | 8 | 8 | 8 | 8 | 8 | 7 | 8 | 7 |
| Data explorer | 8 | 7 | 8 | 8 | 8 | 8 | 7 | 8 | 8 | 7 |
| Magnetic navigation | 8 | 7 | 8 | 8 | 8 | 9 | 8 | 8 | 8 | 8 |
| Canvas | 8 | 7 | 8 | 8 | 7 | 7 | 8 | 8 | 8 | 7 |
| Command palette | 8 | 8 | 8 | 8 | 8 | 8 | 7 | 8 | 8 | 7 |
| Detail lens | 8 | 8 | 8 | 8 | 8 | 8 | 8 | 8 | 8 | 8 |
| Input lab | 8 | 7 | 8 | 8 | 8 | 8 | 7 | 8 | 8 | 7 |
| Media wall | 8 | 7 | 8 | 8 | 8 | 8 | 8 | 8 | 8 | 7 |
| Temporal interface | 8 | 9 | 8 | 8 | 8 | 9 | 8 | 8 | 8 | 7 |

The weakest three during implementation were the canvas, command palette, and input lab. Improvements were made in code before delivery:

- Canvas: committed final drag coordinates synchronously, preventing the last frame from saving a stale position; retained one-finger pan after pinch; replaced spread-based bounds with a reducer; added spring navigation while keeping direct gestures immediate.
- Palette: unique composable ARIA IDs; shortcut close now aborts work and restores focus; absent executors report unavailable instead of fake success; action shortcuts execute; rejected/aborted operations cannot overwrite the active feedback.
- Input lab: validated restored drafts; cancellable validation and synchronous submission lock; unsaved-change protection; storage/offline recovery; pending autosave is cancelled on completion so it cannot resurrect a completed draft.

Additional review fixes: command-center focus restoration waits for the returning overview to mount; completed tasks can be unchecked; the detail lens is paginated and focuses the original trigger on collapse; media arrow controls work immediately from modal focus, and missing previews do not nest buttons inside buttons.

Full implementation is in the ten component source files; each study's Source tab exposes that exact file. See the demo files for complete executable integration examples.

## Verification performed

- `npm run build` passed with strict TypeScript checking and a production Vite build.
- Registry generation passed; exactly ten ChatGPT entries are present and registered.
- All ten studies were checked for page overflow at 320, 375, 430, 768, 1024, 1280, 1440, 1920, and 2560 CSS pixels: 90 checks, no failures.
- Loading, empty, and error/retry previews were exercised for every study.
- Browser interaction checks covered overview/detail focus recovery, timeline URL selection, data search/no-results, nested navigation, canvas selection/focus, command rename/undo/confirmation, lens expansion/deep link, inline form validation/local creation/step focus, media arrows/Escape/focus restoration, and temporal commit/undo.
- Source loading, original-library navigation to ChatGPT, and the dark palette were checked in the browser. No application errors or warnings were observed in these checks.

The existing full-library chunk still triggers Vite's size advisory. The ChatGPT route and each study are split independently, so that library chunk is not required to open this page. Exhaustive device/browser, assistive-technology, and backend integration testing remains application-specific.
