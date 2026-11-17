import { useCallback, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Check, ChevronDown, LayoutGrid, Maximize2, Pin, X } from 'lucide-react';
import { SurfaceState, useInstrumentMotion, type AsyncSurfaceProps } from '@/lib/chatgpt';

export interface WorkspacePanel { id: string; title: string; subtitle: string; value: string; change: string; items: { id: string; label: string; detail: string; done?: boolean }[] }
export interface LivingCommandCenterProps extends AsyncSurfaceProps { panels: WorkspacePanel[]; onAction?: (panelId: string, itemId: string) => void }

export function LivingCommandCenter({ panels, state, onRetry, onAction }: LivingCommandCenterProps) {
  const [focused, setFocused] = useState<string | null>(null);
  const [docked, setDocked] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [floating, setFloating] = useState<string | null>(null);
  const [completed, setCompleted] = useState<string[]>(() => panels.flatMap(panel => panel.items.filter(item => item.done).map(item => item.id)));
  const controls = useRef(new Map<string, HTMLButtonElement>());
  const restoreFocus = useRef<string | null>(null);
  const focusDetail = useCallback((node: HTMLDivElement | null) => node?.focus(), []);
  const { reduced, transition } = useInstrumentMotion();
  const current = panels.find(panel => panel.id === focused);
  const ordered = useMemo(() => [...panels].sort((a, b) => Number(docked.includes(a.id)) - Number(docked.includes(b.id))), [panels, docked]);
  const toggle = (id: string, list: string[], update: (value: string[]) => void) => update(list.includes(id) ? list.filter(value => value !== id) : [...list, id]);
  const close = () => { restoreFocus.current = focused; setFocused(null); };
  return <SurfaceState state={state === 'loading' || state === 'error' ? state : panels.length ? state : 'empty'} onRetry={onRetry}>
    <section className="cg-command-center" aria-label="Living command center" onKeyDown={e => { if (e.key === 'Escape') { close(); setFloating(null); } }}>
      <div className="cg-workspace-heading"><div><span className="cg-eyebrow">MONDAY, IN MOTION</span><h3>A clearer view of<br/><em>what comes next.</em></h3></div><span className="cg-live"><i/>Workspace healthy</span></div>
      <div className="cg-workspace-tools"><span>{current ? `Workspace / ${current.title}` : 'Your overview'}</span><button className="cg-button cg-small" onClick={close}><LayoutGrid size={14}/>Overview</button></div>
      <AnimatePresence mode="wait" initial={false}>
        {current ? <motion.div key={current.id} className="cg-panel-detail" tabIndex={-1} ref={focusDetail} role="region" aria-label={`${current.title} detail`} initial={reduced ? false : { opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={transition}>
          <div className="cg-between"><span className="cg-eyebrow">{current.subtitle}</span><button className="cg-icon-button" onClick={close} aria-label="Return to overview"><X size={16}/></button></div>
          <h4>{current.title}<span>{current.value}</span></h4><p>{current.change}</p>
          <div className="cg-task-list">{current.items.map(item => <button key={item.id} className="cg-task" onClick={() => { toggle(item.id, completed, setCompleted); onAction?.(current.id, item.id); }} aria-pressed={completed.includes(item.id)}><span className={`cg-check ${completed.includes(item.id) ? 'is-done' : ''}`}><Check size={12}/></span><span>{item.label}<small>{item.detail}</small></span><ArrowUpRight size={16}/></button>)}</div>
        </motion.div> : <motion.div key="overview" className="cg-workspace-grid" initial={false}>
          {ordered.map((panel, index) => <motion.article layout={!reduced} animate={{ y: floating === panel.id ? -8 : 0 }} transition={transition} key={panel.id} className={`cg-workspace-panel ${index === 0 ? 'is-lead' : ''} ${docked.includes(panel.id) ? 'is-docked' : ''} ${floating === panel.id ? 'is-floating' : ''}`}>
            <div className="cg-between"><span className="cg-eyebrow">0{panels.indexOf(panel) + 1} / {panel.subtitle}</span><div className="cg-inline"><button className="cg-icon-button" aria-label={`${docked.includes(panel.id) ? 'Undock' : 'Dock'} ${panel.title}`} aria-pressed={docked.includes(panel.id)} onClick={() => toggle(panel.id, docked, setDocked)}><Pin size={13}/></button><button className="cg-icon-button" aria-label={`${floating === panel.id ? 'Return' : 'Float'} ${panel.title}`} aria-pressed={floating === panel.id} onClick={() => setFloating(floating === panel.id ? null : panel.id)}><Maximize2 size={13}/></button><button className="cg-icon-button" aria-expanded={!collapsed.includes(panel.id)} aria-label={`Toggle ${panel.title}`} onClick={() => toggle(panel.id, collapsed, setCollapsed)}><ChevronDown size={14}/></button></div></div>
            <button ref={node => { if (node) { controls.current.set(panel.id, node); if (restoreFocus.current === panel.id) { node.focus(); restoreFocus.current = null; } } else controls.current.delete(panel.id); }} className="cg-panel-trigger" onClick={() => setFocused(panel.id)}><h4>{panel.title}</h4><ArrowUpRight size={20}/></button>
            {!collapsed.includes(panel.id) && <><div className="cg-panel-value">{panel.value}</div><p>{panel.change}</p><div className="cg-panel-items">{panel.items.slice(0, index === 0 ? 3 : 2).map(item => <div key={item.id}><i className={item.done ? 'is-complete' : ''}/><span>{item.label}</span><small>{item.detail}</small></div>)}</div></>}
          </motion.article>)}
        </motion.div>}
      </AnimatePresence>
      <div className="cg-footnote"><span><i className="cg-dot"/>A workspace that moves with your attention.</span><span>Select a panel to go deeper ↗</span></div>
    </section>
  </SurfaceState>;
}
