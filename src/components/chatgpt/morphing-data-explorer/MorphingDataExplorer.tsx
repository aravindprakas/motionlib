import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownUp, BarChart3, Search, Table2, TrendingUp, X } from 'lucide-react';
import { SurfaceState, formatNumber, useInstrumentMotion, type AsyncSurfaceProps } from '@/lib/chatgpt';

export interface ExplorerDatum { id: string; label: string; category: string; value: number | null; previous?: number }
export interface MorphingDataExplorerProps extends AsyncSurfaceProps { data: ExplorerDatum[]; unit?: string; onSelect?: (datum: ExplorerDatum) => void; pageSize?: number }
type View = 'table' | 'chart' | 'metric' | 'distribution';

export function MorphingDataExplorer({ data, unit = 'visits', state, onRetry, onSelect, pageSize = 12 }: MorphingDataExplorerProps) {
  const [view, setView] = useState<View>('chart');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [detail, setDetail] = useState<string | null>(null);
  const { reduced, transition } = useInstrumentMotion();
  const size = Math.max(1, Math.min(100, pageSize));
  const categories = useMemo(() => [...new Set(data.map(item => item.category))], [data]);
  const filtered = useMemo(() => data.filter(item => (category === 'all' || item.category === category) && `${item.label} ${item.category}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())).sort((a, b) => ((a.value ?? -Infinity) - (b.value ?? -Infinity)) * (sort === 'asc' ? 1 : -1)), [data, query, category, sort]);
  const safePage = Math.min(page, Math.max(0, Math.ceil(filtered.length / size) - 1));
  const visible = filtered.slice(safePage * size, (safePage + 1) * size);
  const numeric = filtered.filter((item): item is ExplorerDatum & { value: number } => item.value !== null && Number.isFinite(item.value));
  const max = numeric.reduce((value, item) => Math.max(value, Math.abs(item.value)), 1);
  const total = numeric.reduce((value, item) => value + item.value, 0);
  const selected = data.find(item => item.id === detail);
  const views: { id: View; label: string; icon: typeof Table2 }[] = [{ id: 'table', label: 'Table', icon: Table2 }, { id: 'chart', label: 'Chart', icon: BarChart3 }, { id: 'metric', label: 'Metric', icon: TrendingUp }, { id: 'distribution', label: 'Distribution', icon: BarChart3 }];
  return <SurfaceState state={state === 'loading' || state === 'error' ? state : data.length ? state : 'empty'} onRetry={onRetry}>
    <section className="cg-data" aria-label="Morphing data explorer"><div className="cg-between"><div><span className="cg-eyebrow">ONE DATASET. MANY PERSPECTIVES.</span><h3>Find the signal.</h3></div><span className="cg-tag">{data.length} sources</span></div>
      <div className="cg-data-controls"><div className="cg-segmented" aria-label="Data representation">{views.map(({ id, label, icon: Icon }) => <button key={id} aria-pressed={view === id} onClick={() => setView(id)}><Icon size={14}/>{label}</button>)}</div><label className="cg-search"><Search size={15}/><input aria-label="Search data" placeholder="Find a source…" value={query} onChange={e => { setQuery(e.target.value); setPage(0); }}/></label><select aria-label="Filter by category" value={category} onChange={e => { setCategory(e.target.value); setPage(0); }}><option value="all">All channels</option>{categories.map(value => <option key={value} value={value}>{value}</option>)}</select></div>
      {view === 'metric' && <div className="cg-big-metric" role="status"><span>{formatNumber(total)}</span><p>{unit} across {numeric.length} sources<br/><small>{formatNumber(numeric.length ? total / numeric.length : 0)} average per source</small></p></div>}
      {view === 'distribution' && <div className="cg-distribution" aria-label="Value distribution">{[0, 1, 2, 3].map(bucket => { const count = numeric.filter(item => Math.abs(item.value) / max >= bucket / 4 && (bucket === 3 || Math.abs(item.value) / max < (bucket + 1) / 4)).length; return <div key={bucket}><motion.i animate={{ height: `${Math.max(4, count / Math.max(numeric.length, 1) * 100)}%` }} transition={transition}/><strong>{count}</strong><span>{formatNumber(max * bucket / 4)}–{formatNumber(max * (bucket + 1) / 4)}</span></div>; })}</div>}
      <div className={`cg-data-table cg-data-${view}`}><table><caption className="cg-sr-only">Source performance in {unit}, sorted {sort === 'desc' ? 'highest' : 'lowest'} first</caption><thead><tr><th scope="col">Source</th><th scope="col">Channel</th><th scope="col" aria-sort={sort === 'asc' ? 'ascending' : 'descending'}><button className="cg-text-button" onClick={() => setSort(sort === 'asc' ? 'desc' : 'asc')}>{unit}<ArrowDownUp size={12}/></button></th></tr></thead><tbody>
        {visible.map((item, index) => <motion.tr layout={!reduced} transition={transition} key={item.id}><th scope="row"><button onClick={() => { setDetail(item.id); onSelect?.(item); }}><span className="cg-data-swatch" style={{ background: `var(--cg-data-${index % 4})` }}/>{item.label}</button></th><td>{item.category}</td><td><motion.div className="cg-data-bar" aria-hidden="true" animate={{ scaleX: view === 'table' ? 0 : Math.max(.015, Math.abs(item.value ?? 0) / max) }} transition={transition} style={{ background: `var(--cg-data-${index % 4})` }}/><span>{item.value === null || !Number.isFinite(item.value) ? 'Unavailable' : formatNumber(item.value)}</span></td></motion.tr>)}
      </tbody></table>{!filtered.length && <div className="cg-inline-empty" role="status">No sources match “{query}”. <button className="cg-text-button" onClick={() => { setQuery(''); setCategory('all'); }}>Clear filters</button></div>}</div>
      {selected && <aside className="cg-data-detail" aria-label={`${selected.label} details`}><div className="cg-between"><h4>{selected.label}</h4><button className="cg-icon-button" onClick={() => setDetail(null)} aria-label="Close source details"><X size={16}/></button></div><p>{selected.value === null ? 'This source has not reported a value yet.' : `${formatNumber(selected.value)} ${unit}${selected.previous !== undefined ? `, compared with ${formatNumber(selected.previous)} in the previous period.` : '.'}`}</p><span className="cg-tag">{selected.category}</span></aside>}
      <div className="cg-footnote"><span aria-live="polite">{filtered.length ? `${safePage * size + 1}–${Math.min((safePage + 1) * size, filtered.length)} of ${filtered.length} sources` : '0 sources'}</span><div className="cg-inline"><button className="cg-text-button" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>Previous</button><button className="cg-text-button" disabled={(safePage + 1) * size >= filtered.length} onClick={() => setPage(safePage + 1)}>Next →</button></div></div>
    </section>
  </SurfaceState>;
}
