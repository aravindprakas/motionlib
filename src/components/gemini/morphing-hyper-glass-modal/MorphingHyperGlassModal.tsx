import { useRef, useState, type ReactNode } from 'react';
import { ArrowUpRight, Layers } from 'lucide-react';
import { AuraSurface, FluidCanvas } from '@/lib/gemini/AuraSurface';
import { AuraDialog } from '@/lib/gemini/AuraDialog';

export interface MorphingHyperGlassModalProps { title?: string; triggerLabel?: string; children?: ReactNode }
export function MorphingHyperGlassModal({ title = 'A new dimension of focus', triggerLabel = 'Open spatial layer', children }: MorphingHyperGlassModalProps) {
  const [open, setOpen] = useState(false);
  const origin = useRef<DOMRect | null>(null);
  return <AuraSurface><div className="aura-panel aura-stack" style={{ overflow: 'hidden' }}><FluidCanvas /><div className="aura-stack" style={{ position: 'relative' }}><span className="aura-badge"><Layers size={14} />SPATIAL LAYER</span><h2 className="aura-title">Make room<br />for a deeper thought.</h2><p className="aura-label" style={{ color: '#d6e3fb' }}>The next layer begins exactly where you ask for it.</p><button className="aura-button" style={{ alignSelf: 'start' }} onClick={event => { origin.current = event.currentTarget.getBoundingClientRect(); setOpen(true); }}>{triggerLabel}<ArrowUpRight size={16} /></button></div></div>
    <AuraDialog open={open} onClose={() => setOpen(false)} title={title} origin={origin.current}><div className="aura-modal-body"><div className="aura-panel" style={{ minHeight: '12rem', overflow: 'hidden', display: 'grid', placeItems: 'center' }}><FluidCanvas /><div className="aura-glass-orb" style={{ position: 'relative' }} /></div>{children ?? <><h3 className="aura-title">The world can wait.</h3><p>This glass layer grows from the position of its trigger. Behind it, the rest of the workspace pauses. Inside, there is space to read, scroll and make a decision.</p>{['Material', 'Motion', 'Perspective', 'Continuity'].map((section, index) => <section key={section} className="aura-stack"><span className="aura-eyebrow">0{index + 1} / {section.toUpperCase()}</span><p>Light, depth and motion work together as a single material. Each surface responds to its own container, with a clear focus path and room for content to grow. Scroll within this layer; the page behind it stays in place.</p></section>)}</>}<button className="aura-button aura-button-primary" onClick={() => setOpen(false)}>Return to the workspace</button></div></AuraDialog>
  </AuraSurface>;
}
