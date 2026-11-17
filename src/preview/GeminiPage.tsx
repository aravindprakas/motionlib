import { ArrowDownRight, ArrowUpRight, AudioLines, Command, Fingerprint, GitBranch, Layers, Orbit, PanelTop, Sparkles, Table2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { registry } from '@/lib/registry';
import { AuraSurface, FluidCanvas, AURA_SPRING } from '@/lib/gemini/AuraSurface';
import { useReducedMotion } from '@/lib/useReducedMotion';

const ICONS = [Layers, Command, Table2, Fingerprint, PanelTop, Orbit, GitBranch, AudioLines, PanelTop, Zap];
const entries = registry.find(category => category.key === 'gemini')!.entries;
export function GeminiPage({ onSelect }: { onSelect: (id: string) => void }) {
  const reduced = useReducedMotion();
  return <AuraSurface className="gemini-landing"><div className="aura-row"><span className="aura-eyebrow"><Sparkles size={14} />MOTION LIB / GEMINI</span><span className="aura-badge"><span className="aura-dot" />10 INTERACTIVE COMPONENTS</span></div><header className="gemini-hero"><div><span className="aura-eyebrow">EXPERIMENTS IN LIGHT, DEPTH & MOTION</span><h1>AURA<span>—10.</span></h1><p>A new dimension for your interface. Ten kinetic components shaped from fluid glass, magnetic fields and spring physics. Touch a surface. Follow a signal. Make the system move.</p><button className="aura-button" style={{ marginTop: '1.5rem' }} onClick={() => onSelect(entries[0].id)}>Explore the collection <ArrowDownRight size={17} /></button></div><div className="gemini-emblem" aria-hidden="true"><FluidCanvas /><div className="gemini-orbit" /><div className="gemini-orbit" /><Sparkles /></div></header><div className="gemini-meta"><span>01—10 / THE GEMINI COLLECTION</span><span>REACT + TYPESCRIPT</span><span>CONTAINER RESPONSIVE</span><span>POINTER / TOUCH / KEYBOARD</span></div><div className="gemini-grid">{entries.map((entry, index) => {
    const Icon = ICONS[index];
    return <motion.button key={entry.id} className="gemini-tile" onClick={() => onSelect(entry.id)} whileHover={reduced ? undefined : { y: -3 }} whileTap={reduced ? undefined : { scale: .99 }} transition={AURA_SPRING}><div className="gemini-tile-top"><Icon size={27} strokeWidth={1.25} /><span className="aura-eyebrow">{String(index + 1).padStart(2, '0')} / 10</span></div><h2>{entry.name}</h2><p>{entry.description}</p><div className="gemini-tile-bottom"><span>{entry.tags.join(' / ')}</span><ArrowUpRight size={19} /></div></motion.button>;
  })}</div><footer className="aura-demo-footer"><span className="aura-dot" />Each surface is a live experiment.<span>GEMINI / AURA—10</span></footer></AuraSurface>;
}
