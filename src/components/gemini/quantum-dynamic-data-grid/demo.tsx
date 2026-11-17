import { useMemo, useState } from 'react';
import { AuraDemo } from '@/lib/gemini/AuraDemo';
import { QuantumDynamicDataGrid, makeQuantumData } from './QuantumDynamicDataGrid';
export default function Demo() {
  const [stress, setStress] = useState(false);
  const data = useMemo(() => makeQuantumData(stress ? 10000 : 240, stress ? 50 : 4), [stress]);
  return <AuraDemo number="03" title="Quantum dynamic data grid" description="A sortable signal table with micro-sparklines, column visibility and page scrubbing. Columns stay aligned inside an independently scrolling viewport."><div className="aura-stack"><QuantumDynamicDataGrid {...data} /><button className="aura-button" onClick={() => setStress(value => !value)}>{stress ? 'Restore standard dataset' : 'Stress test: 50 columns / 10,000 rows'}</button></div></AuraDemo>;
}
