import { useState, type ReactNode, type CSSProperties } from 'react';
import { Maximize2, Minimize2, MoveHorizontal, Sparkles } from 'lucide-react';
import { AuraSurface } from '@/lib/gemini/AuraSurface';

export function AuraDemo({ number, title, description, children }: { number: string; title: string; description: string; children: ReactNode }) {
  const [size, setSize] = useState<'fluid' | 'compact' | 'watch'>('fluid');
  return <AuraSurface className="aura-demo">
    <header className="aura-demo-heading"><span className="aura-eyebrow"><Sparkles size={14} /> GEMINI / AURA—10 / {number}</span><h1>{title}</h1><p>{description}</p></header>
    <div className="aura-lab-toolbar"><span className="aura-eyebrow">LIVE SPECIMEN</span><div className="aura-actions" role="group" aria-label="Preview width">
      <button className="aura-icon-button" aria-pressed={size === 'fluid'} onClick={() => setSize('fluid')}><Maximize2 size={14} />Fluid</button>
      <button className="aura-icon-button" aria-pressed={size === 'compact'} onClick={() => setSize('compact')}><Minimize2 size={14} />Sidebar</button>
      <button className="aura-icon-button" aria-pressed={size === 'watch'} onClick={() => setSize('watch')}><MoveHorizontal size={14} />280</button>
    </div></div>
    <div className="aura-lab" style={{ '--lab-width': size === 'compact' ? '20rem' : size === 'watch' ? '17.5rem' : '100%' } as CSSProperties}><div className="aura-lab-content">{children}</div></div>
    <footer className="aura-demo-footer"><span className="aura-dot" /> Pointer, touch & keyboard<span>Container responsive · Motion aware</span></footer>
  </AuraSurface>;
}
