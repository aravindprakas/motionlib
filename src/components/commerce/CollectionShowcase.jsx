/**
 * CollectionShowcase
 * ------------------
 * Fixed-height showcase for a large image collection (e.g. 50 earring designs).
 * The section is `min(100vh, 720px)` tall and NEVER grows with item count:
 * header + featured image + one horizontally scrolling filmstrip.
 *
 * Plus a fullscreen "View all" overlay with tag filters, and a lightbox with
 * keyboard / swipe navigation. React 18 + Tailwind only, no dependencies.
 *
 *   <CollectionShowcase />                                 // demo data
 *   <CollectionShowcase title="Bangles" items={bangles} /> // any category
 */

import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/* ------------------------------------------------------------------ theme */

const GOLD = "#B8963E";

/** Scoped stylesheet: fonts, hidden scrollbars, shimmer, reduced-motion. */
const STYLES = `
.cs-serif{font-family:"Cormorant Garamond","Playfair Display",ui-serif,Georgia,"Times New Roman",serif}
.cs-sans{font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Inter,Roboto,sans-serif}
.cs-noscrollbar{scrollbar-width:none;-ms-overflow-style:none}
.cs-noscrollbar::-webkit-scrollbar{display:none;width:0;height:0}
.cs-shimmer{background:#F1EADF}
.cs-shimmer::after{content:"";position:absolute;inset:0;transform:translateX(-100%);
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.7),transparent);
  animation:cs-shimmer 1.6s ease-in-out infinite}
@keyframes cs-shimmer{100%{transform:translateX(100%)}}
.cs-fade-in{animation:cs-fade .28s ease-out both}
@keyframes cs-fade{from{opacity:0}to{opacity:1}}
@media (prefers-reduced-motion:reduce){
  .cs-shimmer::after,.cs-fade-in{animation:none!important}
  .cs-root *,.cs-portal *{transition-duration:1ms!important;scroll-behavior:auto!important}
}
`;

/* -------------------------------------------------------------- demo data */

const CATEGORIES = ["Studs", "Jhumkas", "Hoops", "Drops"];

const NAME_PARTS = [
  "Padma", "Meera", "Kanika", "Anaya", "Rukmini", "Tara", "Saanvi", "Mallika",
  "Ira", "Nitya", "Charu", "Vaani", "Ishani", "Amrita", "Revati", "Leela",
  "Naina", "Suhana", "Kiara", "Gauri", "Aarna", "Vedika", "Trisha", "Shanaya",
  "Mrinal",
];

const STYLE_WORDS = {
  Studs: ["Stud", "Solitaire Stud", "Petal Stud"],
  Jhumkas: ["Jhumka", "Temple Jhumka", "Bell Jhumka"],
  Hoops: ["Hoop", "Twist Hoop", "Ribbed Hoop"],
  Drops: ["Drop", "Cascade Drop", "Teardrop"],
};

const OCCASIONS = ["Bridal", "Everyday", "Festive"];

/** Deterministic pseudo-random, so SSR and client generate identical data. */
const rand = (n) => {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

function makeDemoItems(count = 50) {
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1;
    const category = CATEGORIES[i % CATEGORIES.length];
    const styleWord = STYLE_WORDS[category][Math.floor(rand(n) * 3)];
    const name = `${NAME_PARTS[i % NAME_PARTS.length]} ${styleWord}`;
    const price = Math.round((18000 + rand(n * 7) * 127000) / 100) * 100;
    const tags = [category];
    if (rand(n * 13) > 0.55) tags.push(OCCASIONS[Math.floor(rand(n * 3) * 3)]);
    return {
      id: `earring-${n}`,
      src: `https://picsum.photos/seed/${n}/600/750`,
      alt: `${name} — 22k gold ${category.toLowerCase().replace(/s$/, "")}`,
      name,
      price,
      tags,
    };
  });
}

const DEMO_ITEMS = makeDemoItems(50);

