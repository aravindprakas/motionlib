import type { ComponentType } from 'react';
import { LivingCommandCenterDemo, CinematicTimelineDemo, MorphingDataExplorerDemo, MagneticNavigationSystemDemo, InfiniteContentCanvasDemo, AdaptiveCommandPaletteDemo, ContextualDetailLensDemo, MultiStageInputLabDemo, PhysicalMediaWallDemo, TemporalInterfaceDemo } from './chatgpt-catalog';

// Gemini / AURA-10
import KineticFluidGlassCardDemo from '@/components/gemini/kinetic-fluid-glass-card/demo';
import MagneticHolographicCommandPaletteDemo from '@/components/gemini/magnetic-holographic-command-palette/demo';
import QuantumDynamicDataGridDemo from '@/components/gemini/quantum-dynamic-data-grid/demo';
import BiometricParticleAuthSliderDemo from '@/components/gemini/biometric-particle-auth-slider/demo';
import MorphingHyperGlassModalDemo from '@/components/gemini/morphing-hyper-glass-modal/demo';
import InfiniteSpatialDimensionCarouselDemo from '@/components/gemini/infinite-spatial-dimension-carousel/demo';
import ForceGraphDynamicNodeTreeDemo from '@/components/gemini/force-graph-dynamic-node-tree/demo';
import ReactiveAmbientSoundVisualizerDemo from '@/components/gemini/reactive-ambient-sound-visualizer/demo';
import SpatialParallaxNavigationBarDemo from '@/components/gemini/spatial-parallax-navigation-bar/demo';
import KineticMatrixShaderButtonDemo from '@/components/gemini/kinetic-matrix-shader-button/demo';

// Cursor Effects
import CustomCursorDemo from '@/components/cursor-effects/custom-cursor/demo';
import CursorSpotlightDemo from '@/components/cursor-effects/cursor-spotlight/demo';
import SpotlightGridDemo from '@/components/cursor-effects/spotlight-grid/demo';
import LinkImageRevealDemo from '@/components/cursor-effects/link-image-reveal/demo';
import PointerTrailDemo from '@/components/cursor-effects/pointer-trail/demo';

// Magnetic
import MagneticButtonDemo from '@/components/magnetic/magnetic-button/demo';
import MagneticGridDemo from '@/components/magnetic/magnetic-grid/demo';

// Orchestration
import ConductorDemo from '@/components/orchestration/conductor/demo';
import ShockwaveDemo from '@/components/orchestration/shockwave/demo';
import MotionBudgetDemo from '@/components/orchestration/motion-budget/demo';

// Physics
import TetherDemo from '@/components/physics/tether/demo';
import TossFieldDemo from '@/components/physics/toss-field/demo';
import DeformDemo from '@/components/physics/deform/demo';

// Predictive
import IntentFieldDemo from '@/components/predictive/intent-field/demo';

// State Motion
import RewindDemo from '@/components/state-motion/rewind/demo';

// Attention
import AttentionFieldDemo from '@/components/attention/attention-field/demo';
import FocusFlightDemo from '@/components/attention/focus-flight/demo';

// Tilt Cards (3D)
import TiltCardDemo from '@/components/tilt-cards/tilt-card/demo';
import TiltMenuCardsDemo from '@/components/tilt-cards/tilt-menu-cards/demo';

// 3D Turntables
import CylinderCarouselDemo from '@/components/turntables-3d/cylinder-carousel/demo';
import RollingPrismDemo from '@/components/turntables-3d/rolling-prism/demo';

// Carousels & Sliders
import DraggableInertiaSliderDemo from '@/components/carousels/draggable-inertia-slider/demo';
import DragCarouselDemo from '@/components/carousels/drag-carousel/demo';
import CarouselDemo from '@/components/carousels/carousel/demo';
import CoverflowGalleryDemo from '@/components/carousels/coverflow-gallery/demo';
import CinematicCarouselDemo from '@/components/carousels/cinematic-project-carousel/demo';
import ChronoRailDemo from '@/components/carousels/chrono-rail/demo';

// Cinematic Scenes
import CinematicTabsDemo from '@/components/cinematic-scenes/cinematic-tabs/demo';
import CinematicCaseModalDemo from '@/components/cinematic-scenes/cinematic-case-modal/demo';
import CinematicProcessStepsDemo from '@/components/cinematic-scenes/cinematic-process-steps/demo';
import CinematicTeamRosterDemo from '@/components/cinematic-scenes/cinematic-team-roster/demo';
import CinematicTracklistDemo from '@/components/cinematic-scenes/cinematic-tracklist/demo';
import CinematicLocationSwitcherDemo from '@/components/cinematic-scenes/cinematic-location-switcher/demo';
import CinematicVariantStageDemo from '@/components/cinematic-scenes/cinematic-variant-stage/demo';
import CinematicScheduleBoardDemo from '@/components/cinematic-scenes/cinematic-schedule-board/demo';
import Cinematic404Demo from '@/components/cinematic-scenes/cinematic-404/demo';

// Horizontal Scroll
import HorizontalScrollGalleryDemo from '@/components/horizontal-scroll/horizontal-scroll-gallery/demo';
import SsScrollCarouselDemo from '@/components/horizontal-scroll/scroll-linked-carousel/demo';

// Pinned Scroll Scenes
import StackingCardsDemo from '@/components/pinned-scroll/stacking-cards/demo';
import PinnedSceneDemo from '@/components/pinned-scroll/pinned-scene/demo';
import SsStickyFeatureCardsDemo from '@/components/pinned-scroll/sticky-feature-cards/demo';

// Parallax
import ParallaxLayersDemo from '@/components/parallax/parallax-layers/demo';
import ParallaxHeaderDemo from '@/components/parallax/parallax-header/demo';

// Scroll Scrub
import TokenSpectrumDemo from '@/components/scroll-scrub/token-spectrum/demo';
import ScrubCompareDemo from '@/components/scroll-scrub/scrub-compare/demo';
import SsScrollGradientCtaDemo from '@/components/scroll-scrub/scroll-gradient-cta/demo';

// Scroll Nav & Progress
import ScrollRailsDemo from '@/components/scroll-nav/scroll-rails/demo';
import ScrollspyDemo from '@/components/scroll-nav/scrollspy/demo';
import SsSectionNavDemo from '@/components/scroll-nav/section-nav/demo';

// Timelines
import StickyTimelineDemo from '@/components/timelines/sticky-timeline/demo';
import SsScrollTimelineDemo from '@/components/timelines/scroll-timeline/demo';

// Text Effects
import ScrollRevealTextDemo from '@/components/text-effects/scroll-reveal-text/demo';
import TextScrambleDemo from '@/components/text-effects/text-scramble/demo';
import VariableFontMorphDemo from '@/components/text-effects/variable-font-morph/demo';
import TextRollDemo from '@/components/text-effects/text-roll/demo';
import SvgDrawDemo from '@/components/text-effects/svg-draw/demo';
import LetterStaggerDemo from '@/components/text-effects/letter-stagger/demo';
import GradientHeadlineDemo from '@/components/text-effects/gradient-headline/demo';
import ReadingHighlightDemo from '@/components/text-effects/reading-highlight/demo';
import MorphingTextDemo from '@/components/text-effects/morphing-text/demo';
import HighlighterDemo from '@/components/text-effects/highlighter/demo';
import ComicTextDemo from '@/components/text-effects/comic-text/demo';
import LightRaysDemo from '@/components/canvas-generative/light-rays/demo';
import InteractiveHoverButtonDemo from '@/components/buttons/interactive-hover-button/demo';
// Commerce Effects
import CollectionShowcase from '@/components/commerce/CollectionShowcase';
import SwatchWipeDemo from '@/components/commerce/swatch-wipe/demo';
import ZoomLoupeDemo from '@/components/commerce/zoom-loupe/demo';
import ShelfLiftDemo from '@/components/commerce/shelf-lift/demo';
import SplitFlapETADemo from '@/components/commerce/split-flap-eta/demo';
import StockErosionDemo from '@/components/commerce/stock-erosion/demo';
import ThresholdRuleDemo from '@/components/commerce/threshold-rule/demo';
import DimensionRuleDemo from '@/components/commerce/dimension-rule/demo';
import PriceDropGhostDemo from '@/components/commerce/price-drop-ghost/demo';
import CondenseBuyBarDemo from '@/components/commerce/condense-buy-bar/demo';
import BundleTallyDemo from '@/components/commerce/bundle-tally/demo';
import LightingTruthDemo from '@/components/commerce/lighting-truth/demo';
import PriceHistorySparkDemo from '@/components/commerce/price-history-spark/demo';
import SpecDiffDemo from '@/components/commerce/spec-diff/demo';
import ReceiptUnrollDemo from '@/components/commerce/receipt-unroll/demo';
import InTheBoxDemo from '@/components/commerce/in-the-box/demo';
import SpecPinsDemo from '@/components/commerce/spec-pins/demo';
import QuantityResistDemo from '@/components/commerce/quantity-resist/demo';
import SaveCreaseDemo from '@/components/commerce/save-crease/demo';
import CadenceDialDemo from '@/components/commerce/cadence-dial/demo';
import CostPerWearDemo from '@/components/commerce/cost-per-wear/demo';

