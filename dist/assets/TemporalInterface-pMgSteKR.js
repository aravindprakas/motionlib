const e=`import { useId, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, GitBranch, RotateCcw } from 'lucide-react';
import { clamp, useInstrumentMotion } from '@/lib/chatgpt';

export interface Consequence { label: string; value: number; unit: string; favorable: 'higher' | 'lower'; uncertainty: number }
export interface TemporalInterfaceProps { initialAllocation?: number; project: (allocation: number, horizon: number) => Consequence[]; onCommit?: (allocation: number, horizon: number) => void; onUndo?: (allocation: number) => void; decisionLabel?: string }

/** The consequence dial previews causality: the future stretches around a decision,
 * while the committed present stays pinned. Only an explicit commit changes it. */
export function TemporalInterface({ initialAllocation = 40, project, onCommit, onUndo, decisionLabel = 'Focus reserved for exploration' }: TemporalInterfaceProps) {
  const [committed, setCommitted] = useState(clamp(initialAllocation, 0, 100));
  const [allocation, setAllocation] = useState(committed);
  const [horizon, setHorizon] = useState(6);
  const [history, setHistory] = useState<number[]>([]);
  const [message, setMessage] = useState('Explore a possibility. Your present stays put.');
  const id = useId(); const { reduced, transition } = useInstrumentMotion();
  const allocationInput = useRef<HTMLInputElement>(null);
  const clean = (effects: Consequence[]) => effects.filter(effect => Number.isFinite(effect.value) && Number.isFinite(effect.uncertainty));
  const baseline = useMemo(() => clean(project(committed, horizon)), [committed, horizon, project]);
  const future = useMemo(() => clean(project(allocation, horizon)), [allocation, horizon, project]);
  const difference = allocation - committed;
  const commit = () => { if (!difference) return; setHistory(old => [...old, committed].slice(-10)); setCommitted(allocation); onCommit?.(allocation, horizon); setMessage(\`Committed \${allocation}% exploration. This is now your present.\`); allocationInput.current?.focus(); };
  const undo = () => { const previous = history[history.length - 1]; if (previous === undefined) return; setCommitted(previous); setAllocation(previous); setHistory(history.slice(0, -1)); onUndo?.(previous); setMessage(\`Returned to \${previous}% exploration.\`); allocationInput.current?.focus(); };
  return <section className="cg-temporal" aria-label="Temporal interface — consequence dial"><div className="cg-between"><span className="cg-eyebrow"><GitBranch size={13}/> THE CONSEQUENCE DIAL</span><span className="cg-tag">A possible future, held lightly.</span></div>
    <div className="cg-temporal-heading"><h3>Try the future.<br/><em>Before you choose it.</em></h3><p>A decision has a shape. Move the dial to see how it unfolds. Your present only moves when you say so.</p></div>
    <div className="cg-future-field"><div className="cg-present-marker"><span className="cg-eyebrow">PRESENT</span><strong>{committed}%</strong><small>exploration</small><i/></div>
      <svg className="cg-future-branches" viewBox="0 0 600 260" preserveAspectRatio="none" role="img" aria-label={\`Projected effects of \${allocation}% exploration after \${horizon} weeks. Text values appear below.\`}><path d="M0 130H600" className="cg-branch-baseline"/>{future.slice(0, 5).map((effect, index) => { const spread = clamp((index - (future.length - 1) / 2) * 60 + difference * (index % 2 ? 1 : -1), -110, 110); const target = 130 + spread; const uncertainty = clamp(effect.uncertainty * horizon * 1.8, 6, 35); return <g key={effect.label}><motion.path initial={false} animate={{ d: \`M0 130 C200 130,320 \${target},600 \${target} L600 \${target + uncertainty} C320 \${target + uncertainty},200 130,0 130Z\` }} transition={transition} className={\`cg-branch-area cg-branch-\${index % 3}\`}/><motion.path initial={false} animate={{ d: \`M0 130 C200 130,320 \${target},600 \${target}\` }} transition={transition} className={\`cg-branch-line cg-branch-\${index % 3}\`}/><motion.circle initial={false} animate={{ cx: 590, cy: target }} r="4" transition={transition} className={\`cg-branch-point cg-branch-\${index % 3}\`}/></g>; })}<path d="M300 12V248" className="cg-horizon-guide"/></svg>
      <div className="cg-future-marker"><span className="cg-eyebrow">POSSIBLE</span><strong>{allocation}%</strong><small>in {horizon} weeks</small><span>{difference > 0 ? '+' : ''}{difference} points</span></div>
    </div>
    <div className="cg-dial-controls"><label htmlFor={\`\${id}-allocation\`}>{decisionLabel}<output htmlFor={\`\${id}-allocation\`}>{allocation}%</output></label><div className="cg-range-wrap"><input ref={allocationInput} id={\`\${id}-allocation\`} type="range" min={0} max={100} step={1} value={allocation} onChange={e => setAllocation(Number(e.target.value))}/><i className="cg-range-present" style={{ insetInlineStart: \`\${committed}%\` }} aria-hidden="true"/></div><div className="cg-range-labels"><span>Deliver what’s known</span><span>Discover what’s next</span></div><label className="cg-horizon-control" htmlFor={\`\${id}-horizon\`}>Look ahead<input id={\`\${id}-horizon\`} type="range" min={1} max={12} value={horizon} onChange={e => setHorizon(Number(e.target.value))}/><output htmlFor={\`\${id}-horizon\`}>{horizon} weeks</output></label></div>
    <div className="cg-consequences" aria-live="polite" aria-atomic="true">{future.map(effect => { const original = baseline.find(item => item.label === effect.label)?.value ?? effect.value; const delta = effect.value - original; const better = effect.favorable === 'higher' ? delta > 0 : delta < 0; return <div key={effect.label}><span>{effect.label}</span><strong>{effect.value.toFixed(1)}<small>{effect.unit}</small></strong><p className={delta === 0 ? '' : better ? 'is-favorable' : 'is-tradeoff'}>{delta > 0 ? '+' : ''}{delta.toFixed(1)} from present · ±{Math.abs(effect.uncertainty).toFixed(1)}</p></div>; })}</div>
    <div className="cg-temporal-actions"><p role="status">{message}</p><div className="cg-inline"><button className="cg-icon-button" aria-label="Undo last decision" disabled={!history.length} onClick={undo}><RotateCcw size={16}/></button><button className="cg-text-button" disabled={!difference} onClick={() => { setAllocation(committed); setMessage('Possibility released. Your present is unchanged.'); }}>Release</button><button className="cg-button cg-primary" disabled={!difference} onClick={commit}>{difference ? 'Make this the present' : 'You are in the present'}{difference ? <ArrowRight size={15}/> : <Check size={15}/>}</button></div></div>
    {!reduced && <p className="cg-footnote">The widening branches represent uncertainty, not a guaranteed outcome.</p>}
  </section>;
}
`;export{e as default};
