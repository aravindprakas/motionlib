import { useEffect, useId, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Command, Layers, Search, Sparkles, Workflow, Zap } from 'lucide-react';
import { AuraSurface, AURA_SPRING } from '@/lib/gemini/AuraSurface';
import { AuraDialog } from '@/lib/gemini/AuraDialog';
import { useSpringPhysics } from '@/lib/gemini/hooks';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface AuraCommand { id: string; title: string; detail?: string; shortcut?: string; onSelect?: () => void }
export const DEFAULT_COMMANDS: AuraCommand[] = [
  { id: 'surface', title: 'Create a glass surface', detail: 'Start from a kinetic material', shortcut: 'G' },
  { id: 'flow', title: 'Open the motion workspace', detail: 'Springs, gestures and shared timing', shortcut: 'M' },
  { id: 'layers', title: 'Inspect spatial layers', detail: 'Find what lives beneath the interface', shortcut: 'L' },
  { id: 'export', title: 'Export component tokens', detail: 'Bring the atmosphere to your product', shortcut: 'E' },
];
function MagneticNode({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();
  const spring = useSpringPhysics({ stiffness: 220, damping: 19, onUpdate: point => { if (ref.current) ref.current.style.transform = `translate3d(${point.x}px,${point.y}px,0) scale(${1 + Math.hypot(point.x, point.y) / 140})`; } });
  return <button ref={ref} className="aura-icon-button" onClick={onClick} aria-label={label} onPointerMove={event => {
    if (reduced || event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect(); spring.setTarget({ x: (event.clientX - rect.x - rect.width / 2) * .22, y: (event.clientY - rect.y - rect.height / 2) * .22 });
  }} onPointerLeave={() => spring.setTarget({ x: 0, y: 0 })}>{children}</button>;
}
export function MagneticHolographicCommandPalette({ commands = DEFAULT_COMMANDS, onCommand }: { commands?: AuraCommand[]; onCommand?: (command: AuraCommand) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState('Ready for a command');
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const id = useId();
  const reduced = useReducedMotion();
  const filtered = commands.filter(command => `${command.title} ${command.detail ?? ''}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const index = Math.min(active, Math.max(0, filtered.length - 1));
  const execute = (command: AuraCommand) => { command.onSelect?.(); onCommand?.(command); setSelected(command.title); setOpen(false); };
  const executeRef = useRef(execute);
  executeRef.current = execute;
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); setOpen(value => !value); return;
      }
      if (event.target instanceof HTMLElement && event.target.closest('input,textarea,select,[contenteditable=true]')) return;
      if (document.querySelector('[aria-modal=true]')) return;
      const command = commands.find(item => item.shortcut?.toLowerCase() === event.key.toLowerCase());
      if (command && !event.ctrlKey && !event.metaKey && !event.altKey) { event.preventDefault(); executeRef.current(command); }
    };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, [commands]);
  useEffect(() => { if (open) { setQuery(''); setActive(0); requestAnimationFrame(() => input.current?.focus()); } }, [open]);
  useEffect(() => {
    const node = list.current?.querySelector<HTMLElement>('[aria-selected=true]');
    node?.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
  }, [index, query, reduced]);
  return <AuraSurface className="aura-stack"><div className="aura-panel aura-stack"><div className="aura-row"><span className="aura-badge"><Command size={14} />COMMAND INTERFACE</span><kbd className="aura-label">⌘ / Ctrl K</kbd></div><h2 className="aura-title">One thought.<br />Every possibility.</h2><p className="aura-label">Search actions, or pull a command from the magnetic dock.</p><button className="aura-button" onClick={() => setOpen(true)}><Search size={16} />Find a command</button><p className="aura-label" role="status">{selected}</p></div>
    <div className="aura-dock"><MagneticNode label="Open commands" onClick={() => setOpen(true)}><Command size={21} /></MagneticNode><MagneticNode label="Create surface" onClick={() => commands[0] && execute(commands[0])}><Sparkles size={21} /></MagneticNode><MagneticNode label="Motion workspace" onClick={() => commands[1] && execute(commands[1])}><Workflow size={21} /></MagneticNode><MagneticNode label="Inspect layers" onClick={() => commands[2] && execute(commands[2])}><Layers size={21} /></MagneticNode></div>
    <AuraDialog open={open} onClose={() => setOpen(false)} title="Holographic command palette"><div className="aura-dialog-header"><Search size={18} /><input ref={input} placeholder="Where should we go?" aria-label="Search commands" role="combobox" aria-expanded="true" aria-controls={id} aria-activedescendant={filtered[index] ? `${id}-${filtered[index].id}` : undefined} aria-autocomplete="list" value={query} onChange={event => { setQuery(event.target.value); setActive(0); }} onKeyDown={event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); event.stopPropagation(); setActive(value => filtered.length ? (value + (event.key === 'ArrowDown' ? 1 : -1) + filtered.length) % filtered.length : 0); }
      if (event.key === 'Enter' && filtered[index]) { event.preventDefault(); execute(filtered[index]); }
    }} /></div><div ref={list} id={id} className="aura-command-list" role="listbox" aria-label="Commands">{filtered.map((command, i) => <motion.button key={command.id} id={`${id}-${command.id}`} className="aura-command-item" role="option" aria-selected={i === index} tabIndex={-1} onPointerMove={() => setActive(i)} onClick={() => execute(command)} whileTap={reduced ? undefined : { scale: .99 }} transition={AURA_SPRING}><Zap size={18} /><span style={{ flex: 1 }}>{command.title}<span className="aura-label" style={{ display: 'block' }}>{command.detail}</span></span>{command.shortcut && <kbd className="aura-label">{command.shortcut}</kbd>}</motion.button>)}{!filtered.length && <p className="aura-label" style={{ padding: '1rem' }}>No commands match your search.</p>}</div><div className="aura-dialog-header aura-label">↑ ↓ Navigate · Enter Select · Esc Close</div></AuraDialog>
  </AuraSurface>;
}
