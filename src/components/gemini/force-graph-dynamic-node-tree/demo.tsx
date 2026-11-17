import { useMemo, useState } from 'react';
import { AuraDemo } from '@/lib/gemini/AuraDemo';
import { ForceGraphDynamicNodeTree, makeForceNodes } from './ForceGraphDynamicNodeTree';
export default function Demo() {
  const [count, setCount] = useState(18);
  const nodes = useMemo(() => makeForceNodes(count), [count]);
  return <AuraDemo number="07" title="Force-graph dynamic node tree" description="An elastic network drawn with organic vector tendons. Spatial hashing limits collision work, while the camera expands to include every node."><div className="aura-stack"><ForceGraphDynamicNodeTree nodes={nodes} /><label className="aura-label aura-stack">Network size: {count}<input className="aura-range" type="range" min={3} max={300} value={count} onChange={event => setCount(Number(event.target.value))} /></label></div></AuraDemo>;
}
