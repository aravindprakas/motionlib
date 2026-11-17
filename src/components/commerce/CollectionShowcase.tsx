import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface CollectionItem {
  id: string | number;
  src: string;
  alt: string;
  name: string;
  price?: number | string;
  tags?: string[];
}

export interface CollectionShowcaseProps {
  title?: string;
  subtitle?: string;
  items?: CollectionItem[];
}

const categories = ['Studs', 'Jhumkas', 'Hoops', 'Drops'];
const names = ['Gulab Petal', 'Chandni Crescent', 'Meher Pearl', 'Tara Solitaire', 'Padma Bloom', 'Noor Filigree', 'Amara Dew', 'Sona Heritage', 'Ira Lotus', 'Ziya Halo'];
const demoItems: CollectionItem[] = Array.from({ length: 50 }, (_, i) => ({
  id: `earring-${i + 1}`,
  src: `https://picsum.photos/seed/${i + 1}/600/750`,
  alt: `Placeholder photograph for ${names[i % names.length]} ${categories[i % 4]}`,
  name: `${names[i % names.length]} ${categories[i % 4]}`,
  price: 12900 + i * 750,
  tags: [categories[i % 4], i % 3 ? 'Everyday' : 'Occasion'],
}));
const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const price = (value: CollectionItem['price']) => typeof value === 'number' ? currency.format(value) : value;
const wrap = (index: number, length: number) => (index % length + length) % length;
const css = `
.collection-showcase{--gold:#B8963E;background:#faf7f0;color:#211e19;font-family:Inter,ui-sans-serif,system-ui,sans-serif}
.collection-showcase *{box-sizing:border-box}
.collection-showcase .cs-serif{font-family:Georgia,'Times New Roman',serif}
.collection-showcase :focus-visible{outline:2px solid var(--gold);outline-offset:3px}
.collection-showcase button:disabled{opacity:.35;cursor:default}
.cs-section{height:min(100vh,720px);height:min(100svh,720px);display:grid;grid-template-rows:auto minmax(0,1fr) auto;overflow:hidden;gap:clamp(8px,2vh,20px)}
.collection-showcase .cs-photo{position:relative;aspect-ratio:4/5;overflow:hidden;background:#eee8dc}
.collection-showcase .cs-photo img{display:block;width:100%;height:100%;object-fit:cover;transition:opacity .35s,transform .5s}
.collection-showcase .cs-photo:hover img{transform:scale(1.03)}
.collection-showcase .cs-shimmer{position:absolute;inset:0;background:linear-gradient(100deg,#eee8dc 20%,#f8f4eb 45%,#eee8dc 70%);background-size:220% 100%;animation:collection-shimmer 1.5s linear infinite}
.collection-showcase .cs-strip{display:flex;gap:10px;overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:none;scroll-snap-type:x mandatory;cursor:grab;touch-action:pan-x pan-y}
.collection-showcase .cs-strip::-webkit-scrollbar{display:none}
.collection-showcase .cs-strip[data-dragging=true]{cursor:grabbing;scroll-snap-type:none}
.collection-showcase .cs-thumb{flex:0 0 58px;scroll-snap-align:center;border:1px solid transparent;padding:3px;border-radius:3px}
.collection-showcase .cs-thumb[aria-current=true]{border-color:var(--gold)}
.collection-showcase .cs-icon{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;width:44px;height:44px;border:1px solid #d8cdb6;border-radius:50%;background:#faf7f0}
.collection-showcase .cs-icon:hover:not(:disabled){background:#efe8d9}
.cs-overlay{position:fixed;inset:0;z-index:9999;overflow:hidden;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}
.collection-showcase .cs-product-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
@media(min-width:640px){.collection-showcase .cs-product-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(min-width:1024px){.collection-showcase .cs-product-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media(min-width:1440px){.collection-showcase .cs-product-grid{grid-template-columns:repeat(5,minmax(0,1fr))}}
@media(min-width:1800px){.collection-showcase .cs-product-grid{grid-template-columns:repeat(6,minmax(0,1fr))}}
@media(max-height:520px){.cs-section{gap:6px;padding-top:8px;padding-bottom:8px}.collection-showcase .cs-thumb{flex-basis:38px}.collection-showcase .cs-subtitle{display:none}}
@keyframes collection-shimmer{to{background-position:-220% 0}}
@media(prefers-reduced-motion:reduce){.collection-showcase *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
`;