const formatPrice = (p) =>
  typeof p === "number" ? `₹${p.toLocaleString("en-IN")}` : "";

/* ------------------------------------------------------------------ hooks */

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

/** Body scroll lock, reference counted so stacked dialogs behave. */
let lockCount = 0;
let savedOverflow = "";
let savedPadding = "";
function useBodyScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;
    if (lockCount === 0) {
      const gap = window.innerWidth - document.documentElement.clientWidth;
      savedOverflow = document.body.style.overflow;
      savedPadding = document.body.style.paddingRight;
      document.body.style.overflow = "hidden";
      if (gap > 0) document.body.style.paddingRight = `${gap}px`;
    }
    lockCount += 1;
    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        document.body.style.overflow = savedOverflow;
        document.body.style.paddingRight = savedPadding;
      }
    };
  }, [active]);
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Only the top-most dialog reacts to Esc / back. */
const dialogStack = [];

/**
 * A dialog that closes on its own pops the history entry it pushed. That pop
 * must not be mistaken for a user "back" by the dialog underneath, so it is
 * flagged until every popstate listener has seen it (the clean-up listener is
 * registered last, so it runs after the dialogs').
 */
let ignorePop = false;
function popOwnHistoryEntry() {
  ignorePop = true;
  let timer = 0;
  const clear = () => {
    ignorePop = false;
    clearTimeout(timer);
    window.removeEventListener("popstate", clear);
  };
  window.addEventListener("popstate", clear);
  timer = setTimeout(clear, 500); // back() was a no-op: don't stay armed
  window.history.back();
}

/**
 * Dialog plumbing: scroll lock, focus trap, focus restore, Esc, back gesture.
 * The history entry pushed on open means the Android / browser back button
 * (and the macOS back swipe) closes the dialog rather than leaving the page.
 */
