import { useRef, type ReactNode } from 'react';
import { ArrowUpRight, Fingerprint } from 'lucide-react';
import { AuraSurface, FluidCanvas } from '@/lib/gemini/AuraSurface';
import { useSpringPhysics } from '@/lib/gemini/hooks';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface KineticFluidGlassCardProps { title?: string; description?: string; label?: string; children?: ReactNode; onActivate?: () => void }
export function KineticFluidGlassCard({ title = 'Interfaces that feel alive.', description = 'A surface with its own atmosphere. Move across the glass to bend the light.', label = 'KINETIC SURFACE / 001', children, onActivate }: KineticFluidGlassCardProps) {
  const card = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: .5, y: .5 });
  const energy = useRef(0);
  const last = useRef({ x: .5, y: .5, time: 0 });
  const reduced = useReducedMotion();
  const spring = useSpringPhysics({ stiffness: 160, damping: 22, onUpdate: point => {
    if (card.current) card.current.style.transform = `rotateX(${point.y}deg) rotateY(${point.x}deg)`;
  } });
  return <AuraSurface className="aura-glass-card"><div ref={card} className="aura-glass-card-inner" onPointerMove={event => {
    if (reduced || event.pointerType === 'touch') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    const elapsed = Math.max(event.timeStamp - last.current.time, 16) / 1000;
    energy.current = Math.min(1, Math.hypot(x - last.current.x, y - last.current.y) / elapsed * .15);
    last.current = { x, y, time: event.timeStamp }; pointer.current = { x, y };
    event.currentTarget.style.setProperty('--mx', `${x * 100}%`); event.currentTarget.style.setProperty('--my', `${y * 100}%`);
    spring.setTarget({ x: (x - .5) * 14, y: (.5 - y) * 14 });
  }} onPointerLeave={() => { energy.current = 0; pointer.current = { x: .5, y: .5 }; spring.setTarget({ x: 0, y: 0 }); }}>
    <FluidCanvas pointer={pointer} energy={energy} /><div className="aura-row"><span className="aura-badge"><Fingerprint size={15} />{label}</span><ArrowUpRight size={20} /></div>
    <div className="aura-glass-orb" aria-hidden="true" /><div className="aura-stack"><h2 className="aura-title">{title}</h2><p className="aura-label" style={{ color: '#d6e3fb', maxWidth: '38ch' }}>{description}</p>{children}</div>
    {onActivate && <button className="aura-button" onClick={onActivate}>Explore surface <ArrowUpRight size={15} /></button>}
  </div></AuraSurface>;
}
