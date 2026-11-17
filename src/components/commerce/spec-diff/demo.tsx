// SpecDiff
import { SpecDiff } from './SpecDiff';

const rows = [
  { label: 'Shell', a: '62% nylon / 38% wool', b: '62% nylon / 38% wool' },
  { label: 'Lining', a: 'Cupro', b: 'Recycled taffeta' },
  { label: 'Weight', a: '1.24 kg', b: '0.98 kg' },
  { label: 'Milled in', a: 'Portugal', b: 'Portugal' },
  { label: 'Closure', a: 'Storm flap · press studs', b: 'Two-way zip' },
  { label: 'Pockets', a: '4 external, 2 internal', b: '4 external, 2 internal' },
  { label: 'Water resistance', a: 'DWR, 5 washes', b: 'DWR, 20 washes' },
  { label: 'Care', a: 'Dry clean', b: 'Dry clean' },
  { label: 'Season', a: 'AW26', b: 'AW26' },
  { label: 'Price', a: '₹18,900', b: '₹21,400' },
];

export default function SpecDiffDemo() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center gap-8 px-10 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.3em]">
        subtract the agreement — what's left is the decision
      </p>
      <SpecDiff names={['Foundry Shell', 'Foundry Shell Pro']} rows={rows} />
    </div>
  );
}