// Embroidery
import StitchRevealDemo from '@/components/embroidery/stitch-reveal/demo';
import ThreadPathDemo from '@/components/embroidery/thread-path/demo';
import DigitizePassDemo from '@/components/embroidery/digitize-pass/demo';
import HoopStageDemo from '@/components/embroidery/hoop-stage/demo';
import ThreadDrawerDemo from '@/components/embroidery/thread-drawer/demo';
import StitchTimelineDemo from '@/components/embroidery/stitch-timeline/demo';
import StitchProgressDemo from '@/components/embroidery/stitch-progress/demo';
import StitchEstimatorDemo from '@/components/embroidery/stitch-estimator/demo';
import SwatchBookDemo from '@/components/embroidery/swatch-book/demo';
import RepeatFieldDemo from '@/components/embroidery/repeat-field/demo';

// Expedition
import ExpeditionOpeningDemo from '@/components/expedition/expedition-opening/demo';
import ArtifactCatalogDemo from '@/components/expedition/artifact-catalog/demo';
import ArtifactScannerDemo from '@/components/expedition/artifact-scanner/demo';
import ExpeditionMapDemo from '@/components/expedition/expedition-map/demo';
import RestorationLabDemo from '@/components/expedition/restoration-lab/demo';
import FieldNotesDemo from '@/components/expedition/field-notes/demo';
import SpecimenComparisonDemo from '@/components/expedition/specimen-comparison/demo';
import MaterialVaultDemo from '@/components/expedition/material-vault/demo';
import AcquisitionDeskDemo from '@/components/expedition/acquisition-desk/demo';
import CollectionVaultDemo from '@/components/expedition/collection-vault/demo';


// Entrance Reveals
import RevealDemo from '@/components/reveal-entrance/reveal/demo';
import ClipPathRevealDemo from '@/components/reveal-entrance/clip-path-reveal/demo';
import MasonryRevealDemo from '@/components/reveal-entrance/masonry-reveal/demo';
import SsSplitRevealDemo from '@/components/reveal-entrance/split-reveal-section/demo';

// Marquee & Tickers
import VelocityMarqueeDemo from '@/components/marquee-ticker/velocity-marquee/demo';
import VerticalTickerDemo from '@/components/marquee-ticker/vertical-ticker/demo';
import TagCloudDemo from '@/components/marquee-ticker/tag-cloud/demo';

// Counters & Numbers
import StatCountersDemo from '@/components/counters/stat-counters/demo';
import OdometerDemo from '@/components/counters/odometer/demo';
import SsAnimatedCountersDemo from '@/components/counters/animated-counters/demo';

// Canvas & Generative
import AuroraBackgroundDemo from '@/components/canvas-generative/aurora-background/demo';
import ParticleFieldDemo from '@/components/canvas-generative/particle-field/demo';
import GooeyBlobDemo from '@/components/canvas-generative/gooey-blob/demo';
import WaveBarsDemo from '@/components/canvas-generative/wave-bars/demo';
import RippleGridDemo from '@/components/canvas-generative/ripple-grid/demo';
import ConfettiBurstDemo from '@/components/canvas-generative/confetti-burst/demo';
import GenerativeMeshDemo from '@/components/canvas-generative/generative-mesh/demo';

// Grids & Bento
import BentoGridDemo from '@/components/grids/bento-grid/demo';
import FlipFilterGridDemo from '@/components/grids/flip-filter-grid/demo';
import BentoWorkspaceDemo from '@/components/grids/magnetic-bento-workspace/demo';
import SsBentoGridRevealDemo from '@/components/grids/bento-grid-reveal/demo';

// Cards
import CategoryRowDemo from '@/components/cards/category-row/demo';
import FlipMenuCardsDemo from '@/components/cards/flip-menu-cards/demo';

// Micro Interactions
import HoldToConfirmButtonDemo from '@/components/micro-interactions/hold-to-confirm-button/demo';
import MorphingSubmitButtonDemo from '@/components/micro-interactions/morphing-submit-button/demo';
import ShredDeleteButtonDemo from '@/components/micro-interactions/shred-delete-button/demo';
import ReactionButtonDemo from '@/components/micro-interactions/reaction-button/demo';
import SquishToggleDemo from '@/components/micro-interactions/squish-toggle/demo';
import ElasticRangeSliderDemo from '@/components/micro-interactions/elastic-range-slider/demo';
import WaveVolumeSliderDemo from '@/components/micro-interactions/wave-volume-slider/demo';
import SwipeToConfirmDemo from '@/components/micro-interactions/swipe-to-confirm/demo';
import DialKnobDemo from '@/components/micro-interactions/dial-knob/demo';
import ScrubNumberInputDemo from '@/components/micro-interactions/scrub-number-input/demo';
import PinCodeInputDemo from '@/components/micro-interactions/pin-code-input/demo';
import InkCheckboxDemo from '@/components/micro-interactions/ink-checkbox/demo';
import GooeySegmentedControlDemo from '@/components/micro-interactions/gooey-segmented-control/demo';
import PeelStickerDemo from '@/components/micro-interactions/peel-sticker/demo';
import SonarBadgeBellDemo from '@/components/micro-interactions/sonar-badge-bell/demo';
import GlimpseDemo from '@/components/micro-interactions/glimpse/demo';

// Buttons
import ButtonsDemo from '@/components/buttons/buttons/demo';
import CopyButtonDemo from '@/components/buttons/copy-button/demo';
import LiquidGlassButtonDemo from '@/components/buttons/liquid-glass-button/demo';

// Forms & Inputs
import FieldsDemo from '@/components/forms-inputs/fields/demo';
import SelectableCardDemo from '@/components/forms-inputs/selectable-card/demo';
import StarRatingDemo from '@/components/forms-inputs/star-rating/demo';
import ConversationalFormDemo from '@/components/forms-inputs/conversational-form/demo';
import FileDropzoneDemo from '@/components/forms-inputs/file-dropzone/demo';
import DropdownDemo from '@/components/forms-inputs/dropdown/demo';
import ConsensusRatingDemo from '@/components/forms-inputs/consensus-rating/demo';

// Navigation & Menus
import RadialMenuDemo from '@/components/navigation/radial-menu/demo';
import HeaderDemo from '@/components/navigation/header/demo';
import NavigationDockDemo from '@/components/navigation/liquid-navigation-dock/demo';
import StrataTreeDemo from '@/components/navigation/strata-tree/demo';
import ShapeShiftTabsDemo from '@/components/navigation/shapeshift-tabs/demo';
import FisheyePagerDemo from '@/components/navigation/fisheye-pager/demo';

// Overlays
import CommandCenterDemo from '@/components/overlays/kinetic-command-center/demo';
import SatellitePopoverDemo from '@/components/overlays/satellite-popover/demo';

// Accordions & FAQ
import FaqDemo from '@/components/accordions/faq/demo';
import SsAccordionFaqDemo from '@/components/accordions/accordion-faq/demo';
import TideAccordionDemo from '@/components/accordions/tide-accordion/demo';

// Decorative UI
import CornerMarksDemo from '@/components/decor/corner-marks/demo';
import ThemeToggleDemo from '@/components/decor/theme-toggle/demo';
import RotatingRingDemo from '@/components/decor/rotating-ring/demo';

// Data Viz
import AnalyticsExplorerDemo from '@/components/data-viz/morphing-analytics-explorer/demo';
import ConstellationDemo from '@/components/data-viz/spatial-testimonial-constellation/demo';

// Heroes & Intros
import CurtainPageTransitionDemo from '@/components/heroes-intro/curtain-page-transition/demo';
import HeroDemo from '@/components/heroes-intro/hero/demo';
import LoadingScreenDemo from '@/components/heroes-intro/loading-screen/demo';

// Page Sections
import PullQuoteDemo from '@/components/page-sections/pull-quote/demo';
import FooterDemo from '@/components/page-sections/footer/demo';
import ChorusQuoteDemo from '@/components/page-sections/chorus-quote/demo';

// Interactive Showcase
import ProjectsDemo from '@/components/interactive-showcase/projects/demo';
import FloorPlanPickerDemo from '@/components/interactive-showcase/floor-plan-picker/demo';
import SpotlightPodiumDemo from '@/components/interactive-showcase/spotlight-podium/demo';
import PricingConfiguratorDemo from '@/components/interactive-showcase/intelligent-pricing-configurator/demo';
import AiResponseDemo from '@/components/interactive-showcase/living-ai-response/demo';

// App Shell
import ShellHeaderDemo from '@/components/app-shell/shell-header/demo';
import ShellHeroDemo from '@/components/app-shell/shell-hero/demo';
import ShellBentoGridDemo from '@/components/app-shell/shell-bento-grid/demo';
import ShellDataCardDemo from '@/components/app-shell/shell-data-card/demo';
import ShellSidebarDemo from '@/components/app-shell/shell-sidebar/demo';
import ShellDataTableDemo from '@/components/app-shell/shell-data-table/demo';
import ShellPopoverDemo from '@/components/app-shell/shell-popover/demo';
import ShellPrimaryButtonDemo from '@/components/app-shell/shell-primary-button/demo';
import ShellModalDemo from '@/components/app-shell/shell-modal/demo';
import ShellFooterDemo from '@/components/app-shell/shell-footer/demo';

