import { useRef, useState } from 'react';
import { AuraDemo } from '@/lib/gemini/AuraDemo';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { SpatialParallaxNavigationBar, DEFAULT_NAV_ITEMS } from './SpatialParallaxNavigationBar';
export default function Demo() {
  const [items, setItems] = useState(DEFAULT_NAV_ITEMS);
  const sections = useRef(new Map<string, HTMLElement>());
  const reduced = useReducedMotion();
  return <AuraDemo number="09" title="Spatial parallax navigation bar" description="A liquid pill stretches between destinations on a spring. Scroll down to compress the HUD, or change the links while its tracker stays in motion."><div className="aura-stack"><div className="aura-nav-scroll" data-aura-scroller data-lenis-prevent><div className="aura-nav-sticky"><SpatialParallaxNavigationBar items={items} onNavigate={item => sections.current.get(item.id)?.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' })} /></div>{items.map((item, index) => <section key={item.id} ref={element => { if (element) sections.current.set(item.id, element); else sections.current.delete(item.id); }} className="aura-nav-section aura-stack" style={{ scrollMarginTop: '6rem' }}><span className="aura-eyebrow">0{index + 1} / SPATIAL SYSTEM</span><h3 className="aura-title">{item.label}</h3><p className="aura-label">A destination in the same continuous space. The tracker measures every label again when the available space or collection changes.</p><div className="aura-glass-orb" /></section>)}</div><div className="aura-actions"><button className="aura-button" onClick={() => setItems(previous => [...previous, { id: `link-${previous.length}`, label: `Layer ${previous.length + 1}` }])}>Add link</button><button className="aura-button" disabled={items.length <= 1} onClick={() => setItems(previous => previous.slice(0, -1))}>Remove last link</button></div></div></AuraDemo>;
}
