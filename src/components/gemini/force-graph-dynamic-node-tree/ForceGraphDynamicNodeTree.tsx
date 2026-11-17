import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { GitBranch } from 'lucide-react';
import { AuraSurface } from '@/lib/gemini/AuraSurface';
import { useReducedMotion } from '@/lib/useReducedMotion';

export interface ForceNode { id: string; label: string; parentId?: string }
interface PhysicalNode extends ForceNode { x: number; y: number; vx: number; vy: number; level: number }
export function makeForceNodes(count: number): ForceNode[] {
  return Array.from({ length: Math.max(0, count) }, (_, index) => ({ id: `node-${index}`, label: index === 0 ? 'Origin' : `Signal ${index}`, parentId: index ? `node-${Math.floor((index - 1) / 3)}` : undefined }));
}
const DEFAULT_NODES = makeForceNodes(18);
export function ForceGraphDynamicNodeTree({ nodes = DEFAULT_NODES }: { nodes?: ForceNode[] }) {
  const svg = useRef<SVGSVGElement>(null);
  const elements = useRef(new Map<string, SVGGElement>());
  const paths = useRef(new Map<string, SVGPathElement>());
  const physical = useRef<PhysicalNode[]>([]);
  const dragged = useRef<{ id: string; pointer: number } | null>(null);
  const dirty = useRef(true);
  const [focused, setFocused] = useState(nodes[0]?.id ?? '');
  const [selected, setSelected] = useState('');
  const reduced = useReducedMotion();
  const labelId = useId();
  const levels = useMemo(() => {
    const source = new Map(nodes.map(node => [node.id, node]));
    return new Map(nodes.map(node => {
      let depth = 1; let parent = node.parentId; const visited = new Set([node.id]);
      while (parent && source.has(parent) && !visited.has(parent)) { visited.add(parent); depth++; parent = source.get(parent)?.parentId; }
      return [node.id, depth];
    }));
  }, [nodes]);
  useEffect(() => {
    const old = new Map(physical.current.map(node => [node.id, node]));
    const source = new Map(nodes.map(node => [node.id, node]));
    const level = (node: ForceNode) => {
      let depth = 1; let parent = node.parentId; const visited = new Set([node.id]);
      while (parent && source.has(parent) && !visited.has(parent)) { visited.add(parent); depth++; parent = source.get(parent)?.parentId; }
      return depth;
    };
    physical.current = nodes.map((node, index) => {
      const angle = index * 2.399; const radius = index ? Math.sqrt(index / Math.max(1, nodes.length)) * 260 : 0;
      return { ...node, x: old.get(node.id)?.x ?? Math.cos(angle) * radius, y: old.get(node.id)?.y ?? Math.sin(angle) * radius, vx: 0, vy: 0, level: level(node) };
    });
    setFocused(previous => nodes.some(node => node.id === previous) ? previous : nodes[0]?.id ?? '');
    dirty.current = true;
  }, [nodes]);
  useEffect(() => {
    const root = svg.current;
    if (!root) return;
    let frame = 0; let visible = false; let last = 0; let disposed = false;
    const tick = (time: number) => {
      frame = 0;
      if (disposed || document.hidden || !visible) return;
      const list = physical.current;
      if (!reduced || dirty.current) {
        const dt = last ? Math.min(.025, (time - last) / 1000) : .016;
        const byId = new Map(list.map(node => [node.id, node]));
        const cellSize = Math.max(25, 180 / Math.sqrt(Math.max(1, list.length) / 10));
        const cells = new Map<string, PhysicalNode[]>();
        for (const node of list) { const key = `${Math.floor(node.x / cellSize)},${Math.floor(node.y / cellSize)}`; const cell = cells.get(key) ?? []; cell.push(node); cells.set(key, cell); }
        if (!reduced) for (const node of list) {
          if (node.id === dragged.current?.id) continue;
          let fx = -node.x * .32; let fy = -node.y * .32;
          const cx = Math.floor(node.x / cellSize); const cy = Math.floor(node.y / cellSize);
          for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) {
            for (const other of cells.get(`${cx + a},${cy + b}`) ?? []) {
              if (other.id === node.id) continue;
              const dx = node.x - other.x; const dy = node.y - other.y; const distance = Math.max(1, Math.hypot(dx, dy));
              const force = Math.max(0, cellSize - distance) * 14;
              fx += dx / distance * force; fy += dy / distance * force;
            }
          }
          const parent = node.parentId ? byId.get(node.parentId) : undefined;
          if (parent) {
            const dx = parent.x - node.x; const dy = parent.y - node.y; const distance = Math.max(1, Math.hypot(dx, dy));
            const force = (distance - cellSize * 1.1) * 2;
            fx += dx / distance * force; fy += dy / distance * force;
            if (parent.id !== dragged.current?.id) { parent.vx -= dx / distance * force * dt; parent.vy -= dy / distance * force * dt; }
          }
          node.vx = (node.vx + fx * dt) * Math.exp(-4 * dt); node.vy = (node.vy + fy * dt) * Math.exp(-4 * dt);
          node.x += node.vx * dt; node.y += node.vy * dt;
        }
        let left = -300; let right = 300; let top = -210; let bottom = 210;
        const radius = Math.max(5, 20 / Math.sqrt(Math.max(1, list.length) / 18));
        for (const node of list) {
          left = Math.min(left, node.x - 60); right = Math.max(right, node.x + 60); top = Math.min(top, node.y - 60); bottom = Math.max(bottom, node.y + 60);
          const element = elements.current.get(node.id);
          element?.setAttribute('transform', `translate(${node.x.toFixed(2)},${node.y.toFixed(2)})`);
          element?.querySelector('circle')?.setAttribute('r', String(radius));
          const parent = node.parentId ? byId.get(node.parentId) : undefined;
          if (parent) { const dx = node.x - parent.x; const dy = node.y - parent.y; paths.current.get(node.id)?.setAttribute('d', `M${parent.x},${parent.y} Q${(parent.x + node.x) / 2 - dy * .12},${(parent.y + node.y) / 2 + dx * .12} ${node.x},${node.y}`); }
        }
        root.setAttribute('viewBox', `${left} ${top} ${right - left} ${bottom - top}`);
        dirty.current = false;
      }
      last = time; frame = requestAnimationFrame(tick);
    };
    const wake = () => { cancelAnimationFrame(frame); last = 0; if (visible && !document.hidden) frame = requestAnimationFrame(tick); };
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; wake(); });
    observer.observe(root); document.addEventListener('visibilitychange', wake);
    return () => { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener('visibilitychange', wake); };
  }, [reduced]);
  const movePointer = (event: React.PointerEvent<SVGGElement>) => {
    if (dragged.current?.pointer !== event.pointerId || !svg.current) return;
    const node = physical.current.find(item => item.id === dragged.current?.id);
    const matrix = svg.current.getScreenCTM();
    if (!node || !matrix) return;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    node.x = point.x; node.y = point.y; node.vx = 0; node.vy = 0; dirty.current = true;
  };
  const focus = (node: ForceNode | undefined) => { if (node) { setFocused(node.id); elements.current.get(node.id)?.focus(); } };
  return <AuraSurface className="aura-stack"><div className="aura-row"><span className="aura-badge"><GitBranch size={14} />{nodes.length} CONNECTED NODES</span><p id={labelId} className="aura-label">Drag a node. The network follows.</p></div><div className="aura-graph"><svg ref={svg} viewBox="-300 -210 600 420" role="tree" aria-label="Elastic signal network" aria-describedby={labelId}>{nodes.filter(node => node.parentId && nodes.some(parent => parent.id === node.parentId)).map(node => <path key={node.id} ref={element => { if (element) paths.current.set(node.id, element); else paths.current.delete(node.id); }} fill="none" stroke="#a49afa66" strokeWidth="1" vectorEffect="non-scaling-stroke" />)}{nodes.map((node, index) => <g key={node.id} ref={element => { if (element) elements.current.set(node.id, element); else elements.current.delete(node.id); }} className="aura-graph-node" role="treeitem" aria-level={levels.get(node.id) ?? 1} aria-label={node.label} aria-selected={selected === node.id} tabIndex={node.id === focused ? 0 : -1} onFocus={() => setFocused(node.id)} onPointerDown={event => { event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); dragged.current = { id: node.id, pointer: event.pointerId }; focus(node); }} onPointerMove={movePointer} onPointerUp={event => { dragged.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); dirty.current = true; }} onPointerCancel={() => { dragged.current = null; }} onLostPointerCapture={() => { dragged.current = null; }} onKeyDown={event => {
      if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(event.key)) return;
      event.preventDefault(); event.stopPropagation();
      if (event.shiftKey && event.key.startsWith('Arrow')) {
        const item = physical.current.find(value => value.id === node.id); if (item) { item.x += event.key === 'ArrowRight' ? 20 : event.key === 'ArrowLeft' ? -20 : 0; item.y += event.key === 'ArrowDown' ? 20 : event.key === 'ArrowUp' ? -20 : 0; item.vx = 0; item.vy = 0; dirty.current = true; } return;
      }
      if (event.key === 'ArrowRight') focus(nodes.find(item => item.parentId === node.id));
      if (event.key === 'ArrowLeft') focus(nodes.find(item => item.id === node.parentId));
      if (event.key === 'ArrowDown') focus(nodes[Math.min(nodes.length - 1, index + 1)]);
      if (event.key === 'ArrowUp') focus(nodes[Math.max(0, index - 1)]);
      if (event.key === 'Home') focus(nodes[0]); if (event.key === 'End') focus(nodes[nodes.length - 1]);
      if (event.key === 'Enter' || event.key === ' ') setSelected(node.id);
    }}><title>{node.label}</title><circle r="15" fill={selected === node.id ? '#8aeeed' : index === 0 ? '#7365ab' : '#242e47'} stroke={focused === node.id ? '#8aeeed' : '#ae9fff'} strokeWidth="1.3" vectorEffect="non-scaling-stroke" />{nodes.length <= 35 && <text textAnchor="middle" y="34" fontSize="10">{node.label.slice(0, 18)}</text>}</g>)}</svg></div><p className="aura-label" role="status">{selected ? `Selected: ${nodes.find(node => node.id === selected)?.label ?? selected}` : 'Arrows navigate · Shift + arrows move · Enter selects'}</p></AuraSurface>;
}