function Icon({ direction }: { direction: 'prev' | 'next' | 'close' }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={direction === 'close' ? 'm6 6 12 12M18 6 6 18' : direction === 'prev' ? 'm14 6-6 6 6 6' : 'm10 6 6 6-6 6'} /></svg>;
}

function Photo({ item, className = '', onReady }: { item: CollectionItem; className?: string; onReady?: () => void }) {
  const [status, setStatus] = useState('loading');
  const ref = useRef<HTMLImageElement>(null);
  const ready = useRef(onReady);
  ready.current = onReady;
  const finish = useCallback((success: boolean) => { setStatus(success ? 'loaded' : 'error'); ready.current?.(); }, []);
  useEffect(() => { if (ref.current?.complete) finish(ref.current.naturalWidth > 0); }, [finish]);
  return <div className={`cs-photo ${className}`}>
    {status === 'loading' && <span className="cs-shimmer" aria-hidden="true" />}
    <img ref={ref} src={item.src} alt={item.alt || item.name} loading="lazy" decoding="async" draggable={false} onLoad={() => finish(true)} onError={() => finish(false)} style={{ opacity: status === 'loaded' ? 1 : 0 }} />
    {status === 'error' && <span className="absolute inset-0 flex items-center justify-center p-2 text-center text-xs text-stone-600">Image unavailable</span>}
  </div>;
}

// Retain one outgoing frame while the incoming image loads and fades in.
function FeaturedPhoto({ item }: { item: CollectionItem }) {
  const [frame, setFrame] = useState<{ current: CollectionItem; previous?: CollectionItem }>({ current: item });
  const [ready, setReady] = useState(false);
  if (frame.current.id !== item.id || frame.current.src !== item.src) {
    setFrame({ current: item, previous: frame.current });
    setReady(false);
  }
  return <div className="cs-photo h-full max-w-full" style={{ aspectRatio: '4 / 5' }}>
    {frame.previous && <div className="absolute inset-0" aria-hidden="true"><Photo key={`${frame.previous.id}:${frame.previous.src}`} item={frame.previous} className="h-full w-full" /></div>}
    {!ready && !frame.previous && <span className="cs-shimmer" aria-hidden="true" />}
    <div className="absolute inset-0 transition-opacity duration-500" style={{ opacity: ready ? 1 : 0 }}><Photo key={`${item.id}:${item.src}`} item={item} className="h-full w-full" onReady={() => setReady(true)} /></div>
  </div>;
}

interface StripProps {
  items: CollectionItem[];
  active: number;
  onSelect: (index: number) => void;
  onOpen?: (index: number, trigger: HTMLElement) => void;
  followActive?: boolean;
}

