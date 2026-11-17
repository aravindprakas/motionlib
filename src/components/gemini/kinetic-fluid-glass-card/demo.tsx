import { useState } from 'react';
import { AuraDemo } from '@/lib/gemini/AuraDemo';
import { KineticFluidGlassCard } from './KineticFluidGlassCard';
export default function Demo() {
  const [long, setLong] = useState(false);
  return <AuraDemo number="01" title="Kinetic fluid glass card" description="Light follows your pointer through a fluid shader. A velocity-aware spring lets the glass settle gently back into place."><div className="aura-stack"><KineticFluidGlassCard title={long ? 'A'.repeat(5000) : undefined} /><button className="aura-button" onClick={() => setLong(value => !value)}>{long ? 'Restore title' : 'Stress test: 5,000 characters'}</button></div></AuraDemo>;
}
