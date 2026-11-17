import { useEffect, useRef, useState } from 'react';
import { AuraSurface } from '@/lib/gemini/AuraSurface';
import { useSpringPhysics } from '@/lib/gemini/hooks';

export interface SpatialNavItem { id: string; label: string }
export const DEFAULT_NAV_ITEMS: SpatialNavItem[] = [{ id: 'overview', label: 'Overview' }, { id: 'surfaces', label: 'Surfaces' }, { id: 'motion', label: 'Motion' }, { id: 'system', label: 'System' }];
export function SpatialParallaxNavigationBar({ items = DEFAULT_NAV_ITEMS, onNavigate }: { items?: SpatialNavItem[]; onNavigate?: (item: SpatialNavItem) => void }) {
  const nav = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLDivElement>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const [active, setActive] = useState(items[0]?.id ?? '');
  const [hovered, setHovered] = useState<string | null>(null);
  const [compact, setCompact] = useState(false);
  const targetId = hovered ?? (items.some(item => item.id === active) ? active : items[0]?.id);
  const target = useRef(targetId);
  target.current = targetId;
  const spring = useSpringPhysics({ stiffness: 240, damping: 25, onUpdate: point => {
    if (indicator.current) { indicator.current.style.transform = `translate3d(${point.x}px,0,0)`; indicator.current.style.width = `${Math.max(0, point.y)}px`; }
  } });
  const measureRef = useRef(() => {});
  measureRef.current = () => {
    const element = target.current ? buttons.current.get(target.current) : null;
    if (!element || !nav.current) return;
    spring.setTarget({ x: element.offsetLeft, y: element.offsetWidth });
  };
  useEffect(() => {
    if (!nav.current) return;
    const root = nav.current;
    const observer = new ResizeObserver(() => measureRef.current());
    observer.observe(root); buttons.current.forEach(element => observer.observe(element));
    const mutation = new MutationObserver(() => { buttons.current.forEach(element => observer.observe(element)); measureRef.current(); });
    mutation.observe(root, { childList: true, subtree: true, characterData: true });
    measureRef.current();
    return () => { observer.disconnect(); mutation.disconnect(); };
  }, [items]);
  useEffect(() => { measureRef.current(); }, [targetId, compact]);
  useEffect(() => {
    const scroller = nav.current?.closest<HTMLElement>('[data-aura-scroller]');
    const surface = scroller ?? window;
    let previous = scroller?.scrollTop ?? window.scrollY;
    const scroll = () => {
      const current = scroller?.scrollTop ?? window.scrollY;
      const down = current > previous; if (Math.abs(current - previous) > 3) setCompact(current > 45 && down); previous = current;
    };
    surface.addEventListener('scroll', scroll, { passive: true });
    return () => surface.removeEventListener('scroll', scroll);
  }, []);
  const choose = (item: SpatialNavItem) => {
    setActive(item.id); setHovered(null); onNavigate?.(item);
    buttons.current.get(item.id)?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' });
  };
  return <AuraSurface><div ref={nav} className={`aura-nav ${compact ? 'aura-nav-compact' : ''}`} role="tablist" aria-label="Spatial navigation" onPointerLeave={() => setHovered(null)}><div ref={indicator} className="aura-nav-indicator" aria-hidden="true" />{items.map((item, index) => <button key={item.id} ref={element => { if (element) buttons.current.set(item.id, element); else buttons.current.delete(item.id); }} role="tab" aria-selected={item.id === active || !items.some(value => value.id === active) && index === 0} tabIndex={item.id === active || !items.some(value => value.id === active) && index === 0 ? 0 : -1} data-target={item.id === targetId} title={item.label} onPointerEnter={() => setHovered(item.id)} onFocus={() => setHovered(item.id)} onClick={() => choose(item)} onKeyDown={event => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault(); event.stopPropagation();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length;
    choose(items[next]); buttons.current.get(items[next].id)?.focus();
  }}>{item.label}</button>)}{!items.length && <span className="aura-label" style={{ padding: '1rem' }}>No destinations</span>}</div></AuraSurface>;
}