function Filmstrip({ items, active, onSelect, onOpen, followActive = false }: StripProps) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number } | null>(null);
  const suppress = useRef(false);
  const [scroll, setScroll] = useState({ progress: 0, fraction: 1 });
  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setScroll({ progress: max > 0 ? Math.max(0, Math.min(1, el.scrollLeft / max)) : 0, fraction: el.scrollWidth ? Math.min(1, el.clientWidth / el.scrollWidth) : 1 });
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    const wheel = (event: WheelEvent) => {
      if (!event.shiftKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? el.clientWidth : 1;
      const next = Math.max(0, Math.min(el.scrollWidth - el.clientWidth, el.scrollLeft + event.deltaY * unit));
      if (next !== el.scrollLeft) { event.preventDefault(); el.scrollLeft = next; }
    };
    el.addEventListener('wheel', wheel, { passive: false });
    return () => { observer.disconnect(); el.removeEventListener('wheel', wheel); };
  }, [items.length, measure]);
  useEffect(() => {
    const el = ref.current;
    const child = el?.children[active] as HTMLElement | undefined;
    if (!followActive || !el || !child || drag.current) return;
    if (child.offsetLeft < el.scrollLeft) el.scrollLeft = child.offsetLeft;
    else if (child.offsetLeft + child.offsetWidth > el.scrollLeft + el.clientWidth) el.scrollLeft = child.offsetLeft + child.offsetWidth - el.clientWidth;
  }, [active, followActive]);
  const move = (direction: number) => ref.current?.scrollBy({ left: direction * ref.current.clientWidth * .75, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  return <div className="min-w-0">
    <div className="flex items-center gap-2 sm:gap-4">
      <button type="button" className="cs-icon" aria-label="Scroll thumbnails backward" disabled={scroll.fraction >= 1 || scroll.progress <= .001} onClick={() => move(-1)}><Icon direction="prev" /></button>
      <div ref={ref} className="cs-strip relative min-w-0 flex-1 py-1" role="group" aria-label="Design thumbnails" onScroll={measure}
        onPointerDown={event => { suppress.current = false; if (event.pointerType === 'mouse' && event.button === 0) drag.current = { x: event.clientX, left: event.currentTarget.scrollLeft }; }}
        onPointerMove={event => { if (!drag.current) return; const dx = event.clientX - drag.current.x; if (Math.abs(dx) > 5) { suppress.current = true; event.currentTarget.dataset.dragging = 'true'; event.currentTarget.setPointerCapture(event.pointerId); event.currentTarget.scrollLeft = drag.current.left - dx; } }}
        onPointerUp={event => { drag.current = null; event.currentTarget.dataset.dragging = 'false'; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
        onPointerCancel={event => { drag.current = null; event.currentTarget.dataset.dragging = 'false'; }}
        onPointerLeave={() => { if (!suppress.current) drag.current = null; }}
        onClickCapture={event => { if (suppress.current) { event.preventDefault(); event.stopPropagation(); suppress.current = false; } }}>
        {items.map((item, index) => <button type="button" key={item.id} className="cs-thumb" aria-label={`${onOpen ? 'Open' : 'Show'} ${item.name}, ${index + 1} of ${items.length}`} aria-current={index === active ? 'true' : undefined} tabIndex={index === active ? 0 : -1}
          onMouseEnter={() => { if (!drag.current && !followActive) onSelect(index); }} onFocus={() => onSelect(index)}
          onClick={event => { onSelect(index); onOpen?.(index, event.currentTarget); }}
          onKeyDown={event => { const keys: Record<string, number> = { ArrowLeft: wrap(index - 1, items.length), ArrowRight: wrap(index + 1, items.length), Home: 0, End: items.length - 1 }; if (!(event.key in keys)) return; event.preventDefault(); event.stopPropagation(); onSelect(keys[event.key]); const target = ref.current?.children[keys[event.key]] as HTMLElement | undefined; target?.focus({ preventScroll: true }); target?.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }}>
          <Photo key={`${item.id}:${item.src}`} item={item} className="w-full" />
        </button>)}
      </div>
      <button type="button" className="cs-icon" aria-label="Scroll thumbnails forward" disabled={scroll.fraction >= 1 || scroll.progress >= .999} onClick={() => move(1)}><Icon direction="next" /></button>
    </div>
    <div className="mx-14 mt-2 h-px overflow-hidden bg-stone-200" aria-hidden="true"><div className="h-full bg-[#B8963E]" style={{ width: `${scroll.fraction * 100}%`, marginLeft: `${scroll.progress * (1 - scroll.fraction) * 100}%` }} /></div>
  </div>;
}

type Overlay = { view: 'grid' | 'lightbox'; depth: number };

export default function CollectionShowcase({ title = 'A little gold. A lasting impression.', subtitle = 'Discover earrings for everyday rituals and extraordinary evenings.', items = demoItems }: CollectionShowcaseProps) {
  const id = useId();
  const historyKey = `collection-showcase-${id}`;
  const [activeIndex, setActiveIndex] = useState(0);
  const [filter, setFilter] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const section = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const currentOverlay = useRef<Overlay | null>(null);
  const closing = useRef(false);
  const triggers = useRef<HTMLElement[]>([]);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const active = Math.min(activeIndex, Math.max(0, items.length - 1));
  const item = items[active];
  const tags = useMemo(() => [...new Set(items.flatMap(product => product.tags || []))], [items]);
  const filtered = filter ? items.filter(product => product.tags?.includes(filter)) : items;
  const isOpen = !!overlay;
  const lightbox = overlay?.view === 'lightbox';
  useEffect(() => { if (filter && !tags.includes(filter)) setFilter(null); }, [tags, filter]);

  const open = (view: Overlay['view'], trigger: HTMLElement, index?: number) => {
    if (index !== undefined) setActiveIndex(index);
    const next = { view, depth: (currentOverlay.current?.depth || 0) + 1 };
    triggers.current[next.depth - 1] = trigger;
    window.history.pushState({ ...window.history.state, [historyKey]: next }, '');
    currentOverlay.current = next;
    setOverlay(next);
  };
  const close = useCallback(() => { if (currentOverlay.current && !closing.current) { closing.current = true; window.history.back(); } }, []);
  useEffect(() => {
    const pop = (event: PopStateEvent) => {
      const next: Overlay | null = event.state?.[historyKey] || null;
      const previous = currentOverlay.current;
      closing.current = false;
      currentOverlay.current = next;
      setOverlay(next);
      if (previous && (!next || next.depth < previous.depth)) {
        const trigger = triggers.current[previous.depth - 1];
        requestAnimationFrame(() => {
          // Grid nodes are remounted when returning from its lightbox.
          const restored = next?.view === 'grid' && trigger?.dataset.productId
            ? Array.from(dialog.current?.querySelectorAll<HTMLElement>('[data-product-id]') || []).find(node => node.dataset.productId === trigger.dataset.productId)
            : null;
          (trigger?.isConnected ? trigger : restored || dialog.current || section.current)?.focus({ preventScroll: true });
        });
      }
    };
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, [historyKey]);

  // Fixed-body locking also prevents background scrolling on mobile Safari.
  useEffect(() => {
    if (!isOpen) return;
    const body = document.body;
    const root = document.documentElement;
    const y = window.scrollY;
    const saved = { position: body.style.position, top: body.style.top, width: body.style.width, overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    const rootOverflow = root.style.overflow;
    const behavior = root.style.scrollBehavior;
    body.style.paddingRight = `${parseFloat(getComputedStyle(body).paddingRight) + window.innerWidth - root.clientWidth}px`;
    Object.assign(body.style, { position: 'fixed', top: `-${y}px`, width: '100%', overflow: 'hidden' });
    root.style.overflow = 'hidden';
    const states = new Map<HTMLElement, boolean>();
    const inert = () => { for (const node of body.children) { if (!(node instanceof HTMLElement) || node === dialog.current) continue; if (!states.has(node)) states.set(node, node.inert); node.inert = true; } };
    inert();
    const observer = new MutationObserver(inert);
    observer.observe(body, { childList: true });
    return () => { observer.disconnect(); states.forEach((value, node) => { node.inert = value; }); Object.assign(body.style, saved); root.style.overflow = rootOverflow; root.style.scrollBehavior = 'auto'; window.scrollTo(0, y); root.style.scrollBehavior = behavior; };
  }, [isOpen]);

  useEffect(() => {
    const el = dialog.current;
    if (!overlay || !el) return;
    const controls = () => Array.from(el.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter(node => node.getClientRects().length);
    (controls()[0] || el).focus({ preventScroll: true });
    const focus = (event: FocusEvent) => { if (!el.contains(event.target as Node)) (controls()[0] || el).focus({ preventScroll: true }); };
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      if (event.key !== 'Tab') return;
      const nodes = controls();
      if (!nodes.length) { event.preventDefault(); el.focus(); }
      else if (event.shiftKey && (document.activeElement === nodes[0] || document.activeElement === el)) { event.preventDefault(); nodes[nodes.length - 1].focus(); }
      else if (!event.shiftKey && document.activeElement === nodes[nodes.length - 1]) { event.preventDefault(); nodes[0].focus(); }
    };
    document.addEventListener('focusin', focus);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('focusin', focus); document.removeEventListener('keydown', key); };
  }, [overlay, close]);

  // Explicit preloading is limited to the lightbox's two neighbors.
  useEffect(() => {
    if (!lightbox || items.length < 2) return;
    const links = [...new Set([wrap(active - 1, items.length), wrap(active + 1, items.length)])].map(index => {
      const link = document.createElement('link'); link.rel = 'preload'; link.as = 'image'; link.href = items[index].src; document.head.appendChild(link); return link;
    });
    return () => links.forEach(link => link.remove());
  }, [lightbox, active, items]);
  const navigate = (direction: number) => { if (items.length) setActiveIndex(wrap(active + direction, items.length)); };

  return <>
    <style>{css}</style>
    <section ref={section} className="collection-showcase cs-section w-full px-4 py-5 sm:px-8 sm:py-7 lg:px-12" aria-labelledby={`${id}-title`} tabIndex={-1}>
      <header className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0"><div className="mb-2 flex items-center gap-3"><span className="text-[10px] uppercase tracking-[.22em] text-stone-500">The collection</span><span className="rounded-full border border-[#B8963E]/35 px-2.5 py-1 text-[10px]">{items.length} {items.length === 1 ? 'design' : 'designs'}</span></div><h2 id={`${id}-title`} className="cs-serif line-clamp-2 text-2xl font-normal sm:text-3xl">{title}</h2><p className="cs-subtitle mt-2 line-clamp-2 max-w-xl text-xs leading-relaxed text-stone-600 sm:text-sm">{subtitle}</p></div>
        <button type="button" className="min-h-11 shrink-0 border-b border-[#B8963E] px-1 text-sm" aria-label={`View all ${items.length} designs`} onClick={event => open('grid', event.currentTarget)}>View all <span aria-hidden="true">↗</span></button>
      </header>
      {item ? <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] justify-items-center gap-3"><button type="button" className="min-h-0 max-w-full" style={{ height: '100%', aspectRatio: '4 / 5' }} aria-label={`Open ${item.name} in lightbox`} onClick={event => open('lightbox', event.currentTarget, active)}><FeaturedPhoto item={item} /></button><div className="max-w-full text-center" aria-live="polite" aria-atomic="true"><h3 className="cs-serif truncate text-lg sm:text-xl">{item.name}</h3>{item.price != null && <p className="mt-1 text-xs text-stone-600">{price(item.price)}</p>}</div></div> : <p className="self-center text-center text-sm text-stone-500">New designs are on their way.</p>}
      {items.length > 0 ? <Filmstrip items={items} active={active} onSelect={setActiveIndex} onOpen={(index, trigger) => open('lightbox', trigger, index)} /> : <div />}
    </section>
    {overlay && createPortal(<div ref={dialog} className="collection-showcase cs-overlay flex flex-col" role="dialog" aria-modal="true" aria-labelledby={`${id}-dialog`} tabIndex={-1} onKeyDown={event => { if (!lightbox || event.altKey || event.ctrlKey || event.metaKey) return; if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); navigate(event.key === 'ArrowLeft' ? -1 : 1); } }}>
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-stone-200 px-4 py-3 sm:px-8"><div className="min-w-0"><h2 id={`${id}-dialog`} className="cs-serif truncate text-xl sm:text-2xl">{lightbox ? 'A closer look' : title}</h2><p className="mt-1 text-xs text-stone-500" aria-live="polite" aria-atomic="true">{lightbox ? `${items.length ? active + 1 : 0} / ${items.length}` : `${filtered.length} ${filtered.length === 1 ? 'design' : 'designs'}`}</p></div><button type="button" className="cs-icon" aria-label={lightbox ? 'Close lightbox' : 'Close all designs'} onClick={close}><Icon direction="close" /></button></header>
      {lightbox ? item ? <>
        <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] gap-3 px-3 py-3 sm:px-8"><div className="flex min-h-0 items-center justify-center gap-2 sm:gap-8"><button type="button" className="cs-icon" aria-label="Previous design" disabled={items.length < 2} onClick={() => navigate(-1)}><Icon direction="prev" /></button><div className="flex h-full min-w-0 flex-1 justify-center" style={{ touchAction: 'pan-y pinch-zoom' }} onTouchStart={event => { swipe.current = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null; }} onTouchMove={event => { if (event.touches.length > 1) swipe.current = null; }} onTouchCancel={() => { swipe.current = null; }} onTouchEnd={event => { const start = swipe.current; swipe.current = null; if (!start || !event.changedTouches.length) return; const dx = event.changedTouches[0].clientX - start.x; const dy = event.changedTouches[0].clientY - start.y; if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) navigate(dx < 0 ? 1 : -1); }}><FeaturedPhoto item={item} /></div><button type="button" className="cs-icon" aria-label="Next design" disabled={items.length < 2} onClick={() => navigate(1)}><Icon direction="next" /></button></div><div className="text-center" aria-live="polite" aria-atomic="true"><h3 className="cs-serif line-clamp-2 text-xl">{item.name}</h3>{item.price != null && <p className="mt-1 text-sm text-stone-600">{price(item.price)}</p>}</div></div>
        <div className="shrink-0 px-4 pb-4 sm:px-8"><Filmstrip items={items} active={active} onSelect={setActiveIndex} followActive /></div>
      </> : <p className="m-auto p-8 text-sm">No designs available.</p> : <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="sticky top-0 z-10 flex flex-wrap gap-2 border-b border-stone-200 bg-[#faf7f0] px-4 py-4 sm:px-8" role="group" aria-label="Filter designs by tag">{[null, ...tags].map(tag => <button type="button" key={tag ?? '__all'} aria-pressed={filter === tag} onClick={() => setFilter(tag)} className={`min-h-11 rounded-full border px-4 text-xs transition-colors ${filter === tag ? 'border-[#B8963E] bg-[#B8963E]/10 text-stone-900' : 'border-stone-300 text-stone-600 hover:border-[#B8963E]'}`}>{tag ?? 'All designs'}</button>)}</div>
        <div className="cs-product-grid gap-x-4 gap-y-8 p-4 sm:gap-x-6 sm:p-8">{filtered.map(product => <button type="button" key={product.id} data-product-id={String(product.id)} className="group min-w-0 text-left" aria-label={`Open ${product.name}${product.price != null ? `, ${price(product.price)}` : ''}`} onClick={event => open('lightbox', event.currentTarget, items.indexOf(product))}><Photo key={`${product.id}:${product.src}`} item={product} className="w-full rounded-sm transition-shadow group-hover:shadow-md" /><h3 className="cs-serif mt-3 text-base sm:text-lg">{product.name}</h3>{product.price != null && <p className="mt-1 text-xs text-stone-600">{price(product.price)}</p>}</button>)}</div>
        {!filtered.length && <p className="p-12 text-center text-sm text-stone-500">No designs match this filter.</p>}
      </div>}
    </div>, document.body)}
  </>;
}
