const e=`import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Fuse from 'fuse.js';
import { ArrowLeft, ArrowUpRight, Check, Command, CornerDownLeft, Loader2, Search, Undo2 } from 'lucide-react';
import { SurfaceState, type AsyncSurfaceProps } from '@/lib/chatgpt';

export interface CommandResult { message: string; undo?: () => void | Promise<void> }
export interface PaletteCommand { id: string; label: string; category: string; description: string; shortcut?: string; context?: string; destructive?: boolean; children?: PaletteCommand[]; argument?: { label: string; placeholder?: string; required?: boolean }; execute?: (argument: string, signal: AbortSignal) => void | CommandResult | Promise<void | CommandResult> }
export interface AdaptiveCommandPaletteProps extends AsyncSurfaceProps { commands: PaletteCommand[]; context?: string; onExecuted?: (id: string) => void; initialOpen?: boolean; recentKey?: string }

export function AdaptiveCommandPalette({ commands, context = 'Workspace', onExecuted, initialOpen = true, recentKey = 'cg-recent-actions', state, onRetry }: AdaptiveCommandPaletteProps) {
  const [open, setOpen] = useState(initialOpen);
  const [query, setQuery] = useState('');
  const [path, setPath] = useState<PaletteCommand[]>([]);
  const [index, setIndex] = useState(0);
  const [argument, setArgument] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [undo, setUndo] = useState<CommandResult['undo']>();
  const [recent, setRecent] = useState<string[]>(() => { try { const value: unknown = JSON.parse(localStorage.getItem(recentKey) ?? '[]'); return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string').slice(0, 5) : []; } catch { return []; } });
  const input = useRef<HTMLInputElement>(null), trigger = useRef<HTMLButtonElement>(null);
  const controller = useRef<AbortController | null>(null);
  const lock = useRef(false);
  const scope = useId();
  const openRef = useRef(open); openRef.current = open;
  const closeRef = useRef<() => void>(() => {});
  const confirmButton = useRef<HTMLButtonElement>(null);
  const available = useMemo(() => (path[path.length - 1]?.children ?? commands).filter(command => !command.context || command.context === context), [commands, path, context]);
  const fuse = useMemo(() => new Fuse(available, { keys: [{ name: 'label', weight: 2 }, 'description', 'category'], threshold: .4, ignoreLocation: true }), [available]);
  const results = useMemo(() => query.trim() ? fuse.search(query).map(result => result.item) : [...available].sort((a, b) => { const ai = recent.indexOf(a.id), bi = recent.indexOf(b.id); return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi); }), [available, fuse, query, recent]);
  const activeIndex = Math.min(index, Math.max(0, results.length - 1));
  const selected = results[activeIndex];
  const start = Math.max(0, activeIndex - 5), end = Math.min(results.length, start + 12);
  const reset = () => { setIndex(0); setArgument(''); setConfirming(false); setError(''); };
  const close = () => { controller.current?.abort(); lock.current = false; setPending(false); setOpen(false); trigger.current?.focus(); };
  closeRef.current = close;
  useEffect(() => { if (open) input.current?.focus(); }, [open]);
  useEffect(() => { if (confirming) confirmButton.current?.focus(); }, [confirming]);
  useEffect(() => { const listener = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k' && !document.querySelector('dialog[open]')) { e.preventDefault(); if (openRef.current) closeRef.current(); else setOpen(true); } }; window.addEventListener('keydown', listener); return () => { window.removeEventListener('keydown', listener); controller.current?.abort(); }; }, []);
  useEffect(() => { setIndex(0); setConfirming(false); setArgument(''); }, [context]);
  const run = async (command: PaletteCommand | undefined) => {
    if (!command || lock.current) return;
    if (command.children) { setPath(old => [...old, command]); setQuery(''); reset(); return; }
    if (!command.execute) { setError('This action is unavailable in the current context.'); return; }
    if (command.argument?.required && !argument.trim()) { setError(\`Enter \${command.argument.label.toLocaleLowerCase()} before continuing.\`); return; }
    if (command.destructive && !confirming) { setConfirming(true); return; }
    controller.current?.abort(); const abort = new AbortController(); controller.current = abort;
    lock.current = true; setPending(true); setError(''); setConfirming(false); setMessage(\`Running \${command.label.toLocaleLowerCase()}…\`); setUndo(undefined);
    try {
      const result = await command.execute?.(argument, abort.signal);
      if (abort.signal.aborted) return;
      setMessage(result?.message ?? \`\${command.label} complete.\`); if (result?.undo) setUndo(() => result.undo);
      const next = [command.id, ...recent.filter(id => id !== command.id)].slice(0, 5); setRecent(next); try { localStorage.setItem(recentKey, JSON.stringify(next)); } catch { /* Recents stay usable for this session. */ }
      onExecuted?.(command.id);
    } catch (cause) { if (!abort.signal.aborted) { setError(cause instanceof Error ? cause.message : 'The action failed. You can try again.'); setMessage(''); } }
    finally { if (controller.current === abort && !abort.signal.aborted) { lock.current = false; setPending(false); } }
  };
  return <SurfaceState state={state === 'loading' || state === 'error' ? state : commands.length ? state : 'empty'} onRetry={onRetry}><section className="cg-palette" aria-label="Adaptive command palette">
    <div className="cg-between"><span className="cg-eyebrow">INTENTION → ACTION</span><button ref={trigger} className="cg-button cg-small" onClick={() => { if (open) close(); else setOpen(true); }} aria-expanded={open}><Command size={14}/>{open ? 'Close palette' : 'Open palette'}<kbd>⌘ K</kbd></button></div>
    {!open ? <div className="cg-palette-rest"><Command size={42}/><h3>Your next move,<br/><em>one thought away.</em></h3><p>Search, preview, act. All in the same place.</p></div> : <div className="cg-palette-box" onKeyDown={e => {
      if (e.altKey) { const shortcut = available.find(command => command.shortcut?.toLocaleLowerCase() === \`alt \${e.key.toLocaleLowerCase()}\`); if (shortcut) { e.preventDefault(); void run(shortcut); return; } }
      if (e.key === 'Escape') { e.preventDefault(); if (confirming) setConfirming(false); else if (path.length) { setPath(path.slice(0, -1)); setQuery(''); reset(); } else close(); }
      if (e.target instanceof HTMLElement && e.target.closest('input[data-argument]')) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); setIndex((activeIndex + (e.key === 'ArrowDown' ? 1 : -1) + Math.max(1, results.length)) % Math.max(1, results.length)); setConfirming(false); setArgument(''); }
      if (e.key === 'Enter' && e.target === input.current) { e.preventDefault(); void run(selected); }
      if (e.key === 'Backspace' && !query && path.length && e.target === input.current) { setPath(path.slice(0, -1)); reset(); }
    }}>
      <div className="cg-palette-search">{path.length ? <button className="cg-icon-button" aria-label="Back to parent commands" onClick={() => { setPath(path.slice(0, -1)); setQuery(''); reset(); }}><ArrowLeft size={18}/></button> : <Search size={20}/>}<input ref={input} role="combobox" aria-label="Search commands" aria-expanded="true" aria-controls={\`\${scope}-results\`} aria-autocomplete="list" aria-activedescendant={selected ? \`\${scope}-command-\${encodeURIComponent(selected.id)}\` : undefined} placeholder={path.length ? \`Search \${path[path.length - 1].label.toLocaleLowerCase()}…\` : 'What would you like to do?'} value={query} onChange={e => { setQuery(e.target.value); reset(); }}/><kbd>esc</kbd></div>
      <div className="cg-palette-context"><i className="cg-dot"/>{context}{path.map(command => <span key={command.id}> / {command.label}</span>)}</div>
      <div className="cg-palette-body"><div id={\`\${scope}-results\`} role="listbox" aria-label="Commands" className="cg-command-results">{results.slice(start, end).map((command, offset) => <div key={command.id} id={\`\${scope}-command-\${encodeURIComponent(command.id)}\`} role="option" aria-selected={command.id === selected?.id} className={\`cg-command-option \${command.destructive ? 'is-destructive' : ''}\`} onMouseEnter={() => { if (activeIndex !== start + offset) { setIndex(start + offset); setConfirming(false); setArgument(''); } }}><button tabIndex={-1} onClick={() => void run(command)}><span className="cg-command-glyph">{command.children ? '↳' : command.destructive ? '−' : '↗'}</span><span>{command.label}<small>{recent.includes(command.id) ? 'Recently used' : command.category}</small></span>{command.shortcut ? <kbd>{command.shortcut}</kbd> : <ArrowUpRight size={14}/>}</button></div>)}{!results.length && <p className="cg-inline-empty">No actions found. Try a different phrase.</p>}</div>
        <aside className="cg-command-preview"><span className="cg-eyebrow">BEFORE YOU ACT</span><h4>{selected?.label ?? 'A little more context'}</h4><p>{selected?.description ?? 'Your available actions change with the selected workspace.'}</p>{selected?.argument && <label>{selected.argument.label}<input data-argument value={argument} placeholder={selected.argument.placeholder} onChange={e => { setArgument(e.target.value); setError(''); }} aria-invalid={!!error} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); void run(selected); } }}/></label>}{confirming ? <div className="cg-confirmation"><p>This action changes your workspace. Continue?</p><div className="cg-inline"><button ref={confirmButton} className="cg-button" onClick={() => void run(selected)}>Confirm</button><button className="cg-text-button" onClick={() => { setConfirming(false); input.current?.focus(); }}>Cancel</button></div></div> : <button className="cg-button" disabled={!selected || pending} onClick={() => void run(selected)}>{pending ? <Loader2 size={14} className="cg-spin"/> : <CornerDownLeft size={14}/>} {pending ? 'Working…' : selected?.children ? 'Explore actions' : 'Run action'}</button>}</aside>
      </div><div className="cg-palette-feedback" role={error ? 'alert' : 'status'}>{error || message || \`\${results.length} actions · ↑ ↓ to explore · Enter to act\`}{message && !pending && !error && <Check size={14}/>} {undo && <button className="cg-text-button" disabled={pending} onClick={async () => { if (lock.current) return; lock.current = true; setPending(true); try { await undo(); setUndo(undefined); setMessage('Action undone.'); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Undo failed. Try again.'); } finally { lock.current = false; setPending(false); } }}><Undo2 size={13}/>Undo</button>}</div>
    </div>}
  </section></SurfaceState>;
}
`;export{e as default};
