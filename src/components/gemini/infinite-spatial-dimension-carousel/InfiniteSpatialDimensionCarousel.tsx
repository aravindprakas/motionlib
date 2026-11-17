import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { AuraSurface } from '@/lib/gemini/AuraSurface';
import { useContainerDimensions, useSpringPhysics } from '@/lib/gemini/hooks';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface SpatialItem { id: string; title: string; subtitle?: string; hue?: number }
export const DEFAULT_SPATIAL_ITEMS: SpatialItem[] = [{ id: 'aether', title: 'Aether', subtitle: 'The space between things', hue: 220 }, { id: 'prism', title: 'Prism', subtitle: 'One light. Many possibilities.', hue: 270 }, { id: 'flux', title: 'Flux', subtitle: 'Nothing stays still', hue: 175 }, { id: 'nova', title: 'Nova', subtitle: 'A quiet kind of energy', hue: 305 }, { id: 'orbit', title: 'Orbit', subtitle: 'Everything is connected', hue: 240 }];
const modulo = (value: number, count: number) => ((value % count) + count) % count;
function SpatialCard({ item, index, count, position, width, selected, onSelect }: { item: SpatialItem; index: number; count: number; position: MotionValue<number>; width: number; selected: boolean; onSelect: () => void }) {
  const reduced = useReducedMotion();
  const distance = useTransform(position, value => modulo(index - value + count / 2, count) - count / 2);
  const transform = useTransform(distance, value => `translate3d(${value * width * .45}px,0,${reduced ? 0 : -Math.abs(value) * width * .22}px) rotateY(${reduced ? 0 : -value * 14}deg)`);
  const opacity = useTransform(distance, value => Math.max(0, 1 - Math.abs(value) * .25));
  const filter = useTransform(distance, value => `blur(${reduced ? 0 : Math.max(0, Math.abs(value) - .7) * 1.3}px)`);
  const zIndex = useTransform(distance, value => Math.round(20 - Math.abs(value) * 3));
  return <motion.div className="aura-carousel-card" style={{ transform, opacity, filter, zIndex, background: `linear-gradient(145deg,hsl(${item.hue ?? 220} 35% 28%),hsl(${(item.hue ?? 220) + 30} 32% 14%))` }} aria-hidden={!selected}><span className="aura-eyebrow">DIMENSION / {String(index + 1).padStart(2, '0')}</span><div className="aura-glass-orb" aria-hidden="true" /><div className="aura-stack"><h3 className="aura-title">{item.title}</h3><p className="aura-label" style={{ color: '#d6dff2' }}>{item.subtitle}</p><button className="aura-button" tabIndex={selected ? 0 : -1} onClick={onSelect}>Explore dimension</button></div></motion.div>;
}
export function InfiniteSpatialDimensionCarousel({ items = DEFAULT_SPATIAL_ITEMS, onSelect }: { items?: SpatialItem[]; onSelect?: (item: SpatialItem) => void }) {
  const { ref, width } = useContainerDimensions<HTMLDivElement>();
  const [activeId, setActiveId] = useState(items[0]?.id ?? '');
  const [message, setMessage] = useState('');
  const position = useMotionValue(0);
  const drag = useRef<{ pointer: number; start: number; position: number; last: number; time: number; velocity: number; moved: boolean } | null>(null);
  const ids = useRef(items.map(item => item.id));
  const spring = useSpringPhysics({ stiffness: 125, damping: 21, onUpdate: point => position.set(point.x) });
  const activeIndex = Math.max(0, items.findIndex(item => item.id === activeId));
  useEffect(() => {
    const nextIds = items.map(item => item.id);
    if (nextIds.join('|') === ids.current.join('|')) return;
    const oldIndex = Math.max(0, ids.current.indexOf(activeId));
    const nextIndex = Math.max(0, nextIds.indexOf(activeId));
    const shift = nextIndex - oldIndex;
    const previousPosition = position.get();
    const normalized = ids.current.length ? modulo(previousPosition, ids.current.length) : 0;
    const nextPosition = normalized + shift;
    spring.jump({ x: nextPosition, y: 0 });
    if (drag.current) drag.current.position += nextPosition - previousPosition;
    if (!nextIds.includes(activeId)) setActiveId(nextIds[0] ?? '');
    ids.current = nextIds;
  }, [items, activeId, position, spring.jump]);
  const navigate = (index: number) => {
    if (!items.length) return;
    setActiveId(items[modulo(index, items.length)].id); spring.setTarget({ x: index, y: 0 });
  };
  return <AuraSurface className="aura-stack"><div ref={ref} className="aura-carousel" role="region" aria-roledescription="carousel" aria-label="Spatial dimensions" tabIndex={0} onKeyDown={event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); event.stopPropagation(); navigate(Math.round(position.get()) + (event.key === 'ArrowRight' ? 1 : -1)); }
  }} onPointerDown={event => {
    if (!items.length || event.target instanceof Element && event.target.closest('button')) return;
    spring.stop(); event.currentTarget.setPointerCapture(event.pointerId); drag.current = { pointer: event.pointerId, start: event.clientX, position: position.get(), last: event.clientX, time: event.timeStamp, velocity: 0, moved: false };
  }} onPointerMove={event => {
    const state = drag.current; if (!state || state.pointer !== event.pointerId || !width) return;
    const scale = Math.max(1, width * .5);
    state.velocity = -(event.clientX - state.last) / scale / Math.max(.008, (event.timeStamp - state.time) / 1000);
    state.last = event.clientX; state.time = event.timeStamp; state.moved ||= Math.abs(event.clientX - state.start) > 6;
    spring.jump({ x: state.position - (event.clientX - state.start) / scale, y: 0 });
  }} onPointerUp={event => {
    const state = drag.current; if (!state) return; drag.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    navigate(Math.round(position.get() + Math.max(-2, Math.min(2, state.velocity * .18))));
  }} onPointerCancel={() => { drag.current = null; navigate(Math.round(position.get())); }} onLostPointerCapture={() => { if (drag.current) { drag.current = null; navigate(Math.round(position.get())); } }}><div className="aura-carousel-scene">{items.map((item, index) => <SpatialCard key={item.id} item={item} index={index} count={items.length} position={position} width={width} selected={index === activeIndex} onSelect={() => { onSelect?.(item); setMessage(`Exploring ${item.title}`); }} />)}{!items.length && <p className="aura-label" style={{ padding: '2rem' }}>Add a dimension to begin.</p>}</div></div>
    <div className="aura-row"><button className="aura-icon-button" aria-label="Previous dimension" disabled={items.length < 2} onClick={() => navigate(Math.round(position.get()) - 1)}><ArrowLeft size={17} /></button><p className="aura-label" aria-live="polite">{items.length ? `${activeIndex + 1} / ${items.length} · ${items[activeIndex]?.title}` : '0 dimensions'}</p><button className="aura-icon-button" aria-label="Next dimension" disabled={items.length < 2} onClick={() => navigate(Math.round(position.get()) + 1)}><ArrowRight size={17} /></button></div><p className="aura-label" role="status">{message || 'Drag to move through the rail. It has no beginning or end.'}</p>
  </AuraSurface>;
}
