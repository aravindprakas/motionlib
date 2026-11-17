import { useState } from 'react';
import { AuraDemo } from '@/lib/gemini/AuraDemo';
import { MagneticHolographicCommandPalette, DEFAULT_COMMANDS } from './MagneticHolographicCommandPalette';
export default function Demo() {
  const [long, setLong] = useState(false);
  return <AuraDemo number="02" title="Magnetic holographic command palette" description="A dock drawn towards your pointer, a searchable keyboard workspace, and a glass dialog that keeps even enormous command titles contained."><div className="aura-stack"><MagneticHolographicCommandPalette commands={long ? [...DEFAULT_COMMANDS, { id: 'long', title: 'Explore '.repeat(500), detail: '500-word title stress test' }] : DEFAULT_COMMANDS} /><button className="aura-button" onClick={() => setLong(value => !value)}>{long ? 'Remove long command' : 'Add 500-word command'}</button></div></AuraDemo>;
}
