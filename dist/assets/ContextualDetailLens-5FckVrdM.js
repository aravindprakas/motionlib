const e=`import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Loader2, X } from 'lucide-react';
import { FrameArt, SurfaceState, clamp, useInstrumentMotion, useLinkedState, type AsyncSurfaceProps } from '@/lib/chatgpt';

export interface LensSection { title: string; body: string }
export interface LensItem { id: string; title: string; label: string; summary: string; seed?: number; image?: string; sections?: LensSection[] }
export interface ContextualDetailLensProps extends AsyncSurfaceProps { items: LensItem[]; linkKey?: string; pageSize?: number; loadDetail?: (id: string, signal: AbortSignal) => Promise<LensSection[]>; onSelect?: (id: string | null) => void }

export function ContextualDetailLens({ items, linkKey = 'lens', pageSize = 12, loadDetail, onSelect, state, onRetry }: ContextualDetailLensProps) {
  const ids = useMemo(() => ['', ...items.map(item => item.id)], [items]);
  const [selected, setSelected] = useLinkedState(linkKey, '', ids);
  const [hovered, setHovered] = useState<string | null>(null);
  const [section, setSection] = useState(0);
  const [detail, setDetail] = useState<LensSection[] | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [page, setPage] = useState(0);
  const size = clamp(pageSize, 1, 40);
  const selectedIndex = items.findIndex(item => item.id === selected);
  const currentPage = selectedIndex >= 0 ? Math.floor(selectedIndex / size) : Math.min(page, Math.max(0, Math.ceil(items.length / size) - 1));
  const [broken, setBroken] = useState<string[]>([]);
  const triggers = useRef(new Map<string, HTMLButtonElement>());
  const scope = useId();
  const { reduced, transition } = useInstrumentMotion();
  useEffect(() => {
    setSection(0); setDetail(null); setError(''); setPending(false);
    if (!selected || !loadDetail) return;
    const controller = new AbortController(); setPending(true);
    loadDetail(selected, controller.signal).then(result => { if (!controller.signal.aborted) setDetail(result); }).catch(cause => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'This detail is unavailable.'); }).finally(() => { if (!controller.signal.aborted) setPending(false); });
    return () => controller.abort();
  }, [selected, loadDetail, retry]);
  const select = (id: string) => { setSelected(id === selected ? '' : id); onSelect?.(id === selected ? null : id); };
  return <SurfaceState state={state === 'loading' || state === 'error' ? state : items.length ? state : 'empty'} onRetry={onRetry}><section className="cg-lens" aria-label="Contextual detail lens"><div className="cg-between"><div><span className="cg-eyebrow">CLOSER, WITHOUT GOING ELSEWHERE</span><h3>There’s more to the story.</h3></div><span className="cg-tag">Select to look closer</span></div>
    <div className={\`cg-lens-grid \${selected ? 'has-focus' : ''}\`}>{items.slice(currentPage * size, (currentPage + 1) * size).map((item, index) => { const active = selected === item.id; const sections = active ? detail ?? item.sections ?? [] : []; const current = sections[Math.min(section, Math.max(0, sections.length - 1))]; return <motion.article layout={!reduced} transition={transition} key={item.id} className={\`cg-lens-item \${active ? 'is-open' : ''}\`} onPointerEnter={e => { if (e.pointerType === 'mouse') setHovered(item.id); }} onPointerLeave={() => setHovered(null)}>
      <button ref={node => { if (node) triggers.current.set(item.id, node); else triggers.current.delete(item.id); }} className="cg-lens-trigger" aria-expanded={active} aria-controls={active ? \`\${scope}-lens-\${encodeURIComponent(item.id)}\` : undefined} onClick={() => select(item.id)} onFocus={() => setHovered(item.id)} onBlur={() => setHovered(null)}><div className="cg-lens-art">{item.image && !broken.includes(item.id) ? <img src={item.image} alt={item.title} loading="lazy" width="560" height="360" onError={() => setBroken(old => [...old, item.id])}/> : <FrameArt seed={item.seed ?? index}/>}<span className="cg-lens-magnifier">{active ? <X size={17}/> : <ArrowUpRight size={17}/>}</span><span className={\`cg-lens-hint \${hovered === item.id ? 'is-visible' : ''}\`}>{item.summary}</span></div><span className="cg-eyebrow">{item.label}</span><h4>{item.title}</h4></button>
      {active && <motion.div id={\`\${scope}-lens-\${encodeURIComponent(item.id)}\`} className="cg-lens-detail" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={transition}><p>{item.summary}</p>{pending ? <p role="status"><Loader2 size={14} className="cg-spin"/>Looking closer…</p> : error ? <div role="alert"><p>{error}</p><button className="cg-button" onClick={() => setRetry(retry + 1)}>Try again</button></div> : sections.length ? <><div className="cg-segmented" aria-label="Detail sections">{sections.map((value, i) => <button key={value.title} aria-pressed={section === i} onClick={() => setSection(i)}>{value.title}</button>)}</div><h5>{current?.title}</h5><p>{current?.body}</p></> : <p role="status">More information will be available soon.</p>}<button className="cg-text-button" onClick={() => { setSelected(''); onSelect?.(null); triggers.current.get(item.id)?.focus(); }}>Pull back ↑</button></motion.div>}
    </motion.article>; })}</div>{items.length > size && <div className="cg-footnote"><button className="cg-text-button" disabled={!currentPage} onClick={() => { setSelected(''); setPage(currentPage - 1); }}>Previous objects</button><span>{currentPage + 1} / {Math.ceil(items.length / size)}</span><button className="cg-text-button" disabled={(currentPage + 1) * size >= items.length} onClick={() => { setSelected(''); setPage(currentPage + 1); }}>Next objects →</button></div>}
    <div className="cg-footnote"><span>The object stays. Your perspective changes.</span><span>Hover for a glimpse · Select for depth</span></div>
  </section></SurfaceState>;
}
`;export{e as default};
