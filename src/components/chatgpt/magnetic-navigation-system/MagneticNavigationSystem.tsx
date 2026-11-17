import { useState, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowUpRight, ChevronRight, Compass, Layers, Settings2, Sparkles } from 'lucide-react';
import { SurfaceState, useInstrumentMotion, type AsyncSurfaceProps } from '@/lib/chatgpt';

export interface MagneticNavItem { id: string; label: string; description: string; icon?: ReactNode; children?: { id: string; label: string; description: string }[] }
export interface MagneticNavigationSystemProps extends AsyncSurfaceProps { items: MagneticNavItem[]; initialId?: string; onNavigate?: (id: string) => void; strength?: number }

function MagneticTarget({ item, active, onSelect, strength }: { item: MagneticNavItem; active: boolean; onSelect: () => void; strength: number }) {
  const x = useMotionValue(0), y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 280, damping: 24 }), springY = useSpring(y, { stiffness: 280, damping: 24 });
  const { reduced } = useInstrumentMotion();
  const reset = () => { x.set(0); y.set(0); };
  return <button className="cg-magnetic-target" aria-pressed={active} onClick={onSelect} onBlur={reset} onPointerLeave={reset} onPointerMove={e => {
    if (reduced || e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2) / Math.max(rect.width / 2, 1), dy = (e.clientY - rect.top - rect.height / 2) / Math.max(rect.height / 2, 1);
    const force = Math.max(0, 1 - Math.hypot(dx, dy) / 1.5) * Math.min(8, Math.max(0, strength));
    x.set(dx * force); y.set(dy * force);
  }}><motion.span style={{ x: springX, y: springY }}>{item.icon ?? <Compass size={22}/>}<span>{item.label}</span></motion.span><i className="cg-orbit-ring"/><span className="cg-magnetic-dot"/></button>;
}

export function MagneticNavigationSystem({ items, initialId, onNavigate, strength = 7, state, onRetry }: MagneticNavigationSystemProps) {
  const [selected, setSelected] = useState(initialId ?? items[0]?.id ?? '');
  const [child, setChild] = useState<string | null>(null);
  const active = items.find(item => item.id === selected) ?? items[0];
  const current = active?.children?.find(item => item.id === child) ?? active;
  const navigate = (id: string) => { setSelected(id); setChild(null); onNavigate?.(id); };
  return <SurfaceState state={state === 'loading' || state === 'error' ? state : items.length ? state : 'empty'} onRetry={onRetry}>
    <section className="cg-magnetic" aria-label="Magnetic navigation system"><div className="cg-between"><span className="cg-eyebrow">AN INVISIBLE PULL. A CLEAR DIRECTION.</span><span className="cg-tag"><Sparkles size={12}/>Spatial navigation</span></div>
      <div className="cg-magnetic-field"><div className="cg-field-lines" aria-hidden="true"><i/><i/><i/></div><nav className="cg-magnetic-dock" aria-label="Workspace destinations">{items.map(item => <MagneticTarget key={item.id} item={item} active={active?.id === item.id} strength={strength} onSelect={() => navigate(item.id)}/>)}</nav></div>
      {active && <div className="cg-nav-destination"><div><span className="cg-eyebrow">YOU ARE HERE / {active.label}</span><h3 aria-live="polite">{current?.label}</h3><p>{current?.description}</p></div><ArrowUpRight size={35}/></div>}
      {!!active?.children?.length && <details className="cg-nested-nav" open><summary>Inside {active.label}<Layers size={15}/></summary><nav aria-label={`${active.label} sections`}>{active.children.map(item => <button key={item.id} aria-current={child === item.id ? 'page' : undefined} onClick={() => { setChild(item.id); onNavigate?.(item.id); }}>{item.label}<ChevronRight size={14}/></button>)}</nav></details>}
      <div className="cg-footnote"><span><Settings2 size={12}/>Move closer. The labels meet you halfway.</span><span>Touch & keyboard have a steady orbit.</span></div>
    </section>
  </SurfaceState>;
}