export interface RegistryEntry {
  id: string;
  name: string;
  description: string;
  tags: string[];
  Demo: ComponentType;
}

export interface RegistryCategory {
  key: string;
  label: string;
  entries: RegistryEntry[];
}

/**
 * Single source of truth for the preview app, grouped by *similarity family*
 * (what a component looks like / how it works) rather than by type. Adding a
 * component = new folder under src/components/<group>/ + one entry here.
 * Sidebar, arrow-key nav and the stage all derive from this.
 */
export const registry: RegistryCategory[] = [
  {
    key: 'chatgpt',
    label: 'ChatGPT — Interaction Studies',
    entries: [
      { id: 'living-command-center', name: 'LivingCommandCenter', description: 'A spatial workspace that docks, floats and opens around attention.', tags: ['layout', 'spring', 'focus'], Demo: LivingCommandCenterDemo },
      { id: 'cinematic-timeline', name: 'CinematicTimeline', description: 'A windowed narrative rail with a dominant frame and deep links.', tags: ['scroll', 'windowing', 'keyboard'], Demo: CinematicTimelineDemo },
      { id: 'morphing-data-explorer', name: 'MorphingDataExplorer', description: 'Stable data anchors across table, chart, metric and distribution views.', tags: ['data', 'transform', 'table'], Demo: MorphingDataExplorerDemo },
      { id: 'magnetic-navigation-system', name: 'MagneticNavigationSystem', description: 'Distance-aware labels inside steady navigation targets.', tags: ['proximity', 'motion values', 'nested'], Demo: MagneticNavigationSystemDemo },
      { id: 'infinite-content-canvas', name: 'InfiniteContentCanvas', description: 'A culled pan-and-zoom canvas with snapping, selection and a mobile list.', tags: ['pointer', 'canvas', 'pinch'], Demo: InfiniteContentCanvasDemo },
      { id: 'adaptive-command-palette', name: 'AdaptiveCommandPalette', description: 'Contextual fuzzy commands with previews, arguments, confirmation and undo.', tags: ['fuzzy search', 'async', 'undo'], Demo: AdaptiveCommandPaletteDemo },
      { id: 'contextual-detail-lens', name: 'ContextualDetailLens', description: 'Objects unfold into their own deep-linked detail surfaces.', tags: ['layout', 'detail', 'abort'], Demo: ContextualDetailLensDemo },
      { id: 'multi-stage-input-lab', name: 'MultiStageInputLab', description: 'Completed choices condense into a decision spine around an autosaved form.', tags: ['form', 'draft', 'async'], Demo: MultiStageInputLabDemo },
      { id: 'physical-media-wall', name: 'PhysicalMediaWall', description: 'A flexible exhibition hang with native media, reorder and fullscreen.', tags: ['media', 'dialog', 'reorder'], Demo: PhysicalMediaWallDemo },
      { id: 'temporal-interface', name: 'TemporalInterface', description: 'A pinned present and a provisional field of consequences you can commit or undo.', tags: ['causality', 'svg', 'forecast'], Demo: TemporalInterfaceDemo },
    ],
  },
  {
    key: 'gemini',
    label: 'Gemini / AURA-10',
    entries: [
      { id: 'kinetic-fluid-glass-card', name: 'Kinetic Fluid Glass Card', description: 'Velocity-reactive fluid shader, spring tilt and pointer-driven glass reflections.', tags: ['webgl', 'spring', 'pointer'], Demo: KineticFluidGlassCardDemo },
      { id: 'magnetic-holographic-command-palette', name: 'Magnetic Holographic Command Palette', description: 'Magnetic dock and searchable keyboard command dialog with contained long titles.', tags: ['magnetic', 'dialog', 'keyboard'], Demo: MagneticHolographicCommandPaletteDemo },
      { id: 'quantum-dynamic-data-grid', name: 'Quantum Dynamic Data Grid', description: 'Sortable signals, sparklines, dynamic column visibility and page scrubbing.', tags: ['table', 'sort', 'sparkline'], Demo: QuantumDynamicDataGridDemo },
      { id: 'biometric-particle-auth-slider', name: 'Biometric Particle Auth Slider', description: 'Velocity-aware drag verification with a particle field and keyboard completion.', tags: ['drag', 'particles', 'slider'], Demo: BiometricParticleAuthSliderDemo },
      { id: 'morphing-hyper-glass-modal', name: 'Morphing Hyper-Glass Modal', description: 'A fluid glass dialog growing from its trigger with focus containment and scroll locking.', tags: ['dialog', 'spring', 'glass'], Demo: MorphingHyperGlassModalDemo },
      { id: 'infinite-spatial-dimension-carousel', name: 'Infinite Spatial Dimension Carousel', description: 'An infinite perspective rail with depth falloff, drag inertia and stable item identities.', tags: ['3d', 'drag', 'inertia'], Demo: InfiniteSpatialDimensionCarouselDemo },
      { id: 'force-graph-dynamic-node-tree', name: 'Force-Graph Dynamic Node Tree', description: 'Elastic SVG tendons, draggable nodes, spatial collision hashing and an adaptive camera.', tags: ['physics', 'svg', 'tree'], Demo: ForceGraphDynamicNodeTreeDemo },
      { id: 'reactive-ambient-sound-visualizer', name: 'Reactive Ambient Sound Visualizer', description: 'Refracted spectrum waves driven by synthetic frequencies or a local audio file.', tags: ['canvas', 'web audio', 'spectrum'], Demo: ReactiveAmbientSoundVisualizerDemo },
      { id: 'spatial-parallax-navigation-bar', name: 'Spatial Parallax Navigation Bar', description: 'Spring-tracked liquid navigation that compresses on scroll and observes dynamic links.', tags: ['navigation', 'spring', 'resize'], Demo: SpatialParallaxNavigationBarDemo },
      { id: 'kinetic-matrix-shader-button', name: 'Kinetic Matrix Shader Button', description: 'Fluid shader, resolving text scramble, pressure response and particle release burst.', tags: ['webgl', 'scramble', 'pressure'], Demo: KineticMatrixShaderButtonDemo },
    ],
  },
  {
    key: 'cursor-effects',
    label: 'Cursor Effects',
    entries: [
      { id: 'custom-cursor', name: 'CustomCursor', description: 'Lerping blend-mode cursor that grows over [data-cursor] targets.', tags: ['pointer', 'rAF lerp', 'blend'], Demo: CustomCursorDemo },
      { id: 'cursor-spotlight', name: 'CursorSpotlight', description: 'Blurred accent blob that eases toward the cursor in a dark panel.', tags: ['pointer', 'rAF lerp'], Demo: CursorSpotlightDemo },
      { id: 'spotlight-grid', name: 'SpotlightGrid', description: 'Radial spotlight + border glow tracking the pointer via CSS vars.', tags: ['pointer', 'css vars'], Demo: SpotlightGridDemo },
      { id: 'link-image-reveal', name: 'LinkImageReveal', description: 'Links that float a trailing preview plate under the cursor.', tags: ['pointer', 'rAF lerp'], Demo: LinkImageRevealDemo },
      { id: 'pointer-trail', name: 'PointerTrail', description: 'Cursor drops a fading, rotating trail of token chips.', tags: ['pointer', 'gsap', 'pooling'], Demo: PointerTrailDemo },
    ],
  },
  {
    key: 'magnetic',
    label: 'Magnetic',
    entries: [
      { id: 'magnetic-button', name: 'MagneticButton', description: 'Cursor-attracted button with elastic spring return.', tags: ['pointer', 'gsap quickTo'], Demo: MagneticButtonDemo },
      { id: 'magnetic-grid', name: 'MagneticGrid', description: 'Tile grid that leans toward the cursor with 3D depth tilt.', tags: ['pointer', 'gsap quickTo', '3d'], Demo: MagneticGridDemo },
    ],
  },
  {
    key: 'orchestration',
    label: 'Orchestration',
    entries: [
      { id: 'conductor', name: 'Conductor', description: 'One rAF clock for a whole subtree; children animate by beat and phase, never by their own timer.', tags: ['clock', 'phase', 'zero re-render'], Demo: ConductorDemo },
      { id: 'shockwave', name: 'Shockwave', description: 'A front that crosses the layout at px/s, so the stagger is distance from the strike, not list index.', tags: ['spatial stagger', 'css vars', 'rAF'], Demo: ShockwaveDemo },
      { id: 'motion-budget', name: 'MotionBudget', description: 'Concurrency ceiling for animation: elements queue for a slot by priority instead of all firing at once.', tags: ['scheduler', 'queue', 'priority'], Demo: MotionBudgetDemo },
    ],
  },
  {
    key: 'physics',
    label: 'Physics',
    entries: [
      { id: 'tether', name: 'TetherField', description: 'Verlet rope hung between two DOM anchors — sags, whips, goes taut and swings past the mark.', tags: ['verlet', 'svg', 'solver'], Demo: TetherDemo },
      { id: 'toss-field', name: 'TossField', description: 'Bounded field whose children can be grabbed and thrown; release keeps the pointer velocity.', tags: ['drag', 'inertia', 'collision'], Demo: TossFieldDemo },
      { id: 'deform', name: 'Deform', description: 'Squash and stretch derived from an element watching its own movement, whatever moved it.', tags: ['self-measuring', 'squash', 'rAF'], Demo: DeformDemo },
    ],
  },
  {
    key: 'predictive',
    label: 'Predictive',
    entries: [
      { id: 'intent-field', name: 'IntentField', description: 'Scores targets by pointer trajectory and commits before contact — leans in, and prefetches early.', tags: ['trajectory', 'prefetch', 'css vars'], Demo: IntentFieldDemo },
    ],
  },
  {
    key: 'state-motion',
    label: 'State Motion',
    entries: [
      { id: 'rewind', name: 'Rewind', description: 'State keeps a frame history you can scrub; the layout FLIPs backwards through it instead of cutting.', tags: ['history', 'flip', 'scrub'], Demo: RewindDemo },
    ],
  },
  {
    key: 'attention',
    label: 'Attention',
    entries: [
      { id: 'attention-field', name: 'AttentionField', description: 'Idle time, tab visibility and viewport collapsed into --attention and --breath, inherited by every child.', tags: ['idle', 'presence', 'css vars'], Demo: AttentionFieldDemo },
      { id: 'focus-flight', name: 'FocusFlight', description: 'One ring that flies between focused elements and takes the shape of each; keyboard focus stops teleporting.', tags: ['focus', 'a11y', 'waapi'], Demo: FocusFlightDemo },
    ],
  },
  {
    key: 'tilt-cards',
    label: 'Tilt Cards (3D)',
    entries: [
      { id: 'tilt-card', name: 'TiltCard', description: '3D pointer tilt with parallax depth layers and glare.', tags: ['framer', 'springs', 'css 3d'], Demo: TiltCardDemo },
      { id: 'tilt-menu-cards', name: 'TiltMenuCards', description: 'Row of 3D tilt cards with a pointer-tracked glare and translateZ depth planes.', tags: ['pointer', 'css 3d', 'glare'], Demo: TiltMenuCardsDemo },
    ],
  },
  {
    key: 'turntables-3d',
    label: '3D Turntables',
    entries: [
      { id: 'cylinder-carousel', name: 'CylinderCarousel', description: 'Panels on a draggable rotating 3D cylinder that snaps to the nearest face.', tags: ['pointer', 'css 3d', 'drag'], Demo: CylinderCarouselDemo },
      { id: 'rolling-prism', name: 'RollingPrism', description: 'Four-face prism that rolls on its X axis like a split-flap sign.', tags: ['css 3d', 'prism'], Demo: RollingPrismDemo },
    ],
  },
  {
    key: 'carousels',
    label: 'Carousels & Sliders',
    entries: [
      { id: 'draggable-inertia-slider', name: 'DraggableInertiaSlider', description: 'Infinite drag slider with hand-rolled momentum and snap.', tags: ['framer', 'inertia'], Demo: DraggableInertiaSliderDemo },
      { id: 'drag-carousel', name: 'DragCarousel', description: 'Drag carousel with momentum + snap on headless embla.', tags: ['embla'], Demo: DragCarouselDemo },
      { id: 'carousel', name: 'Carousel', description: 'Center-scale carousel that auto-advances; the active card grows.', tags: ['gsap', 'autoplay'], Demo: CarouselDemo },
      { id: 'coverflow-gallery', name: 'CoverflowGallery', description: 'Coverflow whose side covers recede and angle away in 3D; click one to the front.', tags: ['css 3d', 'gallery'], Demo: CoverflowGalleryDemo },
      { id: 'cinematic-project-carousel', name: 'CinematicProjectCarousel', description: 'Full-bleed project carousel with a choreographed clip-path slice reveal; drag or arrows.', tags: ['framer', 'clip-path', 'drag'], Demo: CinematicCarouselDemo },
      { id: 'chrono-rail', name: 'ChronoRail', description: 'Carousel whose axis is real elapsed time — quiet years read as empty rail, busy months shingle into a deck.', tags: ['time axis', 'drag', 'container query'], Demo: ChronoRailDemo },
    ],
  },
  {
    key: 'cinematic-scenes',
    label: 'Cinematic Scenes',
    entries: [
      { id: 'cinematic-tabs', name: 'CinematicTabs', description: 'Capability tabs whose panels wipe directionally with masked headlines and delayed meta.', tags: ['framer', 'clip-path', 'tabs'], Demo: CinematicTabsDemo },
      { id: 'cinematic-case-modal', name: 'CinematicCaseModal', description: 'Case-file tiles that expand into a full-stage study behind a choreographed wipe; Esc to close.', tags: ['framer', 'clip-path', 'modal'], Demo: CinematicCaseModalDemo },
      { id: 'cinematic-process-steps', name: 'CinematicProcessSteps', description: 'Four-phase process walkthrough wiping vertically between stages, with ghost numerals and a filling rail.', tags: ['framer', 'clip-path', 'stepper'], Demo: CinematicProcessStepsDemo },
      { id: 'cinematic-team-roster', name: 'CinematicTeamRoster', description: 'Roster list where hovering a name wipes the monogram portrait stage to that member.', tags: ['framer', 'clip-path', 'hover'], Demo: CinematicTeamRosterDemo },
      { id: 'cinematic-tracklist', name: 'CinematicTracklist', description: 'Tracklist driving a now-playing stage: per-track wipes, live EQ bars and a ticking timecode.', tags: ['framer', 'clip-path', 'audio ui'], Demo: CinematicTracklistDemo },
      { id: 'cinematic-location-switcher', name: 'CinematicLocationSwitcher', description: 'Studio cities with live local clocks; the stage wipes between time zones.', tags: ['framer', 'clip-path', 'clock'], Demo: CinematicLocationSwitcherDemo },
      { id: 'cinematic-variant-stage', name: 'CinematicVariantStage', description: 'Product colourway configurator whose stage wipes per swatch while the spec sheet restaggers.', tags: ['framer', 'clip-path', 'variants'], Demo: CinematicVariantStageDemo },
      { id: 'cinematic-schedule-board', name: 'CinematicScheduleBoard', description: "Festival program where each day's set times slice in on a stagger; arrow keys change day.", tags: ['framer', 'clip-path', 'stagger'], Demo: CinematicScheduleBoardDemo },
      { id: 'cinematic-404', name: 'Cinematic404', description: 'Error page assembling 404 from offset slices with a scrambling status line and masked exit links.', tags: ['framer', 'clip-path', 'scramble'], Demo: Cinematic404Demo },
    ],
  },
  {
    key: 'horizontal-scroll',
    label: 'Horizontal Scroll',
    entries: [
      { id: 'horizontal-scroll-gallery', name: 'HorizontalScrollGallery', description: 'Pinned section mapping vertical scroll to horizontal travel.', tags: ['gsap', 'pin', 'scrub'], Demo: HorizontalScrollGalleryDemo },
      { id: 'ss-scroll-carousel', name: 'ScrollLinkedCarousel', description: 'Pinned testimonial track driven horizontally by scroll, with live progress dots.', tags: ['gsap', 'pin', 'scrub'], Demo: SsScrollCarouselDemo },
    ],
  },
  {
    key: 'pinned-scroll',
    label: 'Pinned Scroll Scenes',
    entries: [
      { id: 'stacking-cards', name: 'StackingCards', description: 'Pinned cards that stack, scale and dim on scroll.', tags: ['gsap', 'pin', 'scrub'], Demo: StackingCardsDemo },
      { id: 'pinned-scene', name: 'PinnedScene', description: 'Pinned panel whose steps cross-fade as you scroll through.', tags: ['gsap', 'pin', 'scrub'], Demo: PinnedSceneDemo },
      { id: 'ss-sticky-feature-cards', name: 'StickyFeatureCards', description: 'Pinned stack of feature cards that slide up and over one another as you scroll.', tags: ['gsap', 'pin', 'timeline'], Demo: SsStickyFeatureCardsDemo },
    ],
  },
  {
    key: 'parallax',
    label: 'Parallax',
    entries: [
      { id: 'parallax-layers', name: 'ParallaxLayers', description: 'Layers translating at different depths on scroll scrub.', tags: ['gsap', 'scrub'], Demo: ParallaxLayersDemo },
      { id: 'parallax-header', name: 'ParallaxHeader', description: 'Sticky wordmark header that parallaxes out on scroll.', tags: ['scroll', 'sticky'], Demo: ParallaxHeaderDemo },
    ],
  },
  {
    key: 'scroll-scrub',
    label: 'Scroll Scrub',
    entries: [
      { id: 'token-spectrum', name: 'TokenSpectrum', description: 'Panel whose background eases across the accent ramp on scroll.', tags: ['gsap', 'scrub', 'color'], Demo: TokenSpectrumDemo },
      { id: 'scrub-compare', name: 'ScrubCompare', description: 'Before/after wipe driven entirely by scroll progress.', tags: ['gsap', 'scrub', 'clip-path'], Demo: ScrubCompareDemo },
      { id: 'ss-scroll-gradient-cta', name: 'ScrollGradientCTA', description: 'Full-bleed CTA whose gradient shifts on scroll, with a magnetic primary button.', tags: ['gsap', 'scrub', 'pointer'], Demo: SsScrollGradientCtaDemo },
    ],
  },
  {
    key: 'scroll-nav',
    label: 'Scroll Nav & Progress',
    entries: [
      { id: 'scroll-rails', name: 'ScrollRails', description: 'Fixed side rails with vertical labels and a live scroll-percentage readout.', tags: ['scroll', 'decoration'], Demo: ScrollRailsDemo },
      { id: 'scrollspy', name: 'Scrollspy', description: 'Sticky nav whose marker slides to the section in view.', tags: ['gsap', 'scrolltrigger', 'nav'], Demo: ScrollspyDemo },
      { id: 'ss-section-nav', name: 'SectionNav', description: 'Fixed dot navigation that tracks the section in view via ScrollTrigger and smooth-scrolls on click.', tags: ['gsap', 'scrolltrigger', 'nav'], Demo: SsSectionNavDemo },
    ],
  },
  {
    key: 'timelines',
    label: 'Timelines',
    entries: [
      { id: 'sticky-timeline', name: 'StickyTimeline', description: 'Editorial timeline whose accent spine fills as you scroll past.', tags: ['gsap', 'scrub', 'editorial'], Demo: StickyTimelineDemo },
      { id: 'ss-scroll-timeline', name: 'ScrollTimeline', description: 'Vertical timeline whose accent spine fills with scroll while milestones slide in.', tags: ['gsap', 'scrub', 'timeline'], Demo: SsScrollTimelineDemo },
    ],
  },
  {
    key: 'text-effects',
    label: 'Text Effects',
    entries: [
      { id: 'scroll-reveal-text', name: 'ScrollRevealText', description: 'Masked word/char reveal, staggered on viewport entry.', tags: ['gsap', 'scrolltrigger'], Demo: ScrollRevealTextDemo },
      { id: 'text-scramble', name: 'TextScramble', description: 'Characters cycle through glyphs before resolving, on view or hover.', tags: ['rAF', 'text fx'], Demo: TextScrambleDemo },
      { id: 'variable-font-morph', name: 'VariableFontMorph', description: 'Font weight + tracking morph mapped to scroll progress.', tags: ['gsap', 'variable font'], Demo: VariableFontMorphDemo },
      { id: 'text-roll', name: 'TextRoll', description: 'Per-character roll on hover: the top rolls up as the bottom rolls in.', tags: ['framer', 'hover'], Demo: TextRollDemo },
      { id: 'svg-draw', name: 'SvgDraw', description: 'Self-drawing SVG wordmark via animated stroke dashoffset on view.', tags: ['gsap', 'svg', 'stroke'], Demo: SvgDrawDemo },
      { id: 'letter-stagger', name: 'LetterStagger', description: 'Headline that assembles itself glyph-by-glyph on a stagger.', tags: ['gsap', 'scrolltrigger', 'text'], Demo: LetterStaggerDemo },
      { id: 'gradient-headline', name: 'GradientHeadline', description: 'Oversized headline with the token gradient scrubbing inside the letters.', tags: ['gsap', 'scrub', 'bg-clip'], Demo: GradientHeadlineDemo },
      { id: 'reading-highlight', name: 'ReadingHighlight', description: 'Words ignite in turn as a reading head scrubs through the sentence.', tags: ['gsap', 'scrub', 'text'], Demo: ReadingHighlightDemo },
      { id: 'morphing-text', name: 'MorphingText', description: 'Words melt into one another through an SVG goo filter on a looping cycle.', tags: ['rAF', 'svg filter', 'text fx'], Demo: MorphingTextDemo },
      { id: 'highlighter', name: 'Highlighter', description: 'Hand-drawn marker annotations — highlight, underline, box, circle, strike — that draw in on view.', tags: ['svg', 'io', 'annotation'], Demo: HighlighterDemo },
      { id: 'comic-text', name: 'ComicText', description: 'Halftone comic lettering with stacked ink outlines and a springy pop-in.', tags: ['svg', 'halftone', 'text fx'], Demo: ComicTextDemo },
    ],
  },
  {
    key: 'reveal-entrance',
    label: 'Entrance Reveals',
    entries: [
      { id: 'reveal', name: 'Reveal & Blink', description: 'One-shot fade-up on first view, plus a slow idle blink.', tags: ['io', 'css'], Demo: RevealDemo },
      { id: 'clip-path-reveal', name: 'ClipPathReveal', description: 'Directional clip-path curtain wipe on viewport entry.', tags: ['gsap', 'clip-path'], Demo: ClipPathRevealDemo },
      { id: 'masonry-reveal', name: 'MasonryReveal', description: 'Masonry tiles uncrop on a staggered clip-path reveal.', tags: ['gsap', 'clip-path', 'grid'], Demo: MasonryRevealDemo },
      { id: 'ss-split-reveal', name: 'SplitRevealSection', description: 'Split layout where a clip-path image wipes open and text lines stagger in on view.', tags: ['gsap', 'clip-path', 'stagger'], Demo: SsSplitRevealDemo },
    ],
  },
  {
    key: 'marquee-ticker',
    label: 'Marquee & Tickers',
    entries: [
      { id: 'velocity-marquee', name: 'VelocityMarquee', description: 'Infinite marquee driven by scroll velocity and direction.', tags: ['framer', 'useVelocity'], Demo: VelocityMarqueeDemo },
      { id: 'vertical-ticker', name: 'VerticalTicker', description: 'Infinite vertical news ticker; pauses on hover and off-screen.', tags: ['rAF', 'loop'], Demo: VerticalTickerDemo },
      { id: 'tag-cloud', name: 'TagCloud', description: 'Tags drifting on individual sine orbits; paused off-screen.', tags: ['rAF', 'ambient'], Demo: TagCloudDemo },
    ],
  },
  {
    key: 'counters',
    label: 'Counters & Numbers',
    entries: [
      { id: 'stat-counters', name: 'StatCounters', description: 'Scroll progress bar + count-up stats on first view.', tags: ['io', 'rAF'], Demo: StatCountersDemo },
      { id: 'odometer', name: 'Odometer', description: 'Rolling-digit counter where each column spins into place on view.', tags: ['gsap', 'scrolltrigger'], Demo: OdometerDemo },
      { id: 'ss-animated-counters', name: 'AnimatedCounters', description: 'Stat cards that count up with an eased ramp the first time they enter the viewport.', tags: ['io', 'rAF', 'count-up'], Demo: SsAnimatedCountersDemo },
    ],
  },
  {
    key: 'canvas-generative',
    label: 'Canvas & Generative',
    entries: [
      { id: 'aurora-background', name: 'AuroraBackground', description: 'WebGL domain-warped aurora with a breathing core; static disc fallback.', tags: ['webgl', 'three', 'shader'], Demo: AuroraBackgroundDemo },
      { id: 'particle-field', name: 'ParticleField', description: 'Cursor-reactive canvas field of drifting linked dots, warping mesh or ascii.', tags: ['canvas', 'pointer', 'rAF'], Demo: ParticleFieldDemo },
      { id: 'gooey-blob', name: 'GooeyBlob', description: 'Organic blob morphing its border-radius, shoved on hover.', tags: ['gsap', 'loop', 'pointer'], Demo: GooeyBlobDemo },
      { id: 'wave-bars', name: 'WaveBars', description: 'Canvas waveform of token-tinted bars; paused off-screen.', tags: ['canvas', 'rAF'], Demo: WaveBarsDemo },
      { id: 'ripple-grid', name: 'RippleGrid', description: 'Click sends an expanding ripple across a canvas dot grid.', tags: ['canvas', 'pointer', 'rAF'], Demo: RippleGridDemo },
      { id: 'confetti-burst', name: 'ConfettiBurst', description: 'Button fires a token confetti burst with gravity and spin.', tags: ['canvas', 'rAF', 'pointer'], Demo: ConfettiBurstDemo },
      { id: 'generative-mesh', name: 'GenerativeMesh', description: 'Slider + toggle playground driving a generated SVG wireframe in real time.', tags: ['svg', 'interactive'], Demo: GenerativeMeshDemo },
      { id: 'light-rays', name: 'LightRays', description: 'Additively blended god-rays shimmering from an off-frame source; fills any container.', tags: ['canvas', 'rAF', 'ambient'], Demo: LightRaysDemo },
    ],
  },
  {
    key: 'grids',
    label: 'Grids & Bento',
    entries: [
      { id: 'bento-grid', name: 'BentoGrid', description: 'Hand-spanned bento grid with transform hover lift.', tags: ['grid'], Demo: BentoGridDemo },
      { id: 'flip-filter-grid', name: 'FlipFilterGrid', description: 'Filterable grid animating layout changes via GSAP Flip.', tags: ['gsap flip'], Demo: FlipFilterGridDemo },
      { id: 'magnetic-bento-workspace', name: 'MagneticBentoWorkspace', description: 'Dashboard panels with magnetic pointer pull and FLIP expansion into a focused view.', tags: ['framer', 'layout flip', 'pointer'], Demo: BentoWorkspaceDemo },
      { id: 'ss-bento-grid-reveal', name: 'BentoGridReveal', description: 'Modular bento grid whose tiles stagger in on scroll and lift on hover.', tags: ['gsap', 'scrolltrigger', 'grid'], Demo: SsBentoGridRevealDemo },
    ],
  },
  {
    key: 'cards',
    label: 'Cards',
    entries: [
      { id: 'category-row', name: 'CategoryRow', description: 'Oversized index row with transform hover slide.', tags: ['nav'], Demo: CategoryRowDemo },
      { id: 'flip-menu-cards', name: 'FlipMenuCards', description: 'Typographic cards that rotateY on click to reveal the dish story and ingredients.', tags: ['css 3d', 'flip', 'backface'], Demo: FlipMenuCardsDemo },
    ],
  },
  {
    key: 'micro-interactions',
    label: 'Micro Interactions',
    entries: [
      { id: 'hold-to-confirm-button', name: 'HoldToConfirmButton', description: 'Destructive pill that charges a fill while held; release early and it shakes back to zero.', tags: ['rAF', 'pointer', 'clip-path'], Demo: HoldToConfirmButtonDemo },
      { id: 'morphing-submit-button', name: 'MorphingSubmitButton', description: 'Submit button morphing pill → spinner → success with a self-drawing check, on a layout spring.', tags: ['framer', 'layout', 'state'], Demo: MorphingSubmitButtonDemo },
      { id: 'shred-delete-button', name: 'ShredDeleteButton', description: 'Delete button that splits into clip-path slats and drops through an invisible shredder; undo chip remains.', tags: ['framer', 'clip-path'], Demo: ShredDeleteButtonDemo },
      { id: 'reaction-button', name: 'ReactionButton', description: 'Heart with a particle burst on ignition and a direction-aware rolling counter.', tags: ['framer', 'particles'], Demo: ReactionButtonDemo },
      { id: 'squish-toggle', name: 'SquishToggle', description: 'Switch with cartoon physics: squash on press, spring overshoot on landing.', tags: ['framer', 'spring'], Demo: SquishToggleDemo },
      { id: 'elastic-range-slider', name: 'ElasticRangeSlider', description: 'Slider that rubber-bands when dragged past its ends and twangs back on release.', tags: ['pointer', 'physics'], Demo: ElasticRangeSliderDemo },
      { id: 'wave-volume-slider', name: 'WaveVolumeSlider', description: 'Volume track drawn as a live sine wave — amplitude follows level, the thumb rides the crest.', tags: ['svg', 'rAF', 'pointer'], Demo: WaveVolumeSliderDemo },
      { id: 'swipe-to-confirm', name: 'SwipeToConfirm', description: 'Slide-to-pay pill: drag past 85% to lock in green, hesitate and it springs home.', tags: ['pointer', 'drag'], Demo: SwipeToConfirmDemo },
      { id: 'dial-knob', name: 'DialKnob', description: 'Synth-style rotary knob: vertical drag sweeps 270° while the tick arc ignites.', tags: ['pointer', 'svg'], Demo: DialKnobDemo },
      { id: 'scrub-number-input', name: 'ScrubNumberInput', description: 'After-Effects-style scrubbable value with a sliding ruler tape; arrow keys fine-tune.', tags: ['pointer', 'input'], Demo: ScrubNumberInputDemo },
      { id: 'pin-code-input', name: 'PinCodeInput', description: 'OTP boxes where digits pop in on springs; wrong codes shake and clear, right ones lift in green.', tags: ['framer', 'forms'], Demo: PinCodeInputDemo },
      { id: 'ink-checkbox', name: 'InkCheckbox', description: 'Checkbox flooded by a springy ink fill while the check draws itself and a strike crosses the label.', tags: ['framer', 'svg', 'pathLength'], Demo: InkCheckboxDemo },
      { id: 'gooey-segmented-control', name: 'GooeySegmentedControl', description: 'Segmented control whose selection blob stretches like mercury via two springs fused in a goo filter.', tags: ['framer', 'svg filter'], Demo: GooeySegmentedControlDemo },
      { id: 'peel-sticker', name: 'PeelSticker', description: 'Vinyl sticker that peels from its corner on hover and rips away on click, leaving a re-stick residue.', tags: ['framer', 'clip-path'], Demo: PeelStickerDemo },
      { id: 'sonar-badge-bell', name: 'SonarBadgeBell', description: 'Notification bell with a damped clapper swing, sonar ripples and a rolling badge count.', tags: ['framer', 'keyframes'], Demo: SonarBadgeBellDemo },
      { id: 'glimpse', name: 'Glimpse', description: 'Inline link that unfurls a live OpenGraph preview card on hover; fetched once via a CORS metadata API, then cached.', tags: ['framer', 'hover', 'fetch'], Demo: GlimpseDemo },
    ],
  },
  {
    key: 'buttons',
    label: 'Buttons',
    entries: [
      { id: 'buttons', name: 'Buttons', description: 'Primary, outline and underline button set.', tags: ['ui'], Demo: ButtonsDemo },
      { id: 'copy-button', name: 'CopyButton', description: 'Clipboard button crossfading between copy and check with scale and blur.', tags: ['ui', 'clipboard'], Demo: CopyButtonDemo },
      { id: 'liquid-glass-button', name: 'LiquidGlassButton', description: 'Frosted button refracting its backdrop through an SVG displacement filter.', tags: ['glass', 'svg filter'], Demo: LiquidGlassButtonDemo },
      { id: 'interactive-hover-button', name: 'InteractiveHoverButton', description: 'An accent dot floods the button on hover as the label swaps for a CTA.', tags: ['css', 'hover', 'ui'], Demo: InteractiveHoverButtonDemo },
    ],
  },
  {
    key: 'forms-inputs',
    label: 'Forms & Inputs',
    entries: [
      { id: 'fields', name: 'Form Fields', description: 'Email field and pure-CSS floating-label input.', tags: ['ui', 'forms'], Demo: FieldsDemo },
      { id: 'selectable-card', name: 'SelectableCardGroup', description: 'Radio cards styled by their checked child via :has().', tags: ['css :has()'], Demo: SelectableCardDemo },
      { id: 'star-rating', name: 'StarRating', description: 'Interactive star rating: hover to preview, click to commit.', tags: ['ui', 'input'], Demo: StarRatingDemo },
      { id: 'conversational-form', name: 'ConversationalForm', description: 'Chat-style intake with quick-reply chips, free text and inline validation.', tags: ['framer', 'forms'], Demo: ConversationalFormDemo },
      { id: 'file-dropzone', name: 'FileDropzone', description: 'Drag-and-drop upload with type/size validation and a file-preview card.', tags: ['upload', 'drag'], Demo: FileDropzoneDemo },
      { id: 'dropdown', name: 'Dropdown', description: 'Select-style menu whose items stagger in on a spring while the chevron flips; active check, outside-click and Esc to close.', tags: ['framer', 'select', 'menu'], Demo: DropdownDemo },
      { id: 'consensus-rating', name: 'ConsensusRating', description: 'Rating input, vote distribution and the drift of the average over time, all registered to one score axis.', tags: ['css vars', 'zero-render drag', 'slider'], Demo: ConsensusRatingDemo },
    ],
  },
  {
    key: 'navigation',
    label: 'Navigation & Menus',
    entries: [
      { id: 'radial-menu', name: 'RadialMenu', description: 'Core button whose labelled petals spring out on a staggered arc.', tags: ['pointer', 'gsap', 'menu'], Demo: RadialMenuDemo },
      { id: 'header', name: 'Header + UtilityBar', description: 'Sticky top nav with utility strip; collapses on mobile.', tags: ['nav'], Demo: HeaderDemo },
      { id: 'liquid-navigation-dock', name: 'LiquidNavigationDock', description: 'Floating dock with a magnetic magnify and an elastic layoutId pill that flows between items.', tags: ['framer', 'layoutid', 'pointer'], Demo: NavigationDockDemo },
      { id: 'strata-tree', name: 'StrataTree', description: 'Windowed tree where nesting is depth in Z and the ancestors of the top row condense into a sticky spine.', tags: ['virtualized', 'css 3d', 'a11y tree'], Demo: StrataTreeDemo },
      { id: 'shapeshift-tabs', name: 'ShapeShiftTabs', description: 'Tab bar that becomes a priority-plus row then a listbox as its own box narrows; one indicator throughout.', tags: ['container query', 'priority+', 'a11y tabs'], Demo: ShapeShiftTabsDemo },
      { id: 'fisheye-pager', name: 'FisheyePager', description: 'Whole page range on one bar under a fisheye lens; geared drag-scrub crosses ten thousand pages in a gesture.', tags: ['focus+context', 'sampling', 'drag'], Demo: FisheyePagerDemo },
    ],
  },
  {
    key: 'overlays',
    label: 'Overlays',
    entries: [
      { id: 'kinetic-command-center', name: 'KineticCommandCenter', description: 'Command palette with a morphing preview panel; fuzzy search and full keyboard nav.', tags: ['framer', 'fuse.js', 'palette'], Demo: CommandCenterDemo },
      { id: 'satellite-popover', name: 'SatellitePopover', description: 'Popover that closes on direction, not delay — a safe corridor to walk into, dwell to pin, sheet on small screens.', tags: ['geometry', 'dwell', 'portal'], Demo: SatellitePopoverDemo },
    ],
  },
  {
    key: 'accordions',
    label: 'Accordions & FAQ',
    entries: [
      { id: 'faq', name: 'FAQ', description: 'Grouped FAQ accordion; one answer open at a time with a height transition.', tags: ['accordion'], Demo: FaqDemo },
      { id: 'ss-accordion-faq', name: 'AccordionFAQ', description: 'FAQ accordion with a scroll-reveal header and a smooth grid-row height transition.', tags: ['gsap', 'accordion'], Demo: SsAccordionFaqDemo },
      { id: 'tide-accordion', name: 'TideAccordion', description: 'Fixed space budget: opening a panel takes room from the others, so nothing outside the accordion ever shifts.', tags: ['zero CLS', 'containment', 'lru'], Demo: TideAccordionDemo },
    ],
  },
  {
    key: 'decor',
    label: 'Decorative UI',
    entries: [
      { id: 'corner-marks', name: 'CornerMarks', description: 'Specimen-plate crop marks for any relative container.', tags: ['decoration'], Demo: CornerMarksDemo },
      { id: 'theme-toggle', name: 'ThemeToggle', description: 'Day/night switch with a knob that slides between moon and sun.', tags: ['ui', 'toggle'], Demo: ThemeToggleDemo },
      { id: 'rotating-ring', name: 'RotatingRing', description: 'Type set on a circular path, spinning only while on screen.', tags: ['svg', 'rAF'], Demo: RotatingRingDemo },
    ],
  },
  {
    key: 'data-viz',
    label: 'Data Viz',
    entries: [
      { id: 'morphing-analytics-explorer', name: 'MorphingAnalyticsExplorer', description: 'Charts that morph point-to-point between line, bar and radial instead of resetting.', tags: ['svg', 'framer', 'morph'], Demo: AnalyticsExplorerDemo },
      { id: 'spatial-testimonial-constellation', name: 'SpatialTestimonialConstellation', description: 'Testimonials as a constellation that reacts to cursor proximity; click a node to focus.', tags: ['framer', 'pointer', 'canvas math'], Demo: ConstellationDemo },
    ],
  },
  {
    key: 'heroes-intro',
    label: 'Heroes & Intros',
    entries: [
      { id: 'curtain-page-transition', name: 'CurtainPageTransition', description: 'Staggered panels cover, swap content, then reveal.', tags: ['framer', 'transition'], Demo: CurtainPageTransitionDemo },
      { id: 'hero', name: 'Hero', description: 'Full-bleed editorial hero with oversized serif headline.', tags: ['hero'], Demo: HeroDemo },
      { id: 'loading-screen', name: 'LoadingScreen', description: 'Full-bleed intro loader with an auto-sized wordmark and scrambling meta.', tags: ['intro', 'framer'], Demo: LoadingScreenDemo },
    ],
  },
  {
    key: 'page-sections',
    label: 'Page Sections',
    entries: [
      { id: 'pull-quote', name: 'PullQuote', description: 'Editorial pull-quote whose rule draws in on view.', tags: ['editorial'], Demo: PullQuoteDemo },
      { id: 'chorus-quote', name: 'ChorusQuote', description: 'Rotating quotes diffed at word level — the words two reviews share travel by FLIP instead of cross-fading.', tags: ['lcs diff', 'flip', 'waapi'], Demo: ChorusQuoteDemo },
      { id: 'footer', name: 'Footer', description: 'Marquee ticker, giant wordmark, newsletter, link columns.', tags: ['footer'], Demo: FooterDemo },
    ],
  },
  {
    key: 'commerce',
    label: 'Commerce Effects',
    entries: [
      { id: 'swatch-wipe', name: 'SwatchWipe', description: 'Colourway swap that wipes in as a circle expanding from the swatch you pressed.', tags: ['clip-path', 'pdp', 'variants'], Demo: SwatchWipeDemo },
      { id: 'zoom-loupe', name: 'ZoomLoupe', description: 'Hard-edged square magnifier tracking the pointer 1:1 over a product shot.', tags: ['pointer', 'pdp', 'zoom'], Demo: ZoomLoupeDemo },
      { id: 'shelf-lift', name: 'ShelfLift', description: 'Product grid where cards rise and their shelf tightens by pointer proximity.', tags: ['pointer', 'rAF', 'plp'], Demo: ShelfLiftDemo },
      { id: 'split-flap-eta', name: 'SplitFlapETA', description: 'Delivery date lands on a split-flap board after a pincode lookup.', tags: ['rAF', 'checkout', 'trust'], Demo: SplitFlapETADemo },
      { id: 'stock-erosion', name: 'StockErosion', description: 'Scarcity as a hairline that frays and thins as units run out.', tags: ['svg', 'scarcity', 'pdp'], Demo: StockErosionDemo },
      { id: 'threshold-rule', name: 'ThresholdRule', description: 'Free-shipping progress as one rule that fills and ticks at the crossing.', tags: ['cart', 'progress', 'io'], Demo: ThresholdRuleDemo },
      { id: 'dimension-rule', name: 'DimensionRule', description: 'Measured callouts that draw onto the product beside a true-scale reference.', tags: ['svg', 'io', 'sizing'], Demo: DimensionRuleDemo },
      { id: 'price-drop-ghost', name: 'PriceDropGhost', description: 'The previous price detaches, drifts and fades as the new one settles.', tags: ['pdp', 'pricing', 'one-shot'], Demo: PriceDropGhostDemo },
      { id: 'condense-buy-bar', name: 'CondenseBuyBar', description: 'Buy box folds into a sticky hairline bar the moment it scrolls away.', tags: ['io', 'sticky', 'pdp'], Demo: CondenseBuyBarDemo },
      { id: 'bundle-tally', name: 'BundleTally', description: 'Bought-together swatches fly into a bundle stack as the total re-tallies.', tags: ['flip', 'cross-sell', 'cart'], Demo: BundleTallyDemo },
      { id: 'lighting-truth', name: 'LightingTruth', description: 'The same shot under daylight, storefront, evening and office light.', tags: ['css filter', 'colour', 'returns'], Demo: LightingTruthDemo },
      { id: 'price-history-spark', name: 'PriceHistorySpark', description: 'Scrubable 90-day price line that proves the discount is real.', tags: ['svg', 'trust', 'pricing'], Demo: PriceHistorySparkDemo },
      { id: 'spec-diff', name: 'SpecDiff', description: 'Comparison table that collapses every row the two products agree on.', tags: ['0fr collapse', 'compare'], Demo: SpecDiffDemo },
      { id: 'receipt-unroll', name: 'ReceiptUnroll', description: 'Order summary that prints out line by line onto a torn edge.', tags: ['stagger', 'confirmation'], Demo: ReceiptUnrollDemo },
      { id: 'in-the-box', name: 'InTheBox', description: 'CSS-3D carton whose lid hinges back onto the contents — and the exclusions.', tags: ['css 3d', 'pdp'], Demo: InTheBoxDemo },
      { id: 'spec-pins', name: 'SpecPins', description: 'Construction callouts pinned to the exact point on the product they describe.', tags: ['svg', 'pointer', 'pdp'], Demo: SpecPinsDemo },
      { id: 'quantity-resist', name: 'QuantityResist', description: 'Stepper that rubber-bands against the stock ceiling, then explains itself.', tags: ['waapi', 'stock', 'cart'], Demo: QuantityResistDemo },
      { id: 'save-crease', name: 'SaveCrease', description: 'Wishlist as a dog-eared corner that stays folded on the card.', tags: ['clip-path', 'wishlist', 'plp'], Demo: SaveCreaseDemo },
      { id: 'cadence-dial', name: 'CadenceDial', description: 'Turn a dial to set subscription frequency; the next delivery dates re-settle live.', tags: ['pointer', 'drag', 'subscription'], Demo: CadenceDialDemo },
      { id: 'cost-per-wear', name: 'CostPerWear', description: 'Slider that converts a premium price into cost per wear against a cheaper rival.', tags: ['svg', 'pricing', 'pdp'], Demo: CostPerWearDemo },
      { id: 'collection-showcase', name: 'CollectionShowcase', description: 'A fixed-height jewellery collection with a filmstrip, fullscreen filters, and lightbox.', tags: ['gallery', 'commerce', 'a11y'], Demo: CollectionShowcase },
    ],
  },
  {
    key: 'embroidery',
    label: 'Embroidery',
    entries: [
      { id: 'stitch-reveal', name: 'StitchReveal', description: 'The design arrives in real stitch order, block by block, with a needle leading the line.', tags: ['svg', 'waapi', 'io'], Demo: StitchRevealDemo },
      { id: 'thread-path', name: 'ThreadPath', description: 'Stepper joined by one continuous thread — taut behind the needle, slack ahead of it.', tags: ['svg', 'offset-path', 'steps'], Demo: ThreadPathDemo },
      { id: 'digitize-pass', name: 'DigitizePass', description: 'One motif in its three states: artwork, path plan with jumps and anchors, stitch plan.', tags: ['svg', 'explainer', 'stages'], Demo: DigitizePassDemo },
      { id: 'hoop-stage', name: 'HoopStage', description: 'Drag a design onto a garment at true millimetre scale, snapping to real placement zones.', tags: ['pointer', 'drag', 'configurator'], Demo: HoopStageDemo },
      { id: 'thread-drawer', name: 'ThreadDrawer', description: 'Per-block colourway picker that scores every thread against the fabric it sits on.', tags: ['colour', 'contrast', 'a11y'], Demo: ThreadDrawerDemo },
      { id: 'stitch-timeline', name: 'StitchTimeline', description: 'Scrub a run stitch by stitch; colour changes and machine time are called out live.', tags: ['range', 'scrub', 'svg mask'], Demo: StitchTimelineDemo },
      { id: 'stitch-progress', name: 'StitchProgress', description: 'Order status in stitches and metres, with the thread cone draining as the run goes.', tags: ['status', 'gauge', 'live'], Demo: StitchProgressDemo },
      { id: 'stitch-estimator', name: 'StitchEstimator', description: 'Size and density become stitches, thread metres, machine minutes and a price.', tags: ['pricing', 'form', 'quote'], Demo: StitchEstimatorDemo },
      { id: 'swatch-book', name: 'SwatchBook', description: 'A stack of material samples you throw aside one at a time, each with its spec sheet.', tags: ['pointer', 'stack', 'materials'], Demo: SwatchBookDemo },
      { id: 'repeat-field', name: 'RepeatField', description: 'All-over repeat composed on the garment as one SVG pattern, with the stitch count attached.', tags: ['svg pattern', 'tiling', 'configurator'], Demo: RepeatFieldDemo },
    ],
  },
  {
    key: 'expedition',
    label: 'Expedition',
    entries: [
      { id: 'expedition-opening', name: 'ExpeditionOpening', description: 'Opening an archive rather than landing on a page: expedition marker, featured find, stratum, index strip.', tags: ['hero', 'container query', 'a11y'], Demo: ExpeditionOpeningDemo },
      { id: 'artifact-catalog', name: 'ArtifactCatalog', description: 'One set of records in three geometries — photographic wall, compact index, single examination.', tags: ['recompose', 'radiogroup', 'plp'], Demo: ArtifactCatalogDemo },
      { id: 'artifact-scanner', name: 'ArtifactScanner', description: 'Discrete region examination with a locator that always answers "where am I looking?".', tags: ['transform zoom', 'keyboard', 'pdp'], Demo: ArtifactScannerDemo },
      { id: 'expedition-map', name: 'ExpeditionMap', description: 'Collection as surveyed ground you pan; below 620px it becomes a vertical territory index instead.', tags: ['svg', 'pan', 'recompose'], Demo: ExpeditionMapDemo },
      { id: 'restoration-lab', name: 'RestorationLab', description: 'Customisation as restoration: one contextual tool, original beside restored, a diffed intervention record.', tags: ['configurator', 'true scale', 'tray'], Demo: RestorationLabDemo },
      { id: 'field-notes', name: 'FieldNotes', description: 'Craft explained as dated journal entries; one latched IntersectionObserver drives reveal and spine index.', tags: ['io', 'editorial', 'scrollspy'], Demo: FieldNotesDemo },
      { id: 'specimen-comparison', name: 'SpecimenComparison', description: 'Specimens registered to shared axes and drawn at true relative size, so a difference is a distance.', tags: ['compare', 'axes', 'a-b toggle'], Demo: SpecimenComparisonDemo },
      { id: 'material-vault', name: 'MaterialVault', description: 'Cloth as documented specimens pulled out of a cabinet, each scored against the chosen thread.', tags: ['materials', 'tactile', 'contrast'], Demo: MaterialVaultDemo },
      { id: 'acquisition-desk', name: 'AcquisitionDesk', description: 'Checkout as an acquisition ledger: every figure unfolded, re-stamped on change, one unmistakable action.', tags: ['checkout', 'ledger', 'states'], Demo: AcquisitionDeskDemo },
      { id: 'collection-vault', name: 'CollectionVault', description: 'An exhibition hang: one piece dominant, the rest orbiting in rank; selecting one rotates the room.', tags: ['exhibition', 'rank', 'showcase'], Demo: CollectionVaultDemo },
    ],
  },
  {
    key: 'interactive-showcase',
    label: 'Interactive Showcase',
    entries: [
      { id: 'projects', name: 'Projects', description: 'Scroll-driven project monograph: sticky chapters with parallax covers and a live progress rail.', tags: ['scroll', 'sticky', 'io'], Demo: ProjectsDemo },
      { id: 'floor-plan-picker', name: 'FloorPlanPicker', description: 'Tilted 3D reservation floor plan; free tables lift on hover — pick a time and confirm.', tags: ['css 3d', 'interactive', 'booking'], Demo: FloorPlanPickerDemo },
      { id: 'spotlight-podium', name: 'SpotlightPodium', description: 'Specials on pedestals under a spotlight; clicking one brings it downstage into the beam.', tags: ['css 3d', 'pointer', 'showcase'], Demo: SpotlightPodiumDemo },
      { id: 'intelligent-pricing-configurator', name: 'IntelligentPricingConfigurator', description: 'Pricing that recommends a plan and transitions the price as you slide seats and usage.', tags: ['framer', 'slider', 'interactive'], Demo: PricingConfiguratorDemo },
      { id: 'living-ai-response', name: 'LivingAiResponse', description: 'An AI response interface that assembles itself in progressive, staged reveals.', tags: ['framer', 'state machine', 'stagger'], Demo: AiResponseDemo },
    ],
  },
  {
    key: 'app-shell',
    label: 'App Shell',
    entries: [
      { id: 'shell-header', name: 'Header', description: 'Sticky 64px bar whose scroll state is three booleans, so it renders four times a page instead of four hundred.', tags: ['sticky', 'backdrop-blur', 'zero re-render'], Demo: ShellHeaderDemo },
      { id: 'shell-hero', name: 'HeroSection', description: 'Staggered fade-up on one 100/20 spring — eight elements arriving as a single gesture.', tags: ['framer', 'spring', 'stagger'], Demo: ShellHeroDemo },
      { id: 'shell-bento-grid', name: 'BentoGrid', description: '4x3 wall with typed spans; the container owns the stagger so cells can be added or removed freely.', tags: ['grid', 'variants', 'io'], Demo: ShellBentoGridDemo },
      { id: 'shell-data-card', name: 'DataCard', description: 'One card unit for the whole set: 4px lift, 40px shadow, 400ms, and a pointer spotlight that never re-renders.', tags: ['hover', 'css vars', 'a11y'], Demo: ShellDataCardDemo },
      { id: 'shell-sidebar', name: 'Sidebar', description: 'Three widths — 76 collapsed, 280 at rest, 320 under the pointer — that compose instead of fighting.', tags: ['hover', 'contain', 'layoutId'], Demo: ShellSidebarDemo },
      { id: 'shell-data-table', name: 'DataTable', description: 'Rows cascade on a capped 50ms animation-delay ladder; sorting replays it, nothing else does.', tags: ['css keyframes', 'sort', 'container'], Demo: ShellDataTableDemo },
      { id: 'shell-popover', name: 'Popover', description: 'Mounts one painted frame closed so the 200ms scale entrance has a value to run from; origin follows placement.', tags: ['portal', 'presence', 'collision'], Demo: ShellPopoverDemo },
      { id: 'shell-primary-button', name: 'PrimaryButton', description: 'A 500ms gradient sweep and a 120ms press, on two layers because one element cannot carry both.', tags: ['gradient', 'press', 'loading'], Demo: ShellPrimaryButtonDemo },
      { id: 'shell-modal', name: 'Modal', description: 'Overlay blur and panel zoom on one 300ms clock, with a real focus trap and scroll lock.', tags: ['dialog', 'focus trap', 'a11y'], Demo: ShellModalDemo },
      { id: 'shell-footer', name: 'Footer', description: '300px close with an SVG line drawing that starts on intersection and latches.', tags: ['io', 'svg draw', 'stagger'], Demo: ShellFooterDemo },
    ],
  },
];

/** Flat view for arrow-key navigation and global indexing. */
export const flatRegistry: RegistryEntry[] = registry.flatMap((c) => c.entries);
