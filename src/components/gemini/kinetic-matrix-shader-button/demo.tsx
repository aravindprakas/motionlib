import { useState } from 'react';
import { AuraDemo } from '@/lib/gemini/AuraDemo';
import { KineticMatrixShaderButton } from './KineticMatrixShaderButton';
export default function Demo() {
  const [label, setLabel] = useState('Enter the matrix');
  const [clicks, setClicks] = useState(0);
  return <AuraDemo number="10" title="Kinetic matrix shader button" description="Fluid aura, a resolving text scramble and a pressure-aware spring. Release the action to send a particle shockwave through the surrounding space."><div className="aura-panel aura-stack"><span className="aura-eyebrow">KINETIC ACTION / MATRIX CORE</span><KineticMatrixShaderButton label={label} onClick={() => setClicks(value => value + 1)} /><p className="aura-label" role="status">{clicks ? `Matrix entered ${clicks} ${clicks === 1 ? 'time' : 'times'}.` : 'Hold the action to feel the surface give.'}</p><label className="aura-label aura-stack">Action label<input className="aura-input" value={label} onChange={event => setLabel(event.target.value)} /></label><button className="aura-button" onClick={() => setLabel(previous => previous.length > 100 ? 'Enter the matrix' : 'Open a new dimension '.repeat(250).slice(0, 5000))}>{label.length > 100 ? 'Restore label' : 'Stress test: 5,000-character label'}</button></div></AuraDemo>;
}
