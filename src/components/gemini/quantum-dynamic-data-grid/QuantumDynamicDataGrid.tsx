import { useId, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Columns3 } from 'lucide-react';
import { AuraSurface } from '@/lib/gemini/AuraSurface';

export interface QuantumColumn { key: string; label: string; type?: 'text' | 'number' | 'sparkline' }
export interface QuantumRow { id: string; values: Record<string, string | number | number[]> }
const BASE_COLUMNS: QuantumColumn[] = [{ key: 'name', label: 'Signal' }, { key: 'value', label: 'Amplitude', type: 'number' }, { key: 'change', label: 'Delta', type: 'number' }, { key: 'history', label: 'Spectrum', type: 'sparkline' }];
export function makeQuantumData(count = 240, columnCount = 4) {
  const columns = [...BASE_COLUMNS, ...Array.from({ length: Math.max(0, columnCount - 4) }, (_, index) => ({ key: `metric-${index}`, label: `Metric ${index + 1}`, type: 'number' as const }))];
  const rows: QuantumRow[] = Array.from({ length: count }, (_, index) => {
    const values: QuantumRow['values'] = { name: ['Aether', 'Prism', 'Neutrino', 'Nova', 'Quasar', 'Photon'][index % 6] + ` / ${String(index + 1).padStart(3, '0')}`, value: Math.round(1400 + Math.sin(index * 1.7) * 1200), change: Math.round(Math.cos(index * .8) * 180) / 10, history: Array.from({ length: 18 }, (_, sample) => Math.sin(index + sample * .4) * 25 + 50) };
    columns.slice(4).forEach((column, metric) => { values[column.key] = Math.round(Math.sin(index * .3 + metric) * 500 + 500); });
    return { id: `signal-${index}`, values };
  });
  return { rows, columns };
}
const DEFAULT_DATA = makeQuantumData();
const signalCollator = new Intl.Collator(undefined, { numeric: true });
function Sparkline({ values }: { values: number[] }) {
  if (!values.length) return <span>—</span>;
  const min = Math.min(...values); const range = Math.max(1, Math.max(...values) - min);
  const points = values.map((value, i) => `${i / Math.max(1, values.length - 1) * 100},${27 - (value - min) / range * 24}`).join(' ');
  return <svg className="aura-sparkline" viewBox="0 0 100 30" role="img" aria-label={`Trend from ${values[0].toFixed(1)} to ${values[values.length - 1].toFixed(1)}`}><polyline points={points} fill="none" stroke="#8aeeed" strokeWidth="1.5" /><circle cx="100" cy={27 - (values[values.length - 1] - min) / range * 24} r="2.5" fill="#b7a0ff" /></svg>;
}
export function QuantumDynamicDataGrid({ rows = DEFAULT_DATA.rows, columns = DEFAULT_DATA.columns, pageSize = 8 }: { rows?: QuantumRow[]; columns?: QuantumColumn[]; pageSize?: number }) {
  const [sort, setSort] = useState<{ key: string; direction: 1 | -1 }>({ key: columns[0]?.key ?? '', direction: 1 });
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const [page, setPage] = useState(0);
  const [picker, setPicker] = useState(false);
  const pickerId = useId();
  const size = Math.max(1, Math.floor(pageSize));
  const totalPages = Math.max(1, Math.ceil(rows.length / size));
  const currentPage = Math.min(page, totalPages - 1);
  const visible = columns.filter(column => !hidden.has(column.key));
  const sorted = useMemo(() => [...rows].sort((a, b) => {
    const first = a.values[sort.key]; const second = b.values[sort.key];
    if (typeof first === 'number' && typeof second === 'number') return (first - second) * sort.direction;
    return signalCollator.compare(String(first ?? ''), String(second ?? '')) * sort.direction;
  }), [rows, sort]);
  return <AuraSurface className="aura-panel aura-stack"><div className="aura-row"><div><span className="aura-eyebrow">QUANTUM TELEMETRY</span><h2 className="aura-title" style={{ marginTop: '.5rem' }}>Live signal registry</h2></div><button className="aura-icon-button" onClick={() => setPicker(value => !value)} aria-expanded={picker} aria-controls={pickerId}><Columns3 size={16} />{visible.length} / {columns.length}</button></div>
    {picker && <div className="aura-column-picker" id={pickerId}>{columns.map(column => <label key={column.key}><input type="checkbox" checked={!hidden.has(column.key)} disabled={!hidden.has(column.key) && visible.length === 1} onChange={() => setHidden(previous => { const next = new Set(previous); if (next.has(column.key)) next.delete(column.key); else next.add(column.key); return next; })} />{column.label}</label>)}</div>}
    <div className="aura-table-scroll" data-lenis-prevent tabIndex={0} aria-label="Scrollable signal table"><table className="aura-table" style={{ minWidth: `${Math.max(1, visible.length) * 8}rem` }}><caption className="sr-only">Quantum signals, {rows.length} rows. Sort by choosing a column heading.</caption><thead><tr>{visible.map(column => <th key={column.key} scope="col" aria-sort={sort.key === column.key ? sort.direction === 1 ? 'ascending' : 'descending' : 'none'}><button onClick={() => { setSort(previous => ({ key: column.key, direction: previous.key === column.key ? previous.direction === 1 ? -1 : 1 : 1 })); setPage(0); }}>{column.label}{sort.key === column.key && (sort.direction === 1 ? <ArrowUp size={13} /> : <ArrowDown size={13} />)}</button></th>)}</tr></thead><tbody>{sorted.slice(currentPage * size, (currentPage + 1) * size).map(row => <tr key={row.id}>{visible.map(column => { const value = row.values[column.key]; return <td key={column.key}>{Array.isArray(value) ? <Sparkline values={value} /> : typeof value === 'number' ? value.toLocaleString() : value ?? '—'}</td>; })}</tr>)}{!rows.length && <tr><td colSpan={Math.max(1, visible.length)}>No signals to display.</td></tr>}</tbody></table></div>
    <div className="aura-row"><span className="aura-label" aria-live="polite">Page {currentPage + 1} of {totalPages} · {rows.length} signals</span><div className="aura-actions"><button className="aura-icon-button" aria-label="Previous page" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={16} /></button><button className="aura-icon-button" aria-label="Next page" disabled={currentPage === totalPages - 1} onClick={() => setPage(currentPage + 1)}><ChevronRight size={16} /></button></div></div><input className="aura-range" type="range" min="0" max={totalPages - 1} value={currentPage} onChange={event => setPage(Number(event.target.value))} aria-label="Scrub pages" aria-valuetext={`Page ${currentPage + 1} of ${totalPages}`} />
  </AuraSurface>;
}
