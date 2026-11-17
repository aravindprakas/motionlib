import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Focus, List, Minus, MousePointer2, Plus, Scan } from 'lucide-react';
import { motion } from 'framer-motion';
import { SurfaceState, clamp, useInstrumentMotion, type AsyncSurfaceProps } from '@/lib/chatgpt';

export interface CanvasNode { id: string; title: string; text: string; x: number; y: number; color?: 'sage' | 'clay' | 'blue'; kind?: string }
export interface CanvasViewport { x: number; y: number; zoom: number }
export interface InfiniteContentCanvasProps extends AsyncSurfaceProps { nodes: CanvasNode[]; onSelectionChange?: (ids: string[]) => void; onNodesChange?: (nodes: CanvasNode[]) => void; gridSize?: number }
const NODE_WIDTH = 216, NODE_HEIGHT = 148;
type Gesture = { type: 'pan'; x: number; y: number; view: CanvasViewport } | { type: 'node'; x: number; y: number; positions: Record<string, { x: number; y: number }> } | { type: 'pinch'; distance: number; midX: number; midY: number; view: CanvasViewport };

export function InfiniteContentCanvas({ nodes, onSelectionChange, onNodesChange, gridSize = 24, state, onRetry }: InfiniteContentCanvasProps) {
  const [view, setView] = useState<CanvasViewport>({ x: 48, y: 42, zoom: .85 });
  const [selected, setSelected] = useState<string[]>([]);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [list, setList] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 600px)').matches);
  const [listPage, setListPage] = useState(0);
  const [moving, setMoving] = useState(false);
  const { transition } = useInstrumentMotion();
  const [size, setSize] = useState({ width: 800, height: 400 });
  const viewport = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<Gesture | null>(null);
  const frame = useRef(0);
  const viewRef = useRef(view); viewRef.current = view;
  const positionsRef = useRef(positions); positionsRef.current = positions;
  const all = useMemo(() => nodes.map(node => ({ ...node, ...(positions[node.id] ?? {}) })), [nodes, positions]);
  const bounds = useMemo(() => all.reduce((area, node) => ({ left: Math.min(area.left, node.x), top: Math.min(area.top, node.y), right: Math.max(area.right, node.x + NODE_WIDTH), bottom: Math.max(area.bottom, node.y + NODE_HEIGHT) }), { left: 0, top: 0, right: 800, bottom: 500 }), [all]);
  const visible = all.filter(n => (n.x + NODE_WIDTH) * view.zoom + view.x > -NODE_WIDTH && n.x * view.zoom + view.x < size.width + NODE_WIDTH && (n.y + NODE_HEIGHT) * view.zoom + view.y > -NODE_HEIGHT && n.y * view.zoom + view.y < size.height + NODE_HEIGHT);
  const select = (ids: string[]) => { setSelected(ids); onSelectionChange?.(ids); };
  const zoomAt = useCallback((zoom: number, x: number, y: number) => setView(old => { const next = clamp(zoom, .2, 2); return { zoom: next, x: x - (x - old.x) / old.zoom * next, y: y - (y - old.y) / old.zoom * next }; }), []);
  const focus = (node?: CanvasNode) => {
    const area = node ? { left: node.x, top: node.y, right: node.x + NODE_WIDTH, bottom: node.y + NODE_HEIGHT } : bounds;
    const zoom = clamp(Math.min((size.width - 64) / Math.max(1, area.right - area.left), (size.height - 64) / Math.max(1, area.bottom - area.top)), .2, node ? 1.3 : 1);
    setView({ zoom, x: size.width / 2 - (area.left + area.right) / 2 * zoom, y: size.height / 2 - (area.top + area.bottom) / 2 * zoom });
  };
  useEffect(() => {
    const element = viewport.current; if (!element) return;
    const observer = new ResizeObserver(entries => { const { width, height } = entries[0].contentRect; setSize({ width, height }); }); observer.observe(element);
    const wheel = (e: WheelEvent) => { e.preventDefault(); const rect = element.getBoundingClientRect(); if (e.ctrlKey || e.metaKey) zoomAt(viewRef.current.zoom * Math.exp(-e.deltaY * .005), e.clientX - rect.left, e.clientY - rect.top); else setView(old => ({ ...old, x: old.x - e.deltaX, y: old.y - e.deltaY })); };
    element.addEventListener('wheel', wheel, { passive: false });
    return () => { observer.disconnect(); element.removeEventListener('wheel', wheel); cancelAnimationFrame(frame.current); pointers.current.clear(); gesture.current = null; };
  }, [list, state, nodes.length, zoomAt]);
  const down = (e: ReactPointerEvent<HTMLDivElement>, node?: CanvasNode) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.stopPropagation(); e.currentTarget.setPointerCapture(e.pointerId); setMoving(true);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) { const [a, b] = [...pointers.current.values()]; const rect = viewport.current!.getBoundingClientRect(); gesture.current = { type: 'pinch', distance: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), midX: (a.x + b.x) / 2 - rect.left, midY: (a.y + b.y) / 2 - rect.top, view: viewRef.current }; return; }
    if (node) { const ids = e.shiftKey ? selected.includes(node.id) ? selected.filter(id => id !== node.id) : [...selected, node.id] : selected.includes(node.id) ? selected : [node.id]; select(ids); gesture.current = { type: 'node', x: e.clientX, y: e.clientY, positions: Object.fromEntries(all.filter(n => ids.includes(n.id)).map(n => [n.id, { x: n.x, y: n.y }])) }; }
    else { if (!e.shiftKey) select([]); gesture.current = { type: 'pan', x: e.clientX, y: e.clientY, view: viewRef.current }; }
  };
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const action = gesture.current; if (!action) return;
    cancelAnimationFrame(frame.current);
    const clientX = e.clientX, clientY = e.clientY;
    frame.current = requestAnimationFrame(() => {
      if (action.type === 'pan') setView({ ...action.view, x: action.view.x + clientX - action.x, y: action.view.y + clientY - action.y });
      if (action.type === 'node') { const snap = Math.max(1, gridSize); setPositions(old => ({ ...old, ...Object.fromEntries(Object.entries(action.positions).map(([id, pos]) => [id, { x: Math.round((pos.x + (clientX - action.x) / viewRef.current.zoom) / snap) * snap, y: Math.round((pos.y + (clientY - action.y) / viewRef.current.zoom) / snap) * snap }])) })); }
      if (action.type === 'pinch' && pointers.current.size === 2) { const [a, b] = [...pointers.current.values()]; const rect = viewport.current!.getBoundingClientRect(); const zoom = clamp(action.view.zoom * Math.hypot(a.x - b.x, a.y - b.y) / action.distance, .2, 2); setView({ zoom, x: (a.x + b.x) / 2 - rect.left - (action.midX - action.view.x) / action.view.zoom * zoom, y: (a.y + b.y) / 2 - rect.top - (action.midY - action.view.y) / action.view.zoom * zoom }); }
    });
  };
  const up = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    cancelAnimationFrame(frame.current);
    const action = gesture.current;
    if (action?.type === 'node' && e.type === 'pointerup') {
      const snap = Math.max(1, gridSize);
      const final = { ...positionsRef.current, ...Object.fromEntries(Object.entries(action.positions).map(([id, pos]) => [id, { x: Math.round((pos.x + (e.clientX - action.x) / viewRef.current.zoom) / snap) * snap, y: Math.round((pos.y + (e.clientY - action.y) / viewRef.current.zoom) / snap) * snap }])) };
      positionsRef.current = final; setPositions(final); onNodesChange?.(nodes.map(node => ({ ...node, ...(final[node.id] ?? {}) })));
    }
    pointers.current.delete(e.pointerId);
    const remaining = [...pointers.current.values()][0];
    gesture.current = remaining ? { type: 'pan', x: remaining.x, y: remaining.y, view: viewRef.current } : null;
    setMoving(!!remaining);
  };
  return <SurfaceState state={state === 'loading' || state === 'error' ? state : nodes.length ? state : 'empty'} onRetry={onRetry}><section className="cg-canvas" aria-label="Infinite content canvas">
    <div className="cg-between cg-canvas-toolbar"><span className="cg-eyebrow"><MousePointer2 size={13}/> ROOM TO THINK</span><div className="cg-inline"><button className="cg-icon-button" aria-label={list ? 'Explore canvas' : 'Show content list'} aria-pressed={list} onClick={() => setList(!list)}><List size={16}/></button><button className="cg-icon-button" aria-label="Fit all content" onClick={() => focus()}><Scan size={16}/></button><button className="cg-icon-button" aria-label="Zoom out" onClick={() => zoomAt(view.zoom / 1.2, size.width / 2, size.height / 2)}><Minus size={16}/></button><output>{Math.round(view.zoom * 100)}%</output><button className="cg-icon-button" aria-label="Zoom in" onClick={() => zoomAt(view.zoom * 1.2, size.width / 2, size.height / 2)}><Plus size={16}/></button></div></div>
    {list ? <div className="cg-canvas-list">{all.slice(listPage * 30, (listPage + 1) * 30).map(node => <button key={node.id} className={`cg-canvas-list-item cg-note-${node.color ?? 'sage'}`} aria-pressed={selected.includes(node.id)} onClick={() => { select([node.id]); setList(false); focus(node); }}><span className="cg-eyebrow">{node.kind ?? 'NOTE'}</span><h4>{node.title}</h4><p>{node.text}</p><Focus size={16}/></button>)}{all.length > 30 && <div className="cg-inline"><button className="cg-button" disabled={!listPage} onClick={() => setListPage(listPage - 1)}>Previous</button><button className="cg-button" disabled={(listPage + 1) * 30 >= all.length} onClick={() => setListPage(listPage + 1)}>Next</button></div>}</div> : <div ref={viewport} className="cg-canvas-viewport" tabIndex={0} role="group" aria-label="Canvas. Arrows to pan, plus or minus to zoom. Select a note; Shift selects more. Control plus arrows moves a selected note." onPointerDown={e => down(e)} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onLostPointerCapture={up} onKeyDown={e => {
      if (e.target instanceof HTMLElement && e.target.closest('button')) return;
      const delta: Record<string, [number, number]> = { ArrowLeft: [32, 0], ArrowRight: [-32, 0], ArrowUp: [0, 32], ArrowDown: [0, -32] };
      if (delta[e.key]) { e.preventDefault(); const [x, y] = delta[e.key]; setView(old => ({ ...old, x: old.x + x, y: old.y + y })); }
      else if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomAt(view.zoom * 1.2, size.width / 2, size.height / 2); }
      else if (e.key === '-') { e.preventDefault(); zoomAt(view.zoom / 1.2, size.width / 2, size.height / 2); }
      else if (e.key === 'Escape') select([]);
      else if (e.key === 'Home') { e.preventDefault(); focus(); }
    }} style={{ backgroundSize: `${24 * view.zoom}px ${24 * view.zoom}px`, backgroundPosition: `${view.x}px ${view.y}px` }}>
      <motion.div className="cg-canvas-world" initial={false} animate={{ x: view.x, y: view.y, scale: view.zoom }} transition={moving ? { duration: 0 } : transition}>{visible.map(node => <div key={node.id} className={`cg-canvas-note cg-note-${node.color ?? 'sage'} ${selected.includes(node.id) ? 'is-selected' : ''}`} style={{ transform: `translate(${node.x}px,${node.y}px)` }} onPointerDown={e => down(e, node)} onPointerMove={move} onPointerUp={up} onPointerCancel={up}><span className="cg-eyebrow">{node.kind ?? 'NOTE'}</span><button aria-pressed={selected.includes(node.id)} onClick={e => { if (e.detail === 0) { select(e.shiftKey ? [...new Set([...selected, node.id])] : [node.id]); focus(node); } }} onKeyDown={e => {
        if ((e.ctrlKey || e.metaKey) && e.key.startsWith('Arrow')) { e.preventDefault(); const dx = e.key === 'ArrowLeft' ? -gridSize : e.key === 'ArrowRight' ? gridSize : 0; const dy = e.key === 'ArrowUp' ? -gridSize : e.key === 'ArrowDown' ? gridSize : 0; const next = { x: node.x + dx, y: node.y + dy }; setPositions(old => ({ ...old, [node.id]: next })); onNodesChange?.(all.map(n => n.id === node.id ? { ...n, ...next } : n)); }
      }}>{node.title}</button><p>{node.text}</p><span className="cg-note-coordinate">{Math.round(node.x)} : {Math.round(node.y)}</span></div>)}</motion.div>
      <svg className="cg-minimap" viewBox={`${bounds.left} ${bounds.top} ${bounds.right - bounds.left} ${bounds.bottom - bounds.top}`} role="img" aria-label="Canvas minimap" onPointerDown={e => e.stopPropagation()} onClick={e => { const svg = e.currentTarget; const matrix = svg.getScreenCTM(); if (!matrix) return; const point = svg.createSVGPoint(); point.x = e.clientX; point.y = e.clientY; const mapped = point.matrixTransform(matrix.inverse()); setView(old => ({ ...old, x: size.width / 2 - mapped.x * old.zoom, y: size.height / 2 - mapped.y * old.zoom })); }}>{all.slice(0, 1000).map(node => <rect key={node.id} x={node.x} y={node.y} width={NODE_WIDTH} height={NODE_HEIGHT} className={selected.includes(node.id) ? 'is-selected' : ''}/>)}<rect className="cg-minimap-view" x={-view.x / view.zoom} y={-view.y / view.zoom} width={size.width / view.zoom} height={size.height / view.zoom}/></svg>
    </div>}
    <div className="cg-footnote"><span aria-live="polite">{selected.length ? `${selected.length} selected · Drag to arrange` : `${nodes.length} ideas · Drag the ground to pan`}</span><span>Pinch / Ctrl + wheel to zoom · Notes snap to a grid</span></div>
  </section></SurfaceState>;
}