function useDialog(ref, active, onClose) {
  const tokenRef = useRef({});
  const restoreRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose; // keeps effects stable across renders

  useBodyScrollLock(active);

  const isTop = useCallback(
    () => dialogStack[dialogStack.length - 1] === tokenRef.current,
    []
  );

  useEffect(() => {
    if (!active) return undefined;
    const token = tokenRef.current;
    dialogStack.push(token);
    return () => {
      const i = dialogStack.indexOf(token);
      if (i > -1) dialogStack.splice(i, 1);
    };
  }, [active]);

  // Remember the trigger, focus into the dialog, hand focus back on close.
  useIsoLayoutEffect(() => {
    if (!active) return undefined;
    restoreRef.current = document.activeElement;
    const node = ref.current;
    const target = node?.querySelector("[data-autofocus]") || node;
    target?.focus?.({ preventScroll: true });
    return () => {
      const el = restoreRef.current;
      if (el && typeof el.focus === "function") el.focus({ preventScroll: true });
    };
  }, [active, ref]);

  // Esc closes, Tab is trapped inside the dialog.
  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => {
      if (!isTop()) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const node = ref.current;
      if (!node) return;
      const focusable = Array.from(node.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (focusable.length === 0) {
        e.preventDefault();
        node.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;
      if (e.shiftKey && (current === first || !node.contains(current))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [active, isTop, ref]);

  // Back gesture / back button closes this dialog.
  useEffect(() => {
    if (!active) return undefined;
    const token = tokenRef.current;
    if (token.pendingPop) {
      // StrictMode re-ran this effect — keep the entry we already pushed.
      clearTimeout(token.pendingPop);
      token.pendingPop = 0;
    } else {
      window.history.pushState({ csDialog: true }, "");
    }
    let poppedUs = false;
    const onPop = () => {
      if (ignorePop) return; // another dialog tidying up, not the user
      if (!isTop()) return;
      poppedUs = true;
      closeRef.current();
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      if (poppedUs) return; // the entry is already gone
      token.pendingPop = setTimeout(() => {
        token.pendingPop = 0;
        popOwnHistoryEntry(); // drop the entry we added
      }, 0);
    };
  }, [active, isTop]);
}

/* -------------------------------------------------------------- primitives */

function Icon({ path, className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}

const ChevronLeft = (p) => <Icon {...p} path={<path d="M15 6l-6 6 6 6" />} />;
const ChevronRight = (p) => <Icon {...p} path={<path d="M9 6l6 6-6 6" />} />;
const CloseIcon = (p) => <Icon {...p} path={<path d="M6 6l12 12M18 6L6 18" />} />;
const ArrowRight = (p) => (
  <Icon {...p} path={<path d="M4 12h15m-5.5-5.5L19 12l-5.5 5.5" />} />
);
const ExpandIcon = (p) => (
  <Icon {...p} path={<path d="M9 4H4v5M15 4h5v5M15 20h5v-5M9 20H4v-5" />} />
);

/**
 * Image in a fixed aspect-ratio box (no layout shift), lazily loaded, with a
 * shimmer placeholder that clears the moment the bitmap is ready.
 */
function SmartImage({
  src,
  alt,
  ratio = "4 / 5",
  className = "",
  imgClassName = "",
  sizes,
}) {
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  // Cached images can be `complete` before React ever fires onLoad.
  useIsoLayoutEffect(() => {
    const node = imgRef.current;
    setLoaded(Boolean(node && node.complete && node.naturalWidth > 0));
  }, [src]);

  return (
    <div
      className={`relative overflow-hidden bg-[#F1EADF] ${className}`}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      {!loaded && (
        <span aria-hidden="true" className="cs-shimmer absolute inset-0" />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        sizes={sizes}
        loading="lazy"
        decoding="async"
        draggable={false}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        } ${imgClassName}`}
      />
    </div>
  );
}

function Pill({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-[#B8963E]/40 px-2.5 py-0.5 text-[11px] uppercase tracking-[0.14em] text-[#7A6636] ${className}`}
    >
      {children}
    </span>
  );
}

/* --------------------------------------------------------------- filmstrip */

/**
 * One horizontal row of thumbnails: scroll-snap, arrow buttons, mouse drag,
 * shift-wheel, native touch swipe, hidden scrollbar + gold progress bar.
 */
function Filmstrip({ items, activeId, onPreview, onOpen, reducedMotion }) {
  const scrollerRef = useRef(null);
  const hoveringRef = useRef(false);
  const dragRef = useRef({ down: false, startX: 0, startLeft: 0, moved: false });
  const [progress, setProgress] = useState({ ratio: 0, thumb: 0.2 });
  const [edges, setEdges] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress({
      ratio: max > 0 ? el.scrollLeft / max : 0,
      thumb: Math.max(0.08, el.clientWidth / Math.max(el.scrollWidth, 1)),
    });
    setEdges({ start: el.scrollLeft <= 1, end: el.scrollLeft >= max - 1 });
  }, []);

  useEffect(() => {
    measure();
    const el = scrollerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, items]);

  // Shift+wheel (and trackpads that only emit deltaY) scroll horizontally.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // native horizontal
      if (!e.shiftKey) return; // plain vertical wheel still scrolls the page
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Keep the active thumb in view — unless the pointer is the one driving it.
  useEffect(() => {
    if (hoveringRef.current) return;
    const thumb = scrollerRef.current?.querySelector(`[data-id="${activeId}"]`);
    thumb?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeId, reducedMotion]);

  const page = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir * el.clientWidth * 0.85,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  /* mouse drag-to-scroll; touch keeps native momentum scrolling */
  const onPointerDown = (e) => {
    if (e.pointerType !== "mouse") return;
    const el = scrollerRef.current;
    dragRef.current = {
      down: true,
      startX: e.clientX,
      startLeft: el.scrollLeft,
      moved: false,
    };
    try {
      el.setPointerCapture?.(e.pointerId);
    } catch {
      /* synthetic or already-released pointer */
    }
  };
  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d.down) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 4) d.moved = true;
    scrollerRef.current.scrollLeft = d.startLeft - dx;
  };
  const endDrag = (e) => {
    if (!dragRef.current.down) return;
    try {
      scrollerRef.current?.releasePointerCapture?.(e.pointerId);
    } catch {
      /* pointer already released */
    }
    dragRef.current.down = false;
  };
  // Swallow the click that ends a drag so it doesn't select a thumbnail.
  const onClickCapture = (e) => {
    if (!dragRef.current.moved) return;
    e.preventDefault();
    e.stopPropagation();
    dragRef.current.moved = false;
  };

  // ← / → move focus along the strip and preview as they go.
  const onKeyDown = (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const thumbs = Array.from(
      scrollerRef.current?.querySelectorAll("[data-thumb]") || []
    );
    const i = thumbs.indexOf(document.activeElement);
    if (i === -1) return;
    const next = thumbs[i + (e.key === "ArrowRight" ? 1 : -1)];
    if (!next) return;
    e.preventDefault();
    next.focus();
    onPreview(next.dataset.id);
  };

  const arrowClass =
    "grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#B8963E]/35 bg-white/80 text-[#14110D] shadow-[0_1px_6px_rgba(20,17,13,0.06)] transition hover:border-[#B8963E] hover:bg-white disabled:cursor-not-allowed disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-[#B8963E]";

  return (
    <div className="mt-4 shrink-0 sm:mt-5">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          className={arrowClass}
          onClick={() => page(-1)}
          disabled={edges.start}
          aria-label="Scroll thumbnails left"
        >
          <ChevronLeft />
        </button>

        <ul
          ref={scrollerRef}
          aria-label="Collection thumbnails"
          onScroll={measure}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
          onMouseEnter={() => {
            hoveringRef.current = true;
          }}
          onMouseLeave={() => {
            hoveringRef.current = false;
          }}
          className="cs-noscrollbar flex flex-1 snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain sm:gap-3"
          /* fluid height keeps room for the featured image on short viewports */
          style={{
            height: "clamp(64px, 15vh, 108px)",
            touchAction: "pan-x pinch-zoom",
            cursor: "grab",
          }}
        >
          {items.map((item) => {
            const isActive = item.id === activeId;
            return (
              <li key={item.id} className="h-full shrink-0 snap-start">
                <button
                  type="button"
                  data-thumb
                  data-id={item.id}
                  aria-pressed={isActive}
                  aria-label={`${item.name}${
                    item.price != null ? `, ${formatPrice(item.price)}` : ""
                  }. ${isActive ? "Open fullscreen" : "Show in preview"}`}
                  onMouseEnter={() => onPreview(item.id)}
                  onFocus={() => onPreview(item.id)}
                  /* first click previews; clicking the active thumb opens it */
                  onClick={() => (isActive ? onOpen(item.id) : onPreview(item.id))}
                  onDoubleClick={() => onOpen(item.id)}
                  className={`group relative h-full overflow-hidden rounded-[3px] outline-none ring-offset-2 ring-offset-[#FBF8F3] transition focus-visible:ring-2 focus-visible:ring-[#B8963E] ${
                    isActive ? "" : "opacity-80 hover:opacity-100"
                  }`}
                >
                  <SmartImage
                    src={item.src}
                    alt={item.alt}
                    className="h-full w-auto"
                    imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="110px"
                  />
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-0 rounded-[3px] border transition-colors ${
                      isActive ? "border-[#B8963E]" : "border-transparent"
                    }`}
                  />
                </button>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          className={arrowClass}
          onClick={() => page(1)}
          disabled={edges.end}
          aria-label="Scroll thumbnails right"
        >
          <ChevronRight />
        </button>
      </div>

      {/* thin gold indicator standing in for the hidden scrollbar */}
      <div aria-hidden="true" className="mx-11 mt-3 h-px bg-[#14110D]/10 sm:mx-12">
        <div
          className="h-px"
          style={{
            background: GOLD,
            width: `${progress.thumb * 100}%`,
            marginLeft: `${progress.ratio * (1 - progress.thumb) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- view-all grid */

function GridOverlay({ title, items, onClose, onOpenItem, reducedMotion }) {
  const panelRef = useRef(null);
  const headingId = useId();
  const [tag, setTag] = useState("All");
  useDialog(panelRef, true, onClose);

  const tags = useMemo(() => {
    const set = new Set();
    items.forEach((i) => (i.tags || []).forEach((t) => set.add(t)));
    return ["All", ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(
    () =>
      tag === "All" ? items : items.filter((i) => (i.tags || []).includes(tag)),
    [items, tag]
  );

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      tabIndex={-1}
      className={`cs-portal cs-sans fixed inset-0 z-[70] flex flex-col bg-[#FBF8F3] text-[#14110D] outline-none ${
        reducedMotion ? "" : "cs-fade-in"
      }`}
    >
      <header className="shrink-0 border-b border-[#B8963E]/20 bg-[#FBF8F3]/95 px-5 pb-3 pt-5 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-7xl items-start justify-between gap-6">
          <div className="min-w-0">
            <h2 id={headingId} className="cs-serif text-2xl leading-tight sm:text-3xl">
              {title}
            </h2>
            <p className="mt-1 text-sm text-[#14110D]/55">
              Showing{" "}
              <span aria-live="polite" className="text-[#14110D]">
                {filtered.length}
              </span>{" "}
              of {items.length} designs
            </p>
          </div>
          <button
            type="button"
            data-autofocus
            onClick={onClose}
            aria-label="Close all designs"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#B8963E]/35 transition hover:border-[#B8963E] hover:bg-white focus-visible:ring-2 focus-visible:ring-[#B8963E]"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div
          role="group"
          aria-label="Filter by style"
          className="cs-noscrollbar mx-auto mt-4 flex max-w-7xl gap-2 overflow-x-auto pb-1"
        >
          {tags.map((t) => {
            const on = t === tag;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTag(t)}
                aria-pressed={on}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] uppercase tracking-[0.12em] transition focus-visible:ring-2 focus-visible:ring-[#B8963E] ${
                  on
                    ? "border-[#B8963E] bg-[#B8963E] text-white"
                    : "border-[#14110D]/15 text-[#14110D]/65 hover:border-[#B8963E]/60 hover:text-[#14110D]"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </header>

      {/* the overlay scrolls internally; the page behind it stays locked */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-8 sm:py-8">
        <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {filtered.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onOpenItem(item.id, filtered)}
                aria-haspopup="dialog"
                aria-label={`Open ${item.name} in the image viewer`}
                className="group block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-[#B8963E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF8F3]"
              >
                <SmartImage
                  src={item.src}
                  alt={item.alt}
                  className="w-full rounded-[3px] shadow-[0_1px_10px_rgba(20,17,13,0.05)]"
                  imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(min-width:1280px) 18vw, (min-width:768px) 28vw, 45vw"
                />
                <p className="cs-serif mt-2.5 truncate text-[15px]">{item.name}</p>
                {item.price != null && (
                  <p className="mt-0.5 text-[13px] text-[#14110D]/55">
                    {formatPrice(item.price)}
                  </p>
                )}
              </button>
            </li>
          ))}
        </ul>

        {filtered.length === 0 && (
          <p className="py-20 text-center text-sm text-[#14110D]/50">
            No designs in this style yet.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- lightbox */

function Lightbox({ list, index, setIndex, onClose, reducedMotion }) {
  const panelRef = useRef(null);
  const stripRef = useRef(null);
  const swipeRef = useRef({ x: 0, y: 0, down: false });
  const headingId = useId();
  useDialog(panelRef, true, onClose);

  const item = list[index];

  const go = useCallback(
    (delta) =>
      setIndex((i) => Math.min(list.length - 1, Math.max(0, i + delta))),
    [list.length, setIndex]
  );

  // ← / → navigation.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  // Preload strictly the two neighbours — nothing else.
  useEffect(() => {
    [list[index - 1], list[index + 1]].forEach((neighbour) => {
      if (!neighbour) return;
      const img = new Image();
      img.decoding = "async";
      img.src = neighbour.src;
    });
  }, [index, list]);

  // Keep the active thumbnail centred in the bottom strip.
  useEffect(() => {
    stripRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [index, reducedMotion]);

  /* swipe */
  const onPointerDown = (e) => {
    swipeRef.current = { x: e.clientX, y: e.clientY, down: true };
  };
  const onPointerUp = (e) => {
    const s = swipeRef.current;
    if (!s.down) return;
    s.down = false;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(e.clientY - s.y)) {
      go(dx < 0 ? 1 : -1);
    }
  };

  const navClass =
    "grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/25 text-white/85 transition hover:border-white/60 hover:bg-white/10 disabled:opacity-25 focus-visible:ring-2 focus-visible:ring-[#B8963E]";

  if (!item) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      tabIndex={-1}
      className={`cs-portal cs-sans fixed inset-0 z-[80] flex flex-col bg-[#100E0B]/[0.97] text-white outline-none backdrop-blur-sm ${
        reducedMotion ? "" : "cs-fade-in"
      }`}
    >
      <div className="flex shrink-0 items-center justify-between px-5 py-4 sm:px-8">
        <p className="text-[13px] tracking-[0.18em] text-white/60" aria-live="polite">
          {index + 1} / {list.length}
        </p>
        <button
          type="button"
          data-autofocus
          onClick={onClose}
          aria-label="Close image viewer"
          className="grid h-10 w-10 place-items-center rounded-full border border-white/25 transition hover:border-white/60 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#B8963E]"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      <div
        className="flex min-h-0 flex-1 items-center justify-center gap-3 px-3 sm:gap-6 sm:px-8"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <button
          type="button"
          className={`${navClass} hidden sm:grid`}
          onClick={() => go(-1)}
          disabled={index === 0}
          aria-label="Previous design"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <figure className="flex h-full min-h-0 min-w-0 flex-col items-center justify-center">
          <SmartImage
            src={item.src}
            alt={item.alt}
            className="min-h-0 flex-1 rounded-[3px]"
            imgClassName="object-contain"
            sizes="(min-width:768px) 55vh, 90vw"
          />
          <figcaption className="mt-3 shrink-0 text-center">
            <h3 id={headingId} className="cs-serif text-lg sm:text-xl">
              {item.name}
            </h3>
            {item.price != null && (
              <p className="mt-0.5 text-[13px] text-white/55">
                {formatPrice(item.price)}
              </p>
            )}
          </figcaption>
        </figure>

        <button
          type="button"
          className={`${navClass} hidden sm:grid`}
          onClick={() => go(1)}
          disabled={index === list.length - 1}
          aria-label="Next design"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* mobile arrows + thumbnail strip */}
      <div className="shrink-0 px-3 pb-4 sm:px-8 sm:pb-6">
        <div className="mb-3 flex justify-center gap-3 sm:hidden">
          <button
            type="button"
            className={navClass}
            onClick={() => go(-1)}
            disabled={index === 0}
            aria-label="Previous design"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            className={navClass}
            onClick={() => go(1)}
            disabled={index === list.length - 1}
            aria-label="Next design"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <ul
          ref={stripRef}
          aria-label="All designs"
          className="cs-noscrollbar mx-auto flex h-14 max-w-4xl gap-2 overflow-x-auto sm:h-16"
        >
          {list.map((thumb, i) => (
            <li key={thumb.id} className="h-full shrink-0">
              <button
                type="button"
                data-active={i === index}
                onClick={() => setIndex(i)}
                aria-current={i === index}
                aria-label={`Show ${thumb.name}, ${i + 1} of ${list.length}`}
                className={`h-full overflow-hidden rounded-[2px] transition focus-visible:ring-2 focus-visible:ring-[#B8963E] ${
                  i === index
                    ? "opacity-100 ring-1 ring-[#B8963E]"
                    : "opacity-45 hover:opacity-80"
                }`}
              >
                <SmartImage src={thumb.src} alt="" className="h-full w-auto" sizes="64px" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- section */

export default function CollectionShowcase({
  title = "The Aurelia Edit",
  subtitle = "Hand-finished 22k gold earrings, cast in small batches.",
  items = DEMO_ITEMS,
  unitLabel = "designs",
  className = "",
}) {
  const reducedMotion = usePrefersReducedMotion();
  const headingId = useId();
  const viewAllRef = useRef(null);

  const [activeId, setActiveId] = useState(items[0]?.id);
  const [showAll, setShowAll] = useState(false);
  const [lightbox, setLightbox] = useState(null); // { list, index }

  const activeItem = useMemo(
    () => items.find((i) => i.id === activeId) || items[0],
    [items, activeId]
  );

  // Two stacked layers give the featured image a real crossfade.
  const [fade, setFade] = useState(() => ({
    slots: [items[0] || null, null],
    front: 0,
  }));
  useEffect(() => {
    if (!activeItem) return;
    setFade((prev) => {
      if (prev.slots[prev.front]?.id === activeItem.id) return prev;
      const front = 1 - prev.front;
      const slots = [...prev.slots];
      slots[front] = activeItem;
      return { slots, front };
    });
  }, [activeItem]);

  const openLightbox = useCallback(
    (id, list = items) => {
      const index = Math.max(
        0,
        list.findIndex((i) => i.id === id)
      );
      setLightbox({ list, index });
    },
    [items]
  );

  const setLightboxIndex = useCallback((updater) => {
    setLightbox((lb) =>
      lb
        ? {
            ...lb,
            index: typeof updater === "function" ? updater(lb.index) : updater,
          }
        : lb
    );
  }, []);

  // Closing the lightbox leaves the section on whatever you last looked at.
  const closeLightbox = useCallback(() => {
    setLightbox((lb) => {
      if (lb) setActiveId(lb.list[lb.index].id);
      return null;
    });
  }, []);

  const closeGrid = useCallback(() => setShowAll(false), []);

  return (
    <section
      aria-labelledby={headingId}
      className={`cs-root cs-sans relative w-full overflow-hidden bg-[#FBF8F3] text-[#14110D] ${className}`}
      style={{ height: "min(100vh, 720px)" }} /* never grows with item count */
    >
      <style>{STYLES}</style>

      <div className="mx-auto flex h-full max-w-7xl flex-col px-5 py-6 sm:px-8 sm:py-8">
        {/* 1 — header */}
        <header className="flex shrink-0 flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b border-[#B8963E]/25 pb-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2
                id={headingId}
                className="cs-serif text-[26px] leading-none tracking-tight sm:text-[34px]"
              >
                {title}
              </h2>
              <Pill>{`${items.length} ${unitLabel}`}</Pill>
            </div>
            <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-[#14110D]/55">
              {subtitle}
            </p>
          </div>

          <button
            ref={viewAllRef}
            type="button"
            onClick={() => setShowAll(true)}
            aria-haspopup="dialog"
            aria-label={`View all ${items.length} ${unitLabel}`}
            className="group inline-flex items-center gap-2 border-b border-[#B8963E]/50 pb-1 text-[12px] uppercase tracking-[0.16em] text-[#7A6636] transition hover:border-[#B8963E] hover:text-[#14110D] focus-visible:ring-2 focus-visible:ring-[#B8963E] focus-visible:ring-offset-4 focus-visible:ring-offset-[#FBF8F3]"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </header>

        {/* 2 — featured: height-driven, so the image never changes the layout */}
        <div className="flex min-h-0 flex-1 items-stretch gap-6 py-5 sm:gap-10 lg:gap-14">
          <button
            type="button"
            onClick={() => activeItem && openLightbox(activeItem.id)}
            aria-haspopup="dialog"
            aria-label={`Open ${activeItem?.name} in fullscreen`}
            className="group relative h-full max-w-full shrink-0 overflow-hidden rounded-[3px] shadow-[0_18px_50px_-28px_rgba(20,17,13,0.45)] outline-none focus-visible:ring-2 focus-visible:ring-[#B8963E] focus-visible:ring-offset-4 focus-visible:ring-offset-[#FBF8F3]"
            style={{ aspectRatio: "4 / 5" }}
          >
            {fade.slots.map(
              (slot, i) =>
                slot && (
                  <span
                    key={i}
                    className={`absolute inset-0 transition-opacity ease-out ${
                      reducedMotion ? "duration-0" : "duration-[600ms]"
                    } ${fade.front === i ? "z-[1] opacity-100" : "z-0 opacity-0"}`}
                  >
                    <SmartImage
                      src={slot.src}
                      alt={slot.alt}
                      ratio={null}
                      className="h-full w-full"
                      imgClassName="transition-transform duration-700 group-hover:scale-[1.03]"
                      sizes="(min-width:1024px) 40vh, 60vh"
                    />
                  </span>
                )
            )}

            {/* caption for narrow screens, where there is no side panel */}
            <span className="absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-[#14110D]/75 to-transparent p-3 text-left md:hidden">
              <span className="cs-serif block truncate text-[15px] text-white">
                {activeItem?.name}
              </span>
              {activeItem?.price != null && (
                <span className="block text-[12px] text-white/70">
                  {formatPrice(activeItem.price)}
                </span>
              )}
            </span>

            <span
              aria-hidden="true"
              className="absolute right-3 top-3 z-[2] hidden h-8 w-8 place-items-center rounded-full bg-white/85 text-[#14110D] opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:grid"
            >
              <ExpandIcon className="h-4 w-4" />
            </span>
          </button>

          {/* details — desktop only; text swaps in place, nothing reflows */}
          <div className="hidden min-w-0 flex-1 self-center md:block">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#B8963E]">
              {activeItem?.tags?.[0] || "Collection"}
            </p>
            <h3 className="cs-serif mt-3 text-[30px] leading-tight lg:text-[38px]">
              {activeItem?.name}
            </h3>
            {activeItem?.price != null && (
              <p className="mt-2 text-[15px] text-[#14110D]/60">
                {formatPrice(activeItem.price)}
              </p>
            )}
            {activeItem?.tags?.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {activeItem.tags.map((t) => (
                  <Pill key={t}>{t}</Pill>
                ))}
              </div>
            )}
            <p className="mt-6 max-w-sm text-[13.5px] leading-relaxed text-[#14110D]/50">
              Hover or drag the strip below to browse the whole collection — the
              page stays exactly where it is.
            </p>
            <button
              type="button"
              onClick={() => activeItem && openLightbox(activeItem.id)}
              aria-haspopup="dialog"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#B8963E]/45 px-4 py-2 text-[12px] uppercase tracking-[0.14em] text-[#7A6636] transition hover:border-[#B8963E] hover:bg-white focus-visible:ring-2 focus-visible:ring-[#B8963E]"
            >
              <ExpandIcon className="h-3.5 w-3.5" />
              View closer
            </button>
          </div>
        </div>

        {/* 3 — filmstrip */}
        <Filmstrip
          items={items}
          activeId={activeItem?.id}
          onPreview={setActiveId}
          onOpen={(id) => openLightbox(id)}
          reducedMotion={reducedMotion}
        />
      </div>

      {/* Lightbox is rendered last so it sits on top of the grid overlay in
          both paint order and the dialog stack (Esc / back hit it first). */}
      {showAll && (
        <GridOverlay
          title={title}
          items={items}
          reducedMotion={reducedMotion}
          onClose={closeGrid}
          onOpenItem={openLightbox}
        />
      )}

      {lightbox && (
        <Lightbox
          list={lightbox.list}
          index={lightbox.index}
          setIndex={setLightboxIndex}
          onClose={closeLightbox}
          reducedMotion={reducedMotion}
        />
      )}
    </section>
  );
}
